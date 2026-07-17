import { Types } from "mongoose";
import { User } from "../models/User";
import { BinaryTree } from "../models/BinaryTree";
import { Wallet } from "../models/Wallet";
import { WalletType } from "../models/types";
import { AppError } from "../utils/AppError";
import { findUserByUserId } from "./userId.service";

// Cache for admin user checks (small in-memory cache)
const adminUserCache = new Map<string, boolean>();

/**
 * Check if a user is the admin (BIGBULL-000000 or CNEOX-000000 for backward compatibility)
 * OPTIMIZED: Uses in-memory cache to avoid repeated database queries
 */
async function isAdminUser(userId: Types.ObjectId): Promise<boolean> {
  try {
    const userIdStr = userId.toString();
    
    // Check cache first
    if (adminUserCache.has(userIdStr)) {
      return adminUserCache.get(userIdStr)!;
    }
    
    const user = await User.findById(userId).select("userId").lean();
    const isAdmin = user?.userId === "BIGBULL-000000" || user?.userId === "CROWN-000000" || user?.userId === "CNEOX-000000";
    
    // Cache the result
    adminUserCache.set(userIdStr, isAdmin);
    
    return isAdmin;
  } catch (error) {
    return false;
  }
}

/**
 * Incrementally update downline counts for a user
 * Instead of recursively counting all users, we just increment the count
 * This is MUCH faster for signup operations
 */
async function incrementDownlineCount(userId: Types.ObjectId, leg: "left" | "right") {
  try {
    const userTree = await BinaryTree.findOne({ user: userId });
    if (!userTree) {
      return;
    }

    if (leg === "left") {
      userTree.leftDownlines = (userTree.leftDownlines || 0) + 1;
    } else {
      userTree.rightDownlines = (userTree.rightDownlines || 0) + 1;
    }
    
    await userTree.save();
  } catch (error) {
    console.error("Error incrementing downline count:", error);
  }
}

/**
 * Recursively count all users in a subtree (left or right leg)
 * This counts ALL descendants, not just direct children
 * NOTE: This is kept for backward compatibility but should be avoided during signup
 */
async function countSubtreeUsers(
  rootUserId: Types.ObjectId,
  leg: "left" | "right"
): Promise<number> {
  try {
    const rootTree = await BinaryTree.findOne({ user: rootUserId });
    if (!rootTree) {
      return 0;
    }

    const childInLeg = leg === "left" ? rootTree.leftChild : rootTree.rightChild;
    if (!childInLeg) {
      return 0;
    }

    // Count the direct child (1) plus all its descendants
    const childTree = await BinaryTree.findOne({ user: childInLeg });
    if (!childTree) {
      return 1; // Just the direct child
    }

    // Recursively count left and right subtrees of the child
    const leftCount = await countSubtreeUsers(childInLeg as Types.ObjectId, "left");
    const rightCount = await countSubtreeUsers(childInLeg as Types.ObjectId, "right");

    // Total = 1 (the child itself) + all its descendants
    return 1 + leftCount + rightCount;
  } catch (error) {
    return 0;
  }
}

/**
 * Update downline counts for a user by recursively counting all users in each leg
 * NOTE: This is slow and should only be used for verification/correction, not during signup
 */
async function updateDownlineCounts(userId: Types.ObjectId) {
  try {
    const userTree = await BinaryTree.findOne({ user: userId });
    if (!userTree) {
      return;
    }

    // Count all users in left subtree
    const leftCount = await countSubtreeUsers(userId, "left");
    // Count all users in right subtree
    const rightCount = await countSubtreeUsers(userId, "right");

    userTree.leftDownlines = leftCount;
    userTree.rightDownlines = rightCount;
    await userTree.save();
  } catch (error) {
    console.error("Error updating downline counts:", error);
  }
}

/**
 * OPTIMIZED: Incrementally update downline counts for all ancestors up the tree
 * When a new user is added, we increment counts for all parents
 * 
 * Performance Optimization:
 * - Before: N database queries (one per ancestor)
 * - After: 2 batch queries (collect ancestors + batch load all trees)
 */
