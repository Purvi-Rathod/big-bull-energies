/**
 * Diagnostic Script: Binary Tree Business Volume Analysis
 * 
 * Diagnoses binary tree business volume calculations for a user and all their downlines:
 * 1. Calculates expected business volume from actual investments
 * 2. Compares with stored business volume (leftBusiness, rightBusiness)
 * 3. Checks downline counts (leftDownlines, rightDownlines)
 * 4. Verifies carry forward and matched amounts
 * 5. Identifies miscalculations and generates action report
 * 
 * Usage: npx ts-node -r dotenv/config src/scripts/diagnoseBinaryTree.ts [userId]
 * Example: npx ts-node -r dotenv/config src/scripts/diagnoseBinaryTree.ts CROWN-000282
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Types } from "mongoose";
import * as path from "path";
import * as fs from "fs";
import { User } from "../models/User";
import { BinaryTree } from "../models/BinaryTree";
import { Investment } from "../models/Investment";

// Load environment variables
try {
  dotenv.config({ path: path.join(__dirname, '../../../.env') });
} catch (e) {}
try {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
} catch (e) {}
dotenv.config();

// Prioritize production database
const MONGODB_URI = process.env.MONGODB_URL_PRODUCTION || process.env.MONGODB_URL_DEVELOPMENT || process.env.MONGODB_URI || "mongodb://localhost:27017/crown-bankers";

interface UserDiagnostic {
  userId: string;
  name: string;
  userObjId: Types.ObjectId;
  level: number;
  position: "left" | "right" | "root" | null;
  
  // Investment data
  totalInvestment: number;
  activeInvestments: number;
  inactiveInvestments: number;
  
  // Stored tree data
  storedLeftBusiness: number;
  storedRightBusiness: number;
  storedLeftPowerlegBusiness: number;
  storedRightPowerlegBusiness: number;
  storedLeftDownlines: number;
  storedRightDownlines: number;
  storedLeftCarry: number;
  storedRightCarry: number;
  storedLeftMatched: number;
  storedRightMatched: number;
  
  // Calculated expected data
  expectedLeftBusiness: number;
  expectedRightBusiness: number;
  expectedLeftDownlines: number;
  expectedRightDownlines: number;
  
  // Issues found
  issues: string[];
  actions: string[];
}

interface DiagnosticReport {
  rootUser: UserDiagnostic;
  allUsers: Map<string, UserDiagnostic>;
  totalIssues: number;
  summary: {
    usersWithIssues: number;
    businessVolumeMismatches: number;
    downlineCountMismatches: number;
    carryForwardIssues: number;
    investmentIssues: number;
  };
}

/**
 * Recursively get all downlines of a user
 * This function traverses the entire tree structure to find ALL nested downlines
 */
async function getAllDownlines(
  rootUserId: Types.ObjectId,
  visited: Set<string> = new Set(),
  level: number = 0,
  maxDepth: number = 100,
  log: boolean = false,
  indent: string = ""
): Promise<Map<string, { userId: Types.ObjectId; level: number; position: "left" | "right" | "root" | null }>> {
  const downlines = new Map<string, { userId: Types.ObjectId; level: number; position: "left" | "right" | "root" | null }>();
  
  if (level >= maxDepth) {
    if (log) {
      console.log(`${indent}⚠️  Max depth reached (${maxDepth})`);
    }
    return downlines;
  }
  
  const rootIdStr = rootUserId.toString();
  if (visited.has(rootIdStr)) {
    if (log) {
      console.log(`${indent}⚠️  Already visited ${rootIdStr}, skipping to avoid circular reference`);
    }
    return downlines; // Avoid circular references
  }
  visited.add(rootIdStr);
  
  const user = await User.findById(rootUserId).select("userId name").lean();
  const userDisplayId = (user as any)?.userId || rootIdStr;
  
  const tree = await BinaryTree.findOne({ user: rootUserId })
    .select("leftChild rightChild parent")
    .lean();
  
  if (!tree) {
    if (log) {
      console.log(`${indent}⚠️  No binary tree found for ${userDisplayId}`);
    }
    return downlines;
  }
  
  if (log) {
    console.log(`${indent}🔍 Checking ${userDisplayId} (Level ${level})...`);
  }
  
  // Check if admin (can have unlimited children via parent relationship)
  const isAdmin = (user as any)?.userId === "CROWN-000000" || (user as any)?.userId === "CNEOX-000000";
  
  if (isAdmin) {
    // For admin, get all children via parent relationship
    const adminChildren = await BinaryTree.find({ parent: rootUserId })
      .select("user")
      .lean();
    
    if (log) {
      console.log(`${indent}   👑 Admin user - found ${adminChildren.length} children via parent relationship`);
    }
    
    for (const child of adminChildren) {
      const childId = child.user?.toString() || (child.user as any)?.toString();
      if (childId && !visited.has(childId)) {
        const childObjId = new Types.ObjectId(childId);
        const childUser = await User.findById(childObjId).select("userId name").lean();
        const childDisplayId = (childUser as any)?.userId || childId;
        
        downlines.set(childId, { userId: childObjId, level: level + 1, position: "root" });
        
        if (log) {
          console.log(`${indent}   ✅ Found child: ${childDisplayId} (Level ${level + 1})`);
        }
        
        // Recursively get their downlines (all nested levels)
        const childDownlines = await getAllDownlines(childObjId, visited, level + 1, maxDepth, log, indent + "   ");
        childDownlines.forEach((value, key) => {
          downlines.set(key, value);
        });
      }
    }
  } else {
    // Regular users: only left and right children
    if (tree.leftChild) {
      const leftId = (tree.leftChild as any)?.toString() || tree.leftChild.toString();
      if (!visited.has(leftId)) {
        const leftObjId = new Types.ObjectId(leftId);
        const leftUser = await User.findById(leftObjId).select("userId name").lean();
        const leftDisplayId = (leftUser as any)?.userId || leftId;
        
        downlines.set(leftId, { userId: leftObjId, level: level + 1, position: "left" });
        
        if (log) {
          console.log(`${indent}   ⬅️  Found LEFT child: ${leftDisplayId} (Level ${level + 1})`);
        }
        
        // Recursively get left child's downlines (all nested levels)
        const leftDownlines = await getAllDownlines(leftObjId, visited, level + 1, maxDepth, log, indent + "   ");
        leftDownlines.forEach((value, key) => {
          downlines.set(key, value);
        });
      } else if (log) {
        console.log(`${indent}   ⬅️  LEFT child ${leftId} already visited`);
      }
    } else if (log) {
      console.log(`${indent}   ⬅️  No LEFT child`);
    }
    
    if (tree.rightChild) {
      const rightId = (tree.rightChild as any)?.toString() || tree.rightChild.toString();
      if (!visited.has(rightId)) {
        const rightObjId = new Types.ObjectId(rightId);
        const rightUser = await User.findById(rightObjId).select("userId name").lean();
        const rightDisplayId = (rightUser as any)?.userId || rightId;
        
        downlines.set(rightId, { userId: rightObjId, level: level + 1, position: "right" });
        
        if (log) {
          console.log(`${indent}   ➡️  Found RIGHT child: ${rightDisplayId} (Level ${level + 1})`);
        }
        
        // Recursively get right child's downlines (all nested levels)
        const rightDownlines = await getAllDownlines(rightObjId, visited, level + 1, maxDepth, log, indent + "   ");
        rightDownlines.forEach((value, key) => {
          downlines.set(key, value);
        });
      } else if (log) {
        console.log(`${indent}   ➡️  RIGHT child ${rightId} already visited`);
      }
    } else if (log) {
      console.log(`${indent}   ➡️  No RIGHT child`);
    }
  }
  
  return downlines;
}

