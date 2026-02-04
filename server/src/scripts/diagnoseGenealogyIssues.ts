/**
 * Diagnostic Script: Genealogy Tree Issues
 * 
 * Diagnoses issues with binary tree/genealogy display:
 * 1. Count discrepancies (upline showing fewer downlines than downline)
 * 2. Access control issues (users viewing trees outside their downline)
 * 
 * Usage: npx ts-node -r dotenv/config src/scripts/diagnoseGenealogyIssues.ts [userId1] [userId2]
 * Example: npx ts-node -r dotenv/config src/scripts/diagnoseGenealogyIssues.ts CROWN-000106 CROWN-000280
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Types } from "mongoose";
import * as path from "path";
import { User } from "../models/User";
import { BinaryTree } from "../models/BinaryTree";

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

/**
 * Check if userB is in userA's downline
 */
async function isUserInDownline(userAId: Types.ObjectId, userBId: Types.ObjectId, maxDepth: number = 50): Promise<boolean> {
  const visited = new Set<string>();
  const queue: { userId: Types.ObjectId; level: number }[] = [{ userId: userAId, level: 0 }];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.level >= maxDepth) break;
    
    const currentIdStr = current.userId.toString();
    if (visited.has(currentIdStr)) continue;
    visited.add(currentIdStr);
    
    // Check if this is the target user
    if (current.userId.equals(userBId)) {
      return true;
    }
    
    // Get tree and add children to queue
    const tree = await BinaryTree.findOne({ user: current.userId })
      .select("leftChild rightChild parent")
      .lean();
    
    if (!tree) continue;
    
    // Check if this is admin (can have unlimited children via parent relationship)
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
          queue.push({ userId: new Types.ObjectId(childId), level: current.level + 1 });
        }
      });
    } else {
      // Regular users: only left and right children
      if (tree.leftChild) {
        const leftId = (tree.leftChild as any)?.toString() || tree.leftChild.toString();
        if (!visited.has(leftId)) {
          queue.push({ userId: new Types.ObjectId(leftId), level: current.level + 1 });
        }
      }
      if (tree.rightChild) {
        const rightId = (tree.rightChild as any)?.toString() || tree.rightChild.toString();
        if (!visited.has(rightId)) {
          queue.push({ userId: new Types.ObjectId(rightId), level: current.level + 1 });
        }
      }
    }
  }
  
  return false;
}

/**
 * Recursively count all users in a subtree
 */
async function countSubtreeUsers(
  rootUserId: Types.ObjectId,
  leg: "left" | "right",
  maxDepth: number = 50
): Promise<number> {
  const tree = await BinaryTree.findOne({ user: rootUserId }).lean();
  if (!tree) return 0;

  const childInLeg = leg === "left" ? tree.leftChild : tree.rightChild;
  if (!childInLeg) return 0;

  const childId = (childInLeg as any)?.toString() || childInLeg.toString();
  const childObjId = new Types.ObjectId(childId);

  // Count recursively
  const visited = new Set<string>();
  const queue: { userId: Types.ObjectId; level: number }[] = [{ userId: childObjId, level: 0 }];
  let count = 0;

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

    // Check if admin
    const user = await User.findById(current.userId).select("userId").lean();
    const isAdmin = (user as any)?.userId === "CROWN-000000" || (user as any)?.userId === "CNEOX-000000";

    if (isAdmin) {
      const adminChildren = await BinaryTree.find({ parent: current.userId })
        .select("user")
        .lean();
      adminChildren.forEach((child: any) => {
        const childId = child.user?.toString() || child.user;
        if (childId && !visited.has(childId)) {
          queue.push({ userId: new Types.ObjectId(childId), level: current.level + 1 });
        }
      });
    } else {
      if (currentTree.leftChild) {
        const leftId = (currentTree.leftChild as any)?.toString() || currentTree.leftChild.toString();
        if (!visited.has(leftId)) {
          queue.push({ userId: new Types.ObjectId(leftId), level: current.level + 1 });
        }
      }
      if (currentTree.rightChild) {
        const rightId = (currentTree.rightChild as any)?.toString() || currentTree.rightChild.toString();
        if (!visited.has(rightId)) {
          queue.push({ userId: new Types.ObjectId(rightId), level: current.level + 1 });
        }
      }
    }
  }

  return count;
}