async function updateAncestorDownlineCounts(
  userId: Types.ObjectId,
  position: "left" | "right" | null,
  visited: Set<string> = new Set()
) {
  try {
    if (!position) {
      return; // No position to update
    }

    const userIdStr = userId.toString();
    if (visited.has(userIdStr)) {
      return; // Avoid infinite loops
    }
    visited.add(userIdStr);

    // STEP 1: Collect all ancestor IDs by following parent chain (single query per level)
    const ancestorChain: Types.ObjectId[] = [];
    const allNodeIds = new Set<string>([userIdStr]);
    let currentUserId: Types.ObjectId | null = userId;
    const maxDepth = 50; // Safety limit
    let depth = 0;

    while (currentUserId && depth < maxDepth) {
      const currentTree = await BinaryTree.findOne({ user: currentUserId })
        .select("parent")
        .lean();
      
      if (!currentTree || !currentTree.parent) {
        break; // Reached root
      }

      const parentId = currentTree.parent as Types.ObjectId;
      const parentIdStr = parentId.toString();
      
      if (allNodeIds.has(parentIdStr)) {
        break; // Circular reference detected
      }
      
      allNodeIds.add(parentIdStr);
      ancestorChain.push(parentId);
      currentUserId = parentId;
      depth++;
    }

    if (ancestorChain.length === 0) {
      return; // No ancestors to update
    }

    // STEP 2: Batch load ALL trees we need (ancestors + their parents for position determination)
    const allAncestorIds = Array.from(allNodeIds).map(id => new Types.ObjectId(id));
    
    // Also need to load parents of ancestors to determine positions
    const ancestorTreesWithParents = await BinaryTree.find({
      $or: [
        { user: { $in: allAncestorIds } },
        { user: { $in: ancestorChain } }
      ]
    })
      .select("user parent leftChild rightChild")
      .lean();

    // Create maps for O(1) lookup
    const treeMap = new Map<string, any>();
    ancestorTreesWithParents.forEach((tree: any) => {
      const userId = (tree.user as any)?.toString() || tree.user?.toString();
      treeMap.set(userId, tree);
    });

    // STEP 3: Determine position for each ancestor by traversing up in memory
    const leftUpdates: Types.ObjectId[] = [];
    const rightUpdates: Types.ObjectId[] = [];
    
    let currentNodeId: Types.ObjectId = userId;
    let currentPosition: "left" | "right" | null = position;

    for (const ancestorId of ancestorChain) {
      if (!currentPosition) break;

      const ancestorIdStr = ancestorId.toString();
      const ancestorTree = treeMap.get(ancestorIdStr);
      
      if (!ancestorTree) {
        break; // Tree not found
      }

      // Add this ancestor to update list with current position
      if (currentPosition === "left") {
        leftUpdates.push(ancestorId);
      } else {
        rightUpdates.push(ancestorId);
      }

      // Determine ancestor's position relative to its parent for next iteration
      if (ancestorTree.parent) {
        const parentIdStr = (ancestorTree.parent as any)?.toString() || ancestorTree.parent?.toString();
        const parentTree = treeMap.get(parentIdStr);
        
        if (parentTree) {
          // Check if ancestor is left or right child of its parent
          currentPosition = 
            parentTree.leftChild?.toString() === ancestorIdStr ? "left" :
            parentTree.rightChild?.toString() === ancestorIdStr ? "right" :
            null;
        } else {
          break; // Parent tree not loaded
        }
      } else {
        break; // Reached root
      }

      currentNodeId = ancestorId;
    }

    // STEP 4: Batch update all ancestors
    const updatePromises: Promise<any>[] = [];

    if (leftUpdates.length > 0) {
      updatePromises.push(
        BinaryTree.updateMany(
          { user: { $in: leftUpdates } },
          { $inc: { leftDownlines: 1 } }
        )
      );
    }

    if (rightUpdates.length > 0) {
      updatePromises.push(
        BinaryTree.updateMany(
          { user: { $in: rightUpdates } },
          { $inc: { rightDownlines: 1 } }
        )
      );
    }

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error updating ancestor downline counts:", error);
  }
}

/**
 * Initialize binary tree entry for a new user
 * Special case: If parent is admin (BIGBULL-000000 or CNEOX-000000), no binary tree constraints apply
 * All other nodes must follow binary tree rules (max 2 children: left and right)
 */