/**
 * Calculate expected business volume for a user from their downlines' investments
 * Business volume = sum of ALL investments from users in that leg (left or right subtree)
 * 
 * This function recursively traverses ALL nested levels:
 * - For left child: Gets their investment + all investments from their left subtree + all investments from their right subtree
 * - For right child: Gets their investment + all investments from their left subtree + all investments from their right subtree
 * - Continues recursively through all nested downlines
 * 
 * According to RULEBOOK.md:
 * - When a user invests, their investment amount is added to parent's business volume
 * - BV is added to parent's leg based on user's position (left or right)
 * - BV is cumulative and never decreases
 * 
 * So for a user:
 * - leftBusiness = sum of ALL investments from ALL users in their left subtree (at any nested level)
 * - rightBusiness = sum of ALL investments from ALL users in their right subtree (at any nested level)
 */
async function calculateExpectedBusinessVolume(
  userId: Types.ObjectId,
  allUsers: Map<string, UserDiagnostic>,
  userMap: Map<string, { userId: Types.ObjectId; level: number; position: "left" | "right" | "root" | null }>,
  log: boolean = false,
  indent: string = ""
): Promise<{ left: number; right: number; leftDownlines: number; rightDownlines: number }> {
  const userIdStr = userId.toString();
  const userInfo = userMap.get(userIdStr);
  
  if (!userInfo) {
    return { left: 0, right: 0, leftDownlines: 0, rightDownlines: 0 };
  }
  
  const user = await User.findById(userId).select("userId name").lean();
  const userDisplayId = (user as any)?.userId || userIdStr;
  
  if (log) {
    console.log(`${indent}📊 Calculating BV for ${userDisplayId} (Level ${userInfo.level})...`);
  }
  
  const tree = await BinaryTree.findOne({ user: userId })
    .select("leftChild rightChild")
    .lean();
  
  if (!tree) {
    if (log) {
      console.log(`${indent}   ⚠️  No binary tree found`);
    }
    return { left: 0, right: 0, leftDownlines: 0, rightDownlines: 0 };
  }
  
  let leftBV = 0;
  let rightBV = 0;
  let leftCount = 0;
  let rightCount = 0;
  
  // Check if admin
  const isAdmin = (user as any)?.userId === "CROWN-000000" || (user as any)?.userId === "CNEOX-000000";
  
  if (isAdmin) {
    // For admin, get all children via parent relationship
    const adminChildren = await BinaryTree.find({ parent: userId })
      .select("user")
      .lean();
    
    if (log) {
      console.log(`${indent}   👑 Admin user - processing ${adminChildren.length} children`);
    }
    
    for (const child of adminChildren) {
      const childId = child.user?.toString() || (child.user as any)?.toString();
      if (childId) {
        const childInfo = userMap.get(childId);
        if (childInfo) {
          const childUser = await User.findById(childId).select("userId name").lean();
          const childDisplayId = (childUser as any)?.userId || childId;
          
          // Get child's own investment
          const childDiagnostic = allUsers.get(childId);
          const childInvestment = childDiagnostic ? childDiagnostic.totalInvestment : 0;
          
          if (log && childInvestment > 0) {
            console.log(`${indent}   👤 Child ${childDisplayId}: Own investment = $${childInvestment.toFixed(2)}`);
          }
          
          // Recursively get ALL investments from child's ENTIRE subtree (all nested levels)
          // This will traverse down through all downlines of downlines
          const childBV = await calculateExpectedBusinessVolume(
            new Types.ObjectId(childId),
            allUsers,
            userMap,
            log,
            indent + "   "
          );
          
          // Total BV from this child = child's own investment + all investments from child's left subtree + all investments from child's right subtree
          const totalChildBV = childInvestment + childBV.left + childBV.right;
          leftBV += totalChildBV; // Admin children go to left (or determine position if needed)
          leftCount += 1 + childBV.leftDownlines + childBV.rightDownlines;
          
          if (log && totalChildBV > 0) {
            console.log(`${indent}   ✅ Child ${childDisplayId} TOTAL subtree BV: $${totalChildBV.toFixed(2)}`);
            console.log(`${indent}      Breakdown: $${childInvestment.toFixed(2)} (own) + $${childBV.left.toFixed(2)} (left subtree) + $${childBV.right.toFixed(2)} (right subtree)`);
          }
        }
      }
    }
  } else {
    // Regular users: process left and right children separately
    // LEFT SIDE - Traverse all nested levels
    if (tree.leftChild) {
      const leftId = (tree.leftChild as any)?.toString() || tree.leftChild.toString();
      const leftInfo = userMap.get(leftId);
      
      if (leftInfo) {
        const leftUser = await User.findById(leftId).select("userId name").lean();
        const leftDisplayId = (leftUser as any)?.userId || leftId;
        
        if (log) {
          console.log(`${indent}   ⬅️  Processing LEFT child: ${leftDisplayId}`);
        }
        
        // Get left child's own investment
        const leftDiagnostic = allUsers.get(leftId);
        const leftChildInvestment = leftDiagnostic ? leftDiagnostic.totalInvestment : 0;
        
        if (log && leftChildInvestment > 0) {
          console.log(`${indent}      💰 ${leftDisplayId} own investment: $${leftChildInvestment.toFixed(2)}`);
        }
        
        // Recursively get ALL investments from left child's ENTIRE subtree (all nested levels)
        // This will go down through left child's left child, left child's right child,
        // and all their nested downlines, downlines of downlines, etc.
        const leftChildBV = await calculateExpectedBusinessVolume(
          new Types.ObjectId(leftId),
          allUsers,
          userMap,
          log,
          indent + "      "
        );
        
        // Left BV = left child's own investment + ALL investments from left child's left subtree + ALL investments from left child's right subtree
        // This includes investments from ALL nested levels
        const totalLeftBV = leftChildInvestment + leftChildBV.left + leftChildBV.right;
        leftBV = totalLeftBV;
        leftCount = 1 + leftChildBV.leftDownlines + leftChildBV.rightDownlines;
        
        if (log) {
          console.log(`${indent}      ✅ LEFT subtree TOTAL BV: $${totalLeftBV.toFixed(2)}`);
          console.log(`${indent}         Breakdown: $${leftChildInvestment.toFixed(2)} (${leftDisplayId} own)`);
          if (leftChildBV.left > 0) {
            console.log(`${indent}                  + $${leftChildBV.left.toFixed(2)} (from ${leftDisplayId}'s left downlines)`);
          }
          if (leftChildBV.right > 0) {
            console.log(`${indent}                  + $${leftChildBV.right.toFixed(2)} (from ${leftDisplayId}'s right downlines)`);
          }
        }
      }
    }
    
    // RIGHT SIDE - Traverse all nested levels
    if (tree.rightChild) {
      const rightId = (tree.rightChild as any)?.toString() || tree.rightChild.toString();
      const rightInfo = userMap.get(rightId);
      
      if (rightInfo) {
        const rightUser = await User.findById(rightId).select("userId name").lean();
        const rightDisplayId = (rightUser as any)?.userId || rightId;
        
        if (log) {
          console.log(`${indent}   ➡️  Processing RIGHT child: ${rightDisplayId}`);
        }
        
        // Get right child's own investment
        const rightDiagnostic = allUsers.get(rightId);
        const rightChildInvestment = rightDiagnostic ? rightDiagnostic.totalInvestment : 0;
        
        if (log && rightChildInvestment > 0) {
          console.log(`${indent}      💰 ${rightDisplayId} own investment: $${rightChildInvestment.toFixed(2)}`);
        }
        
        // Recursively get ALL investments from right child's ENTIRE subtree (all nested levels)
        // This will go down through right child's left child, right child's right child,
        // and all their nested downlines, downlines of downlines, etc.
        const rightChildBV = await calculateExpectedBusinessVolume(
          new Types.ObjectId(rightId),
          allUsers,
          userMap,
          log,
          indent + "      "
        );
        
        // Right BV = right child's own investment + ALL investments from right child's left subtree + ALL investments from right child's right subtree
        // This includes investments from ALL nested levels
        const totalRightBV = rightChildInvestment + rightChildBV.left + rightChildBV.right;
        rightBV = totalRightBV;
        rightCount = 1 + rightChildBV.leftDownlines + rightChildBV.rightDownlines;
        
        if (log) {
          console.log(`${indent}      ✅ RIGHT subtree TOTAL BV: $${totalRightBV.toFixed(2)}`);
          console.log(`${indent}         Breakdown: $${rightChildInvestment.toFixed(2)} (${rightDisplayId} own)`);
          if (rightChildBV.left > 0) {
            console.log(`${indent}                  + $${rightChildBV.left.toFixed(2)} (from ${rightDisplayId}'s left downlines)`);
          }
          if (rightChildBV.right > 0) {
            console.log(`${indent}                  + $${rightChildBV.right.toFixed(2)} (from ${rightDisplayId}'s right downlines)`);
          }
        }
      }
    }
  }
  
  if (log) {
    console.log(`${indent}📈 ${userDisplayId} FINAL RESULT:`);
    console.log(`${indent}   Left BV = $${leftBV.toFixed(2)} (from ${leftCount} downlines)`);
    console.log(`${indent}   Right BV = $${rightBV.toFixed(2)} (from ${rightCount} downlines)`);
  }
  
  return { left: leftBV, right: rightBV, leftDownlines: leftCount, rightDownlines: rightCount };
}

