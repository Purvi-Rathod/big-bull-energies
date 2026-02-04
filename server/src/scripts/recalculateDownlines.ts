/**
 * Script to recalculate all downline counts in the binary tree
 * This will fix any incorrect downline counts by recursively counting all users in each subtree
 * 
 * Usage: npm run recalculate:downlines
 * Or: npx ts-node -r dotenv/config src/scripts/recalculateDownlines.ts
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/User";
import { BinaryTree } from "../models/BinaryTree";
import connectdb from "../db/index";

dotenv.config({ path: "./.env" });

/**
 * Recursively count all users in a subtree (left or right leg)
 * FIXED: Now properly handles admin nodes which can have unlimited children via parent relationship
 */
async function countSubtreeUsers(
  rootUserId: mongoose.Types.ObjectId,
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

    const childId = (childInLeg as any)?.toString() || childInLeg.toString();
    const childObjId = new mongoose.Types.ObjectId(childId);

    // Use iterative BFS approach to handle admin nodes correctly
    const visited = new Set<string>();
    const queue: { userId: mongoose.Types.ObjectId; level: number }[] = [{ userId: childObjId, level: 0 }];
    let count = 0;
    const maxDepth = 100; // Safety limit

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.level >= maxDepth) break;

      const currentIdStr = current.userId.toString();
      if (visited.has(currentIdStr)) continue;
      visited.add(currentIdStr);
      count++; // Count this user

      const currentTree = await BinaryTree.findOne({ user: current.userId })
        .select("leftChild rightChild parent")
        .lean();

      if (!currentTree) continue;

      // Check if this node is admin (can have unlimited children via parent relationship)
      const user = await User.findById(current.userId).select("userId").lean();
      const isAdmin = (user as any)?.userId === "CROWN-000000" || (user as any)?.userId === "CNEOX-000000";

      if (isAdmin) {
        // For admin, check all children via parent relationship
        const adminChildren = await BinaryTree.find({ parent: current.userId })
          .select("user")
          .lean();
        adminChildren.forEach((child: any) => {
          const childId = child.user?.toString() || child.user;
          if (childId && !visited.has(childId)) {
            queue.push({ userId: new mongoose.Types.ObjectId(childId), level: current.level + 1 });
          }
        });
      } else {
        // Regular users: only left and right children
        if (currentTree.leftChild) {
          const leftId = (currentTree.leftChild as any)?.toString() || currentTree.leftChild.toString();
          if (!visited.has(leftId)) {
            queue.push({ userId: new mongoose.Types.ObjectId(leftId), level: current.level + 1 });
          }
        }
        if (currentTree.rightChild) {
          const rightId = (currentTree.rightChild as any)?.toString() || currentTree.rightChild.toString();
          if (!visited.has(rightId)) {
            queue.push({ userId: new mongoose.Types.ObjectId(rightId), level: current.level + 1 });
          }
        }
      }
    }

    return count;
  } catch (error) {
    console.error(`Error counting subtree for ${rootUserId} in ${leg} leg:`, error);
    return 0;
  }
}

/**
 * Update downline counts for a user by recursively counting all users in each leg
 */
async function updateDownlineCounts(userId: mongoose.Types.ObjectId) {
  try {
    const userTree = await BinaryTree.findOne({ user: userId });
    if (!userTree) {
      return;
    }

    // Count all users in left subtree
    const leftCount = await countSubtreeUsers(userId, "left");
    // Count all users in right subtree
    const rightCount = await countSubtreeUsers(userId, "right");

    const oldLeft = userTree.leftDownlines;
    const oldRight = userTree.rightDownlines;

    userTree.leftDownlines = leftCount;
    userTree.rightDownlines = rightCount;
    await userTree.save();

    if (oldLeft !== leftCount || oldRight !== rightCount) {
      const user = await User.findById(userId);
      console.log(
        `Updated ${user?.userId || userId}: Left ${oldLeft} -> ${leftCount}, Right ${oldRight} -> ${rightCount}`
      );
    }
  } catch (error) {
    console.error(`Error updating downline counts for ${userId}:`, error);
  }
}

/**
 * Recursively update downline counts for all users in the tree
 * We process from bottom to top to ensure accurate counts
 */
async function recalculateAllDownlines() {
  try {
    console.log("🌱 Starting downline recalculation...\n");
    await connectdb();
    console.log("✅ Database connected\n");

    // Get all binary tree entries
    const allTrees = await BinaryTree.find({}).populate("user", "userId").lean();
    console.log(`📊 Found ${allTrees.length} binary tree entries\n`);

    // Build a map of users to their depth (for processing from bottom to top)
    const depthMap = new Map<string, number>();
    const visited = new Set<string>();

    const calculateDepth = (userId: mongoose.Types.ObjectId, depth: number = 0): number => {
      const userIdStr = userId.toString();
      if (visited.has(userIdStr)) {
        return depthMap.get(userIdStr) || depth;
      }
      visited.add(userIdStr);

      const tree = allTrees.find((t) => t.user?._id?.toString() === userIdStr || t.user?.toString() === userIdStr);
      if (!tree || !tree.parent) {
        depthMap.set(userIdStr, depth);
        return depth;
      }

      const parentDepth = calculateDepth(tree.parent as mongoose.Types.ObjectId, depth + 1);
      depthMap.set(userIdStr, parentDepth);
      return parentDepth;
    };

    // Calculate depth for all users
    allTrees.forEach((tree) => {
      const userId = (tree.user as any)?._id?.toString() || (tree.user as any)?.toString();
      if (userId) {
        calculateDepth(new mongoose.Types.ObjectId(userId));
      }
    });

    // Sort by depth (deepest first) to process from bottom to top
    const sortedTrees = allTrees.sort((a, b) => {
      const aId = (a.user as any)?._id?.toString() || (a.user as any)?.toString();
      const bId = (b.user as any)?._id?.toString() || (b.user as any)?.toString();
      const aDepth = depthMap.get(aId) || 0;
      const bDepth = depthMap.get(bId) || 0;
      return bDepth - aDepth; // Deepest first
    });

    console.log("🔄 Recalculating downline counts (processing from deepest to shallowest)...\n");

    let updated = 0;
    for (const tree of sortedTrees) {
      const userId = (tree.user as any)?._id || tree.user;
      if (userId) {
        await updateDownlineCounts(userId);
        updated++;
      }
    }

    console.log(`\n✨ Recalculation completed! Updated ${updated} users.\n`);

    // Show summary
    const totalLeft = allTrees.reduce((sum, t) => sum + (t.leftDownlines || 0), 0);
    const totalRight = allTrees.reduce((sum, t) => sum + (t.rightDownlines || 0), 0);
    console.log("📊 Summary:");
    console.log(`   Total Left Downlines: ${totalLeft}`);
    console.log(`   Total Right Downlines: ${totalRight}`);
    console.log(`   Total Downlines: ${totalLeft + totalRight}\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ FATAL ERROR:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  recalculateAllDownlines()
    .then(() => {
      console.log("\n✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Script failed:", error);
      process.exit(1);
    });
}

export { recalculateAllDownlines };