export async function initializeBinaryTree(userId: Types.ObjectId, referrerId?: Types.ObjectId | null, position?: "left" | "right" | null) {
  try {
    // Create binary tree entry
    const binaryTree = await BinaryTree.create({
      user: userId,
      parent: referrerId || null,
      leftChild: null,
      rightChild: null,
      leftBusiness: "0",
      rightBusiness: "0",
      leftPowerlegBusiness: "0",
      rightPowerlegBusiness: "0",
      leftCarry: "0",
      rightCarry: "0",
      leftDownlines: 0,
      rightDownlines: 0,
      matchingDue: "0",
      cappingLimit: "0",
    });

    // If referrer is provided, update referrer's tree
    if (referrerId) {
      const referrerTree = await BinaryTree.findOne({ user: referrerId });
      if (referrerTree) {
        const referrerIsAdmin = await isAdminUser(referrerId);
        
        if (referrerIsAdmin) {
          // Admin can have unlimited children - no binary tree constraints
          // Increment downlines count instead of recounting (much faster)
          referrerTree.leftDownlines = (referrerTree.leftDownlines || 0) + 1;
          await referrerTree.save();
        } else {
          // For non-admin parents, enforce binary tree rules (left/right only)
        if (position === "left") {
            if (referrerTree.leftChild) {
              throw new AppError("Left position already occupied. Binary tree constraint violated.", 400);
            }
          referrerTree.leftChild = userId;
            // Increment downline count instead of recounting (much faster)
            referrerTree.leftDownlines = (referrerTree.leftDownlines || 0) + 1;
            await referrerTree.save();
        } else if (position === "right") {
            if (referrerTree.rightChild) {
              throw new AppError("Right position already occupied. Binary tree constraint violated.", 400);
            }
          referrerTree.rightChild = userId;
            // Increment downline count instead of recounting (much faster)
            referrerTree.rightDownlines = (referrerTree.rightDownlines || 0) + 1;
        await referrerTree.save();
          } else {
            throw new AppError("Position (left or right) is required for non-admin parents.", 400);
          }
        }

        // Incrementally update downline counts for all ancestors up the tree
        // This is MUCH faster than recursively counting all users
        await updateAncestorDownlineCounts(referrerId, position);
      }
    }

    return binaryTree;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to initialize binary tree", 500);
  }
}

/**
 * Initialize default wallets for a new user
 */
export async function initializeWallets(userId: Types.ObjectId) {
  try {
    const defaultWallets = [
      { type: WalletType.WITHDRAWAL, balance: "0", reserved: "0", currency: "USD" },
      { type: WalletType.ROI, balance: "0", reserved: "0", currency: "USD" },
      { type: WalletType.INTEREST, balance: "0", reserved: "0", currency: "USD" },
      { type: WalletType.REFERRAL, balance: "0", reserved: "0", currency: "USD" },
      { type: WalletType.BINARY, balance: "0", reserved: "0", currency: "USD" },
      { type: WalletType.TOKEN, balance: "0", reserved: "0", currency: "USD" },
      { type: WalletType.INVESTMENT, balance: "0", reserved: "0", currency: "USD" },
      { type: WalletType.CAREER_LEVEL, balance: "0", reserved: "0", currency: "USD" },
      { type: WalletType.MAIN, balance: "5", reserved: "0", currency: "USD" }, // New users get $5 free in main wallet
      { type: WalletType.FIXED, balance: "0", reserved: "0", currency: "USD" }, // Admin-only; no withdraw, no ROI
    ];

    const wallets = await Promise.all(
      defaultWallets.map((wallet) =>
        Wallet.create({
          user: userId,
          ...wallet,
        })
      )
    );

    return wallets;
  } catch (error) {
    throw new AppError("Failed to initialize wallets", 500);
  }
}

/**
 * Find the next available position for a user in the binary tree
 * Special case: If referrer is admin, return null (admin can have unlimited children, no position needed)
 * For non-admin referrers, finds the first available left or right position
 */