/**
 * Diagnose a single user
 */
async function diagnoseUser(
  userId: Types.ObjectId,
  level: number,
  position: "left" | "right" | "root" | null,
  allUsers: Map<string, UserDiagnostic>,
  userMap: Map<string, { userId: Types.ObjectId; level: number; position: "left" | "right" | "root" | null }>
): Promise<UserDiagnostic> {
  const userIdStr = userId.toString();
  
  // Get user info
  const user = await User.findById(userId).select("userId name email phone status").lean();
  if (!user) {
    throw new Error(`User ${userIdStr} not found`);
  }
  
  // Get binary tree
  const tree = await BinaryTree.findOne({ user: userId }).lean();
  if (!tree) {
    throw new Error(`Binary tree not found for user ${userIdStr}`);
  }
  
  // Get investments
  const investments = await Investment.find({ user: userId }).lean();
  const totalInvestment = investments.reduce((sum, inv) => {
    return sum + parseFloat(inv.investedAmount?.toString() || "0");
  }, 0);
  
  const activeInvestments = investments.filter(inv => inv.isActive).length;
  const inactiveInvestments = investments.length - activeInvestments;
  
  // Get stored tree values
  const storedLeftBusiness = parseFloat(tree.leftBusiness?.toString() || "0");
  const storedRightBusiness = parseFloat(tree.rightBusiness?.toString() || "0");
  const storedLeftPowerlegBusiness = parseFloat(tree.leftPowerlegBusiness?.toString() || "0");
  const storedRightPowerlegBusiness = parseFloat(tree.rightPowerlegBusiness?.toString() || "0");
  const storedLeftDownlines = tree.leftDownlines || 0;
  const storedRightDownlines = tree.rightDownlines || 0;
  const storedLeftCarry = parseFloat(tree.leftCarry?.toString() || "0");
  const storedRightCarry = parseFloat(tree.rightCarry?.toString() || "0");
  const storedLeftMatched = parseFloat(tree.leftMatched?.toString() || "0");
  const storedRightMatched = parseFloat(tree.rightMatched?.toString() || "0");
  
  // Calculate expected business volume
  // For root user and users with issues, log the calculation process
  const isRootUser = level === 0;
  const shouldLog = isRootUser; // Log for root user, can be extended to log for users with issues
  
  const expectedBV = await calculateExpectedBusinessVolume(
    userId, 
    allUsers, 
    userMap,
    shouldLog, // Log calculation process
    ""
  );
  const expectedLeftBusiness = expectedBV.left;
  const expectedRightBusiness = expectedBV.right;
  const expectedLeftDownlines = expectedBV.leftDownlines;
  const expectedRightDownlines = expectedBV.rightDownlines;
  
  // Log if there's a mismatch (for debugging)
  const hasMismatch = Math.abs(storedLeftBusiness - expectedLeftBusiness) > 0.01 || 
                       Math.abs(storedRightBusiness - expectedRightBusiness) > 0.01;
  
  if (hasMismatch && !isRootUser) {
    const userDisplayId = (user as any)?.userId || userIdStr;
    console.log(`\n   🔍 Checking ${userDisplayId} (Level ${level}):`);
    console.log(`      Stored: Left=$${storedLeftBusiness.toFixed(2)}, Right=$${storedRightBusiness.toFixed(2)}`);
    console.log(`      Expected: Left=$${expectedLeftBusiness.toFixed(2)}, Right=$${expectedRightBusiness.toFixed(2)}`);
  }
  
  // Identify issues
  const issues: string[] = [];
  const actions: string[] = [];
  
  // Check business volume mismatches
  const leftBVDiff = Math.abs(storedLeftBusiness - expectedLeftBusiness);
  const rightBVDiff = Math.abs(storedRightBusiness - expectedRightBusiness);
  const tolerance = 0.01; // Allow small floating point differences
  
  if (leftBVDiff > tolerance) {
    issues.push(`Left Business Volume Mismatch: Stored ${storedLeftBusiness.toFixed(2)} vs Expected ${expectedLeftBusiness.toFixed(2)} (Difference: ${leftBVDiff.toFixed(2)})`);
    actions.push(`Update leftBusiness to ${expectedLeftBusiness.toFixed(2)} for user ${(user as any).userId}`);
  }
  
  if (rightBVDiff > tolerance) {
    issues.push(`Right Business Volume Mismatch: Stored ${storedRightBusiness.toFixed(2)} vs Expected ${expectedRightBusiness.toFixed(2)} (Difference: ${rightBVDiff.toFixed(2)})`);
    actions.push(`Update rightBusiness to ${expectedRightBusiness.toFixed(2)} for user ${(user as any).userId}`);
  }
  
  // Check downline count mismatches
  if (storedLeftDownlines !== expectedLeftDownlines) {
    issues.push(`Left Downlines Count Mismatch: Stored ${storedLeftDownlines} vs Expected ${expectedLeftDownlines} (Difference: ${expectedLeftDownlines - storedLeftDownlines})`);
    actions.push(`Update leftDownlines to ${expectedLeftDownlines} for user ${(user as any).userId}`);
  }
  
  if (storedRightDownlines !== expectedRightDownlines) {
    issues.push(`Right Downlines Count Mismatch: Stored ${storedRightDownlines} vs Expected ${expectedRightDownlines} (Difference: ${expectedRightDownlines - storedRightDownlines})`);
    actions.push(`Update rightDownlines to ${expectedRightDownlines} for user ${(user as any).userId}`);
  }
  
  // Check carry forward consistency
  const leftAvailable = storedLeftCarry + (storedLeftBusiness - storedLeftMatched);
  const rightAvailable = storedRightCarry + (storedRightBusiness - storedRightMatched);
  
  if (storedLeftMatched > storedLeftBusiness) {
    issues.push(`Left Matched exceeds Left Business: Matched ${storedLeftMatched.toFixed(2)} > Business ${storedLeftBusiness.toFixed(2)}`);
    actions.push(`Recalculate leftMatched and leftCarry for user ${(user as any).userId}`);
  }
  
  if (storedRightMatched > storedRightBusiness) {
    issues.push(`Right Matched exceeds Right Business: Matched ${storedRightMatched.toFixed(2)} > Business ${storedRightBusiness.toFixed(2)}`);
    actions.push(`Recalculate rightMatched and rightCarry for user ${(user as any).userId}`);
  }
  
  // Check if carry forward is negative (shouldn't happen)
  if (storedLeftCarry < 0) {
    issues.push(`Left Carry Forward is negative: ${storedLeftCarry.toFixed(2)}`);
    actions.push(`Reset leftCarry to 0 for user ${(user as any).userId}`);
  }
  
  if (storedRightCarry < 0) {
    issues.push(`Right Carry Forward is negative: ${storedRightCarry.toFixed(2)}`);
    actions.push(`Reset rightCarry to 0 for user ${(user as any).userId}`);
  }
  
  // Check investment consistency
  if (investments.length > 0 && totalInvestment === 0) {
    issues.push(`User has investments but total investment is 0`);
    actions.push(`Review investments for user ${(user as any).userId}`);
  }
  
  return {
    userId: (user as any).userId || userIdStr,
    name: (user as any).name || "N/A",
    userObjId: userId,
    level,
    position,
    totalInvestment,
    activeInvestments,
    inactiveInvestments,
    storedLeftBusiness,
    storedRightBusiness,
    storedLeftPowerlegBusiness,
    storedRightPowerlegBusiness,
    storedLeftDownlines,
    storedRightDownlines,
    storedLeftCarry,
    storedRightCarry,
    storedLeftMatched,
    storedRightMatched,
    expectedLeftBusiness,
    expectedRightBusiness,
    expectedLeftDownlines,
    expectedRightDownlines,
    issues,
    actions
  };
}