async function connectDB() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/.*@/, "//***@")}\n`);
    
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");
    
    User.modelName;
    BinaryTree.modelName;
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

async function diagnoseGenealogy(userId1: string, userId2?: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔍 GENEALOGY TREE DIAGNOSTIC`);
  console.log(`${'='.repeat(80)}\n`);

  // Find user 1
  let user1 = await User.findOne({ userId: userId1 }).lean();
  if (!user1 && !userId1.includes('-')) {
    user1 = await User.findOne({ userId: `CROWN-${userId1}` }).lean();
  }
  if (!user1) {
    throw new Error(`User ${userId1} not found`);
  }

  console.log(`✅ User 1 Found: ${(user1 as any).userId} (${(user1 as any).name || 'N/A'})\n`);

  const user1Tree = await BinaryTree.findOne({ user: user1._id }).lean();
  if (!user1Tree) {
    throw new Error(`Binary tree not found for user ${userId1}`);
  }

  console.log(`📊 User 1 (${userId1}) Tree Data:`);
  console.log(`   - Stored leftDownlines: ${user1Tree.leftDownlines || 0}`);
  console.log(`   - Stored rightDownlines: ${user1Tree.rightDownlines || 0}`);
  console.log(`   - Left Child: ${user1Tree.leftChild || 'None'}`);
  console.log(`   - Right Child: ${user1Tree.rightChild || 'None'}`);
  console.log(`   - Parent: ${user1Tree.parent || 'None'}\n`);

  // Calculate actual counts
  console.log(`🔢 Calculating actual downline counts...`);
  const actualLeftCount = await countSubtreeUsers(new Types.ObjectId(user1._id.toString()), "left");
  const actualRightCount = await countSubtreeUsers(new Types.ObjectId(user1._id.toString()), "right");
  
  console.log(`   - Actual left downlines: ${actualLeftCount}`);
  console.log(`   - Actual right downlines: ${actualRightCount}`);
  console.log(`   - Stored vs Actual:`);
  console.log(`     Left: ${user1Tree.leftDownlines || 0} stored vs ${actualLeftCount} actual (${actualLeftCount - (user1Tree.leftDownlines || 0)} difference)`);
  console.log(`     Right: ${user1Tree.rightDownlines || 0} stored vs ${actualRightCount} actual (${actualRightCount - (user1Tree.rightDownlines || 0)} difference)\n`);

  if (userId2) {
    // Find user 2
    let user2 = await User.findOne({ userId: userId2 }).lean();
    if (!user2 && !userId2.includes('-')) {
      user2 = await User.findOne({ userId: `CROWN-${userId2}` }).lean();
    }
    if (!user2) {
      throw new Error(`User ${userId2} not found`);
    }

    console.log(`✅ User 2 Found: ${(user2 as any).userId} (${(user2 as any).name || 'N/A'})\n`);

    const user2Tree = await BinaryTree.findOne({ user: user2._id }).lean();
    if (!user2Tree) {
      throw new Error(`Binary tree not found for user ${userId2}`);
    }

    console.log(`📊 User 2 (${userId2}) Tree Data:`);
    console.log(`   - Stored leftDownlines: ${user2Tree.leftDownlines || 0}`);
    console.log(`   - Stored rightDownlines: ${user2Tree.rightDownlines || 0}`);
    console.log(`   - Left Child: ${user2Tree.leftChild || 'None'}`);
    console.log(`   - Right Child: ${user2Tree.rightChild || 'None'}`);
    console.log(`   - Parent: ${user2Tree.parent || 'None'}\n`);

    // Calculate actual counts for user 2
    const actualLeftCount2 = await countSubtreeUsers(new Types.ObjectId(user2._id.toString()), "left");
    const actualRightCount2 = await countSubtreeUsers(new Types.ObjectId(user2._id.toString()), "right");
    
    console.log(`🔢 Calculating actual downline counts for User 2...`);
    console.log(`   - Actual left downlines: ${actualLeftCount2}`);
    console.log(`   - Actual right downlines: ${actualRightCount2}`);
    console.log(`   - Stored vs Actual:`);
    console.log(`     Left: ${user2Tree.leftDownlines || 0} stored vs ${actualLeftCount2} actual (${actualLeftCount2 - (user2Tree.leftDownlines || 0)} difference)`);
    console.log(`     Right: ${user2Tree.rightDownlines || 0} stored vs ${actualRightCount2} actual (${actualRightCount2 - (user2Tree.rightDownlines || 0)} difference)\n`);

    // Check relationship
    console.log(`🔗 Relationship Check:`);
    const user1ObjId = new Types.ObjectId(user1._id.toString());
    const user2ObjId = new Types.ObjectId(user2._id.toString());
    
    const user2InUser1Downline = await isUserInDownline(user1ObjId, user2ObjId);
    const user1InUser2Downline = await isUserInDownline(user2ObjId, user1ObjId);
    
    console.log(`   - Is ${userId2} in ${userId1}'s downline? ${user2InUser1Downline ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Is ${userId1} in ${userId2}'s downline? ${user1InUser2Downline ? '✅ YES' : '❌ NO'}\n`);

    if (user2InUser1Downline) {
      console.log(`📈 Count Analysis:`);
      console.log(`   - ${userId1} (upline) left downlines: ${user1Tree.leftDownlines || 0} stored, ${actualLeftCount} actual`);
      console.log(`   - ${userId2} (downline) left downlines: ${user2Tree.leftDownlines || 0} stored, ${actualLeftCount2} actual`);
      
      if ((user1Tree.leftDownlines || 0) < (user2Tree.leftDownlines || 0)) {
        console.log(`   ⚠️ ISSUE: Upline (${userId1}) shows FEWER downlines than downline (${userId2})!`);
        console.log(`   ⚠️ This is incorrect - upline should have MORE total downlines.\n`);
      } else {
        console.log(`   ✅ Counts are correct - upline has more downlines than downline.\n`);
      }
    } else {
      console.log(`⚠️ WARNING: ${userId2} is NOT in ${userId1}'s downline!`);
      console.log(`   This means they should NOT be able to view each other's trees.\n`);
    }
  }

  // Check for access control issues
  console.log(`🔒 Access Control Check:`);
  console.log(`   The getNodeDownlines API currently allows any authenticated user to view any user's tree.`);
  console.log(`   This is a security issue - users can view trees outside their downline.\n`);

  console.log(`\n${'='.repeat(80)}\n`);
}

async function main() {
  const userId1 = process.argv[2] || 'CROWN-000106';
  const userId2 = process.argv[3] || 'CROWN-000280';

  try {
    await connectDB();
    await diagnoseGenealogy(userId1, userId2);
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

export { diagnoseGenealogy, isUserInDownline, countSubtreeUsers };