export async function findAvailablePosition(referrerId: Types.ObjectId): Promise<"left" | "right" | null> {
  try {
    const referrerIsAdmin = await isAdminUser(referrerId);
    
    // Admin can have unlimited children - no position constraint
    if (referrerIsAdmin) {
      return null; // No position needed for admin children
    }

    const referrerTree = await BinaryTree.findOne({ user: referrerId });
    if (!referrerTree) {
      return null;
    }

    // For non-admin: enforce binary tree rules
    // If left is available, return left
    if (!referrerTree.leftChild) {
      return "left";
    }

    // If right is available, return right
    if (!referrerTree.rightChild) {
      return "right";
    }

    // Both positions are filled, return null (should find next available position in downline)
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * OPTIMIZED: Find the deepest available position in a specific leg (left or right) of the tree
 * This function batch loads all nodes in the leg path upfront, then traverses in memory
 * 
 * Performance Optimization:
 * - Before: N database queries (one per node in the leg path)
 * - After: 1-2 batch queries (loads entire leg path at once)
 * 
 * Algorithm:
 * 1. Batch load all nodes in the leg path (left or right chain)
 * 2. Traverse in memory to find first available slot
 * 
 * Example: 
 * - A has B (right) and C (left)
 * - A refers D in "right" -> D goes to B's right position (B is in A's right, D goes to B's right)
 * - B refers E in "right" -> E goes to D's right position (D is in B's right, E goes to D's right)
 */
export async function findDeepestAvailablePositionInLeg(
  rootUserId: Types.ObjectId,
  requestedPosition: "left" | "right"
): Promise<{ parentId: Types.ObjectId; position: "left" | "right" } | null> {
  try {
    // OPTIMIZATION: Use iterative approach with batch loading by level
    const maxDepth = 10000; // Safety limit
    let currentLevelUserIds: Types.ObjectId[] = [rootUserId];
    let depth = 0;

    // Build the leg path level by level with batch loading
    while (currentLevelUserIds.length > 0 && depth < maxDepth) {
      // Batch load all trees at current level
      const currentLevelTrees = await BinaryTree.find({
        user: { $in: currentLevelUserIds }
      })
        .select("user leftChild rightChild")
        .lean();

      const nextLevelUserIds: Types.ObjectId[] = [];

      // Check each node at current level
      for (const tree of currentLevelTrees) {
        const userId = (tree.user as any)?.toString() || tree.user?.toString();
        const treeUserId = new Types.ObjectId(userId);

        // Check if requested position is available at this node
        const childInPosition = requestedPosition === "left" 
          ? tree.leftChild 
          : tree.rightChild;

        if (!childInPosition) {
          // Found available position!
          return { 
            parentId: treeUserId, 
            position: requestedPosition 
          };
        }

        // Position is occupied, add child to next level for next iteration
        const childId = childInPosition as Types.ObjectId;
        nextLevelUserIds.push(childId);
      }

      // Move to next level
      currentLevelUserIds = nextLevelUserIds;
  
      depth++;
    }

    if (depth == 10000) {
      console.log("This is the 10000th level");
      console.log("currentLevelUserIds", currentLevelUserIds);
      console.log("depth", depth);
    }

    // No available position found in the requested leg (reached max depth or end of tree)
    return null;
  } catch (error) {
    console.error("Error in findDeepestAvailablePositionInLeg:", error);
    return null;
  }
}

/**
 * OPTIMIZED: Find the next available position in a binary tree using BFS with batch loading
 * This will traverse the tree level-by-level to find the first available slot
 * Used when no specific position is requested
 * 
 * Performance Optimization:
 * - Before: N database queries (one per node visited)
 * - After: ~depth queries (one per level, typically 5-10 queries)
 */
export async function findNextAvailablePositionInTree(
  rootUserId: Types.ObjectId,
  visited: Set<string> = new Set(),
  maxDepth: number = 20
): Promise<{ parentId: Types.ObjectId; position: "left" | "right" } | null> {
  try {
    // OPTIMIZATION: Use BFS (level-by-level) with batch loading
    const queue: { userId: Types.ObjectId; level: number }[] = [
      { userId: rootUserId, level: 0 }
    ];
    const processed = new Set<string>();

    while (queue.length > 0 && queue[0].level < maxDepth) {
      const currentLevel = queue[0].level;
      const currentLevelNodes: Types.ObjectId[] = [];

      // Collect all nodes at current level
      while (queue.length > 0 && queue[0].level === currentLevel) {
        const node = queue.shift()!;
        const nodeIdStr = node.userId.toString();
        
        if (visited.has(nodeIdStr) || processed.has(nodeIdStr)) {
          continue;
        }
        
        visited.add(nodeIdStr);
        processed.add(nodeIdStr);
        currentLevelNodes.push(node.userId);
      }

      if (currentLevelNodes.length === 0) break;

      // OPTIMIZATION: Batch load all trees at current level
      const currentLevelTrees = await BinaryTree.find({
        user: { $in: currentLevelNodes }
      })
        .select("user leftChild rightChild")
        .lean();

      // Check for available positions at current level
      for (const tree of currentLevelTrees) {
        const userId = (tree.user as any)?.toString() || tree.user?.toString();
        const treeUserId = new Types.ObjectId(userId);

        // Check left position first
        if (!tree.leftChild) {
          return { parentId: treeUserId, position: "left" };
        }

        // Check right position
        if (!tree.rightChild) {
          return { parentId: treeUserId, position: "right" };
        }

        // Add children to queue for next level
        if (tree.leftChild) {
          const leftId = (tree.leftChild as any)?.toString() || tree.leftChild?.toString();
          if (!processed.has(leftId)) {
            queue.push({ userId: new Types.ObjectId(leftId), level: currentLevel + 1 });
          }
        }
        if (tree.rightChild) {
          const rightId = (tree.rightChild as any)?.toString() || tree.rightChild?.toString();
          if (!processed.has(rightId)) {
            queue.push({ userId: new Types.ObjectId(rightId), level: currentLevel + 1 });
          }
        }
      }
    }

    // No available position found
    return null;
  } catch (error) {
    console.error("Error in findNextAvailablePositionInTree:", error);
    return null;
  }
}

/**
 * Get or create admin user (BIGBULL-000000 or CNEOX-000000 for backward compatibility)
 * This is the root node that all users without sponsors will be attached to
 */
export async function getAdminUser(): Promise<Types.ObjectId | null> {
  try {
    let adminUser =
      (await findUserByUserId("BIGBULL-000000")) ||
      (await findUserByUserId("CROWN-000000")) ||
      (await findUserByUserId("CNEOX-000000"));
    if (!adminUser) {
      throw new AppError("Admin user (BIGBULL-000000) not found. Please create admin user first.", 500);
    }
    return adminUser._id as Types.ObjectId;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    return null;
  }
}

/**
 * Complete user initialization: binary tree + wallets
 * If no referrer is provided, the user will be placed under admin (BIGBULL-000000 or CNEOX-000000)
 * Exception: If the user being initialized IS the admin (BIGBULL-000000 or CNEOX-000000), they will have no parent
 */
export async function initializeUser(userId: Types.ObjectId, referrerId?: Types.ObjectId | null, position?: "left" | "right" | null) {
  try {
    // Check if this user is the admin user (BIGBULL-000000 or CNEOX-000000)
    const user = await User.findById(userId);
    const userIsAdmin = user?.userId === "BIGBULL-000000" || user?.userId === "CROWN-000000" || user?.userId === "CNEOX-000000";

    let finalReferrerId = referrerId;
    let finalPosition = position;

    // If this is the admin user, they should have no parent
    if (userIsAdmin) {
      finalReferrerId = null;
      finalPosition = null;
    } else if (!finalReferrerId) {
      // If no referrer is provided and this is NOT admin, assign admin (BIGBULL-000000 or CNEOX-000000) as the parent
      const adminId = await getAdminUser();
      if (!adminId) {
        throw new AppError("Failed to find admin user. Cannot initialize user without referrer.", 500);
      }
      finalReferrerId = adminId;
      // Admin can have unlimited children - no position needed
      finalPosition = null;
    } else {
      // If referrer is provided, check if it's admin
      const referrerIsAdmin = await isAdminUser(finalReferrerId);
      
      if (referrerIsAdmin) {
        // Admin can have unlimited children - no position needed
        finalPosition = null;
      } else {
        // For non-admin referrers, enforce binary tree rules
        if (!finalPosition) {
          // No position specified, find any available position
          finalPosition = await findAvailablePosition(finalReferrerId);
          if (!finalPosition) {
            // If direct positions are full, find next available in the referrer's tree
            const availablePosition = await findNextAvailablePositionInTree(finalReferrerId);
            if (availablePosition) {
              finalReferrerId = availablePosition.parentId;
              finalPosition = availablePosition.position;
            } else {
              throw new AppError("No available position in referrer's binary tree.", 500);
            }
          }
        } else {
          // Position is specified (left or right)
          // Check if the direct position is available
          const referrerTree = await BinaryTree.findOne({ user: finalReferrerId });
          if (referrerTree) {
            const directPositionAvailable = finalPosition === "left" 
              ? !referrerTree.leftChild 
              : !referrerTree.rightChild;

            if (!directPositionAvailable) {
              // Direct position is occupied, find the deepest available position in that leg
              const availablePosition = await findDeepestAvailablePositionInLeg(
                finalReferrerId,
                finalPosition
              );
              
              if (availablePosition) {
                finalReferrerId = availablePosition.parentId;
                finalPosition = availablePosition.position;
              } else {
                throw new AppError(
                  `No available position in the ${finalPosition} leg of referrer's binary tree.`,
                  500
                );
              }
            }
          }
        }
      }
    }

    // Initialize binary tree
    await initializeBinaryTree(userId, finalReferrerId, finalPosition || undefined);

    // Initialize wallets
    await initializeWallets(userId);

    return { position: finalPosition };
  } catch (error) {
    // If initialization fails, we should rollback user creation
    // For now, we'll throw the error and let the caller handle it
    throw error;
  }
}