/**
 * Generate diagnostic report
 */
async function generateDiagnosticReport(rootUserId: string): Promise<DiagnosticReport> {
  console.log(`\n${'='.repeat(100)}`);
  console.log(`🔍 BINARY TREE DIAGNOSTIC REPORT`);
  console.log(`${'='.repeat(100)}\n`);
  
  // Find root user
  let rootUser = await User.findOne({ userId: rootUserId }).lean();
  if (!rootUser && !rootUserId.includes('-')) {
    rootUser = await User.findOne({ userId: `CROWN-${rootUserId}` }).lean();
  }
  if (!rootUser) {
    throw new Error(`User ${rootUserId} not found`);
  }
  
  console.log(`✅ Root User Found: ${(rootUser as any).userId} (${(rootUser as any).name || 'N/A'})\n`);
  
  const rootUserObjId = new Types.ObjectId(rootUser._id.toString());
  
  // Get all downlines (recursively including all nested downlines)
  console.log(`📊 Collecting all downlines (including nested downlines of downlines)...`);
  
  // First, let's check the root user's tree structure
  const rootTree = await BinaryTree.findOne({ user: rootUserObjId })
    .populate("leftChild", "userId name")
    .populate("rightChild", "userId name")
    .populate("parent", "userId name")
    .lean();
  
  if (rootTree) {
    console.log(`   Root user tree structure:`);
    console.log(`      Left Child: ${rootTree.leftChild ? ((rootTree.leftChild as any)?.userId || rootTree.leftChild) : 'None'}`);
    console.log(`      Right Child: ${rootTree.rightChild ? ((rootTree.rightChild as any)?.userId || rootTree.rightChild) : 'None'}`);
    console.log(`      Parent: ${rootTree.parent ? ((rootTree.parent as any)?.userId || rootTree.parent) : 'None'}`);
    
    // Also check for children via parent relationship (in case tree structure uses parent links)
    const childrenViaParent = await BinaryTree.find({ parent: rootUserObjId })
      .populate("user", "userId name")
      .lean();
    
    if (childrenViaParent.length > 0) {
      console.log(`   Children via parent relationship (${childrenViaParent.length}):`);
      childrenViaParent.forEach((child: any) => {
        const childUserId = child.user?.userId || (child.user as any)?._id || child.user;
        console.log(`      - ${childUserId}`);
      });
    }
  }
  
  const visited = new Set<string>();
  // Don't add root to visited initially - we want to process it
  // Enable logging for root user to see the traversal
  const downlines = await getAllDownlines(rootUserObjId, visited, 0, 100, true, "");
  console.log(`   ✅ Found ${downlines.size} total downlines (including all nested levels)\n`);
  
  // Show tree structure summary
  const levelCounts = new Map<number, number>();
  downlines.forEach((value) => {
    const count = levelCounts.get(value.level) || 0;
    levelCounts.set(value.level, count + 1);
  });
  
  console.log(`   📊 Tree Structure Summary:`);
  levelCounts.forEach((count, level) => {
    console.log(`      Level ${level}: ${count} users`);
  });
  
  // List all found downlines
  if (downlines.size > 0) {
    console.log(`\n   📋 Found Downlines:`);
    const sortedDownlines = Array.from(downlines.entries()).sort((a, b) => a[1].level - b[1].level);
    for (const [userIdStr, info] of sortedDownlines) {
      const user = await User.findById(info.userId).select("userId name").lean();
      const displayId = (user as any)?.userId || userIdStr;
      console.log(`      Level ${info.level}: ${displayId} (${(user as any)?.name || 'N/A'}) - Position: ${info.position}`);
    }
  } else {
    console.log(`\n   ⚠️  WARNING: No downlines found! This might indicate:`);
    console.log(`      - Root user has no children in binary tree`);
    console.log(`      - Tree structure is not properly set up`);
    console.log(`      - Need to check database for actual tree relationships\n`);
  }
  console.log();
  
  // Create user map including root
  const userMap = new Map<string, { userId: Types.ObjectId; level: number; position: "left" | "right" | "root" | null }>();
  userMap.set(rootUserObjId.toString(), { userId: rootUserObjId, level: 0, position: "root" });
  downlines.forEach((value, key) => {
    userMap.set(key, value);
  });
  
  // Diagnose all users (process from deepest to shallowest for accurate BV calculation)
  const allUsers = new Map<string, UserDiagnostic>();
  const sortedUserIds = Array.from(userMap.entries()).sort((a, b) => b[1].level - a[1].level);
  const faultyEntries: Array<{ userId: string; level: number; issues: string[] }> = [];
  
  console.log(`🔍 Diagnosing users (processing from deepest to shallowest)...\n`);
  console.log(`   Checking all downlines and their nested downlines recursively...\n`);
  let processed = 0;
  
  for (const [userIdStr, userInfo] of sortedUserIds) {
    processed++;
    if (processed % 50 === 0) {
      console.log(`   Processed ${processed}/${sortedUserIds.length} users...`);
    }
    
    try {
      const diagnostic = await diagnoseUser(
        userInfo.userId,
        userInfo.level,
        userInfo.position,
        allUsers,
        userMap
      );
      
      allUsers.set(userIdStr, diagnostic);
      
      // Log faulty entries as we find them (for all nested downlines)
      if (diagnostic.issues.length > 0) {
        const user = await User.findById(userInfo.userId).select("userId name").lean();
        const displayId = (user as any)?.userId || userIdStr;
        const indent = "  ".repeat(userInfo.level + 1);
        
        faultyEntries.push({
          userId: displayId,
          level: userInfo.level,
          issues: diagnostic.issues
        });
        
        console.log(`\n${indent}⚠️  FAULTY ENTRY [Level ${userInfo.level}]: ${displayId} (${(user as any)?.name || 'N/A'})`);
        console.log(`${indent}   Position: ${userInfo.position || 'root'}`);
        console.log(`${indent}   Investment: $${diagnostic.totalInvestment.toFixed(2)} (${diagnostic.activeInvestments} active, ${diagnostic.inactiveInvestments} inactive)`);
        console.log(`${indent}   Stored Binary Volume:`);
        console.log(`${indent}      Left:  $${diagnostic.storedLeftBusiness.toFixed(2)} (${diagnostic.storedLeftDownlines} downlines)`);
        console.log(`${indent}      Right: $${diagnostic.storedRightBusiness.toFixed(2)} (${diagnostic.storedRightDownlines} downlines)`);
        console.log(`${indent}   Expected Binary Volume:`);
        console.log(`${indent}      Left:  $${diagnostic.expectedLeftBusiness.toFixed(2)} (${diagnostic.expectedLeftDownlines} downlines)`);
        console.log(`${indent}      Right: $${diagnostic.expectedRightBusiness.toFixed(2)} (${diagnostic.expectedRightDownlines} downlines)`);
        console.log(`${indent}   Issues (${diagnostic.issues.length}):`);
        diagnostic.issues.forEach((issue, idx) => {
          console.log(`${indent}      ${idx + 1}. ${issue}`);
        });
        console.log(`${indent}   Actions Needed:`);
        diagnostic.actions.forEach((action, idx) => {
          console.log(`${indent}      ${idx + 1}. ${action}`);
        });
      }
    } catch (error: any) {
      console.error(`   ⚠️  Error diagnosing user ${userIdStr}: ${error.message}`);
      // Continue with other users
    }
  }
  
  console.log(`\n   ✅ Processed all ${sortedUserIds.length} users`);
  console.log(`   ⚠️  Found ${faultyEntries.length} users with faulty binary volume entries\n`);
  
  // Get root diagnostic
  const rootDiagnostic = allUsers.get(rootUserObjId.toString());
  if (!rootDiagnostic) {
    throw new Error("Root diagnostic not found");
  }
  
  // Generate summary
  let totalIssues = 0;
  let usersWithIssues = 0;
  let businessVolumeMismatches = 0;
  let downlineCountMismatches = 0;
  let carryForwardIssues = 0;
  let investmentIssues = 0;
  
  // Summary of nested downlines check
  console.log(`\n${'='.repeat(100)}`);
  console.log(`📋 NESTED DOWNLINES CHECK SUMMARY`);
  console.log(`${'='.repeat(100)}`);
  
  allUsers.forEach((diagnostic) => {
    if (diagnostic.issues.length > 0) {
      usersWithIssues++;
      totalIssues += diagnostic.issues.length;
      
      diagnostic.issues.forEach((issue) => {
        if (issue.includes("Business Volume Mismatch")) {
          businessVolumeMismatches++;
        } else if (issue.includes("Downlines Count Mismatch")) {
          downlineCountMismatches++;
        } else if (issue.includes("Carry Forward") || issue.includes("Matched")) {
          carryForwardIssues++;
        } else if (issue.includes("investment")) {
          investmentIssues++;
        }
      });
    }
  });
  
  // Print detailed summary of faulty entries found
  if (faultyEntries.length > 0) {
    console.log(`\n⚠️  FAULTY ENTRIES FOUND IN NESTED DOWNLINES (${faultyEntries.length} users):\n`);
    
    // Group by level
    const entriesByLevel = new Map<number, typeof faultyEntries>();
    faultyEntries.forEach((entry) => {
      if (!entriesByLevel.has(entry.level)) {
        entriesByLevel.set(entry.level, []);
      }
      entriesByLevel.get(entry.level)!.push(entry);
    });
    
    // Sort levels
    const sortedLevels = Array.from(entriesByLevel.keys()).sort((a, b) => a - b);
    
    sortedLevels.forEach((level) => {
      const entries = entriesByLevel.get(level)!;
      console.log(`   Level ${level} (${entries.length} users with issues):`);
      entries.forEach((entry, idx) => {
        console.log(`      ${idx + 1}. ${entry.userId} - ${entry.issues.length} issue(s)`);
        entry.issues.forEach((issue) => {
          if (issue.includes("Business Volume Mismatch")) {
            console.log(`         ⚠️  ${issue}`);
          }
        });
      });
      console.log();
    });
    
    console.log(`\n   Total Issues: ${totalIssues}`);
    console.log(`   - Business Volume Mismatches: ${businessVolumeMismatches}`);
    console.log(`   - Downline Count Mismatches: ${downlineCountMismatches}`);
    console.log(`   - Carry Forward Issues: ${carryForwardIssues}`);
    console.log(`   - Investment Issues: ${investmentIssues}\n`);
  } else {
    console.log(`\n✅ No faulty entries found in nested downlines!`);
    console.log(`   All ${sortedUserIds.length} users (including all nested levels) have correct binary volume.\n`);
  }
  
  return {
    rootUser: rootDiagnostic,
    allUsers,
    totalIssues,
    summary: {
      usersWithIssues,
      businessVolumeMismatches,
      downlineCountMismatches,
      carryForwardIssues,
      investmentIssues
    }
  };
}

/**
 * Print diagnostic report to console and save to file
 */
function printReport(report: DiagnosticReport, rootUserId: string) {
  console.log(`\n${'='.repeat(100)}`);
  console.log(`📋 DIAGNOSTIC SUMMARY`);
  console.log(`${'='.repeat(100)}\n`);
  
  console.log(`Root User: ${report.rootUser.userId} (${report.rootUser.name})`);
  console.log(`Total Users Diagnosed: ${report.allUsers.size}`);
  console.log(`Total Issues Found: ${report.totalIssues}`);
  console.log(`Users with Issues: ${report.summary.usersWithIssues}`);
  console.log(`\nIssue Breakdown:`);
  console.log(`  - Business Volume Mismatches: ${report.summary.businessVolumeMismatches}`);
  console.log(`  - Downline Count Mismatches: ${report.summary.downlineCountMismatches}`);
  console.log(`  - Carry Forward Issues: ${report.summary.carryForwardIssues}`);
  console.log(`  - Investment Issues: ${report.summary.investmentIssues}`);
  
  console.log(`\n${'='.repeat(100)}`);
  console.log(`📊 ROOT USER DETAILS`);
  console.log(`${'='.repeat(100)}\n`);
  
  const root = report.rootUser;
  console.log(`User ID: ${root.userId}`);
  console.log(`Name: ${root.name}`);
  console.log(`Level: ${root.level}`);
  console.log(`Position: ${root.position}`);
  console.log(`\nInvestment Summary:`);
  console.log(`  Total Investment: $${root.totalInvestment.toFixed(2)}`);
  console.log(`  Active Investments: ${root.activeInvestments}`);
  console.log(`  Inactive Investments: ${root.inactiveInvestments}`);
  console.log(`\nStored Binary Tree Data:`);
  console.log(`  Left Business: $${root.storedLeftBusiness.toFixed(2)}`);
  console.log(`  Right Business: $${root.storedRightBusiness.toFixed(2)}`);
  console.log(`  Left Powerleg Business: $${root.storedLeftPowerlegBusiness.toFixed(2)}`);
  console.log(`  Right Powerleg Business: $${root.storedRightPowerlegBusiness.toFixed(2)}`);
  console.log(`  Left Downlines: ${root.storedLeftDownlines}`);
  console.log(`  Right Downlines: ${root.storedRightDownlines}`);
  console.log(`  Left Carry: $${root.storedLeftCarry.toFixed(2)}`);
  console.log(`  Right Carry: $${root.storedRightCarry.toFixed(2)}`);
  console.log(`  Left Matched: $${root.storedLeftMatched.toFixed(2)}`);
  console.log(`  Right Matched: $${root.storedRightMatched.toFixed(2)}`);
  console.log(`\nExpected Values (from calculations):`);
  console.log(`  Expected Left Business: $${root.expectedLeftBusiness.toFixed(2)}`);
  console.log(`  Expected Right Business: $${root.expectedRightBusiness.toFixed(2)}`);
  console.log(`  Expected Left Downlines: ${root.expectedLeftDownlines}`);
  console.log(`  Expected Right Downlines: ${root.expectedRightDownlines}`);
  
  if (root.issues.length > 0) {
    console.log(`\n⚠️  ISSUES FOUND FOR ROOT USER:`);
    root.issues.forEach((issue, idx) => {
      console.log(`  ${idx + 1}. ${issue}`);
    });
    console.log(`\n🔧 ACTIONS NEEDED FOR ROOT USER:`);
    root.actions.forEach((action, idx) => {
      console.log(`  ${idx + 1}. ${action}`);
    });
  } else {
    console.log(`\n✅ No issues found for root user`);
  }
  
  // Print users with issues
  if (report.summary.usersWithIssues > 0) {
    console.log(`\n${'='.repeat(100)}`);
    console.log(`⚠️  USERS WITH ISSUES (${report.summary.usersWithIssues} users)`);
    console.log(`${'='.repeat(100)}\n`);
    
    const usersWithIssuesList = Array.from(report.allUsers.values())
      .filter(u => u.issues.length > 0)
      .sort((a, b) => b.issues.length - a.issues.length);
    
    usersWithIssuesList.forEach((user, idx) => {
      console.log(`\n${idx + 1}. ${user.userId} (${user.name}) - Level ${user.level}, Position: ${user.position}`);
      console.log(`   Total Investment: $${user.totalInvestment.toFixed(2)}`);
      console.log(`   Issues: ${user.issues.length}`);
      user.issues.forEach((issue, issueIdx) => {
        console.log(`     ${issueIdx + 1}. ${issue}`);
      });
      console.log(`   Actions:`);
      user.actions.forEach((action, actionIdx) => {
        console.log(`     ${actionIdx + 1}. ${action}`);
      });
    });
  }
  
  // Generate action summary
  console.log(`\n${'='.repeat(100)}`);
  console.log(`🔧 ACTION SUMMARY`);
  console.log(`${'='.repeat(100)}\n`);
  
  const allActions = new Set<string>();
  report.allUsers.forEach((user) => {
    user.actions.forEach((action) => {
      allActions.add(action);
    });
  });
  
  console.log(`Total Unique Actions: ${allActions.size}\n`);
  Array.from(allActions).forEach((action, idx) => {
    console.log(`${idx + 1}. ${action}`);
  });
  
  console.log(`\n${'='.repeat(100)}\n`);
  
  // Save report to file
  const reportsDir = path.join(__dirname, '../../diagnostic-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFileName = `binary-tree-diagnostic-${rootUserId}-${timestamp}.txt`;
  const reportFilePath = path.join(reportsDir, reportFileName);
  
  // Generate report text
  let reportText = `BINARY TREE DIAGNOSTIC REPORT\n`;
  reportText += `Generated: ${new Date().toISOString()}\n`;
  reportText += `Root User: ${rootUserId}\n`;
  reportText += `${'='.repeat(100)}\n\n`;
  
  reportText += `SUMMARY\n`;
  reportText += `${'='.repeat(100)}\n`;
  reportText += `Total Users Diagnosed: ${report.allUsers.size}\n`;
  reportText += `Total Issues Found: ${report.totalIssues}\n`;
  reportText += `Users with Issues: ${report.summary.usersWithIssues}\n`;
  reportText += `\nIssue Breakdown:\n`;
  reportText += `  - Business Volume Mismatches: ${report.summary.businessVolumeMismatches}\n`;
  reportText += `  - Downline Count Mismatches: ${report.summary.downlineCountMismatches}\n`;
  reportText += `  - Carry Forward Issues: ${report.summary.carryForwardIssues}\n`;
  reportText += `  - Investment Issues: ${report.summary.investmentIssues}\n\n`;
  
  reportText += `ROOT USER DETAILS\n`;
  reportText += `${'='.repeat(100)}\n`;
  reportText += `User ID: ${root.userId}\n`;
  reportText += `Name: ${root.name}\n`;
  reportText += `Level: ${root.level}\n`;
  reportText += `Position: ${root.position}\n`;
  reportText += `\nInvestment Summary:\n`;
  reportText += `  Total Investment: $${root.totalInvestment.toFixed(2)}\n`;
  reportText += `  Active Investments: ${root.activeInvestments}\n`;
  reportText += `  Inactive Investments: ${root.inactiveInvestments}\n`;
  reportText += `\nStored Binary Tree Data:\n`;
  reportText += `  Left Business: $${root.storedLeftBusiness.toFixed(2)}\n`;
  reportText += `  Right Business: $${root.storedRightBusiness.toFixed(2)}\n`;
  reportText += `  Left Downlines: ${root.storedLeftDownlines}\n`;
  reportText += `  Right Downlines: ${root.storedRightDownlines}\n`;
  reportText += `\nExpected Values:\n`;
  reportText += `  Expected Left Business: $${root.expectedLeftBusiness.toFixed(2)}\n`;
  reportText += `  Expected Right Business: $${root.expectedRightBusiness.toFixed(2)}\n`;
  reportText += `  Expected Left Downlines: ${root.expectedLeftDownlines}\n`;
  reportText += `  Expected Right Downlines: ${root.expectedRightDownlines}\n`;
  
  if (root.issues.length > 0) {
    reportText += `\nISSUES FOUND FOR ROOT USER:\n`;
    root.issues.forEach((issue, idx) => {
      reportText += `  ${idx + 1}. ${issue}\n`;
    });
    reportText += `\nACTIONS NEEDED FOR ROOT USER:\n`;
    root.actions.forEach((action, idx) => {
      reportText += `  ${idx + 1}. ${action}\n`;
    });
  }
  
  if (report.summary.usersWithIssues > 0) {
    reportText += `\n${'='.repeat(100)}\n`;
    reportText += `USERS WITH ISSUES\n`;
    reportText += `${'='.repeat(100)}\n\n`;
    
    const usersWithIssuesList = Array.from(report.allUsers.values())
      .filter(u => u.issues.length > 0)
      .sort((a, b) => b.issues.length - a.issues.length);
    
    usersWithIssuesList.forEach((user, idx) => {
      reportText += `${idx + 1}. ${user.userId} (${user.name}) - Level ${user.level}, Position: ${user.position}\n`;
      reportText += `   Total Investment: $${user.totalInvestment.toFixed(2)}\n`;
      reportText += `   Issues: ${user.issues.length}\n`;
      user.issues.forEach((issue, issueIdx) => {
        reportText += `     ${issueIdx + 1}. ${issue}\n`;
      });
      reportText += `   Actions:\n`;
      user.actions.forEach((action, actionIdx) => {
        reportText += `     ${actionIdx + 1}. ${action}\n`;
      });
      reportText += `\n`;
    });
  }
  
  reportText += `\n${'='.repeat(100)}\n`;
  reportText += `ACTION SUMMARY\n`;
  reportText += `${'='.repeat(100)}\n\n`;
  
  // Reuse allActions Set that was already created for console output
  reportText += `Total Unique Actions: ${allActions.size}\n\n`;
  Array.from(allActions).forEach((action, idx) => {
    reportText += `${idx + 1}. ${action}\n`;
  });
  
  // Write to file
  fs.writeFileSync(reportFilePath, reportText, 'utf8');
  console.log(`\n📄 Report saved to: ${reportFilePath}\n`);
}

async function connectDB() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/.*@/, "//***@")}\n`);
    
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");
    
    User.modelName;
    BinaryTree.modelName;
    Investment.modelName;
  } catch (error: any) {
    console.error("❌ Failed to connect to MongoDB!");
    console.error(`   Error: ${error.message}`);
    throw error;
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}

async function main() {
  const userId = process.argv[2] || 'CROWN-000282';

  try {
    await connectDB();
    const report = await generateDiagnosticReport(userId);
    printReport(report, userId);
    await disconnectDB();
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    await disconnectDB();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { generateDiagnosticReport, diagnoseUser, getAllDownlines };
