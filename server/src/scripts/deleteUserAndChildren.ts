/**
 * Delete User and All Children Recursively
 * 
 * This script deletes a user (by userId) and ALL of its children recursively
 * from the binary tree, along with all related data.
 * 
 * Usage: npx ts-node -r dotenv/config src/scripts/deleteUserAndChildren.ts BIGBULL-000120
 */

import mongoose from "mongoose";
import { User } from "../models/User";
import { BinaryTree } from "../models/BinaryTree";
import { Wallet } from "../models/Wallet";
import { Investment } from "../models/Investment";
import { WalletTransaction } from "../models/WalletTransaction";
import { Withdrawal } from "../models/Withdrawal";
import { Voucher } from "../models/Voucher";
import { Ticket } from "../models/Ticket";
import { UserCareerProgress } from "../models/UserCareerProgress";
import { findUserByUserId } from "../services/userId.service";
import { Types } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URL_DEVELOPMENT || process.env.MONGODB_URI || process.env.MONGODB_URL_PRODUCTION || "mongodb://localhost:27017/crown-bankers";

interface DeletionStats {
  usersDeleted: number;
  binaryTreesDeleted: number;
  walletsDeleted: number;
  investmentsDeleted: number;
  transactionsDeleted: number;
  withdrawalsDeleted: number;
  vouchersDeleted: number;
  ticketsDeleted: number;
  careerProgressDeleted: number;
}

class UserDeletionService {
  private stats: DeletionStats = {
    usersDeleted: 0,
    binaryTreesDeleted: 0,
    walletsDeleted: 0,
    investmentsDeleted: 0,
    transactionsDeleted: 0,
    withdrawalsDeleted: 0,
    vouchersDeleted: 0,
    ticketsDeleted: 0,
    careerProgressDeleted: 0,
  };

  private deletedUserIds: string[] = [];

  async connectDB() {
    try {
      console.log("🔌 Connecting to MongoDB...");
      console.log(`   URI: ${MONGODB_URI.replace(/\/\/.*@/, "//***@")}\n`);
      
      await mongoose.connect(MONGODB_URI);
      console.log("✅ Connected to MongoDB\n");
    } catch (error: any) {
      console.error("❌ Failed to connect to MongoDB!");
      console.error(`   Error: ${error.message}`);
      throw error;
    }
  }

  async disconnectDB() {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }

  /**
   * Recursively collect all child user IDs from the binary tree
   */
  async collectAllChildren(userId: Types.ObjectId): Promise<Types.ObjectId[]> {
    const children: Types.ObjectId[] = [];
    const visited = new Set<string>();

    const collectRecursive = async (currentUserId: Types.ObjectId) => {
      const userIdStr = currentUserId.toString();
      if (visited.has(userIdStr)) {
        return; // Prevent infinite loops
      }
      visited.add(userIdStr);

      const tree = await BinaryTree.findOne({ user: currentUserId });
      if (!tree) {
        return;
      }

      // Collect left child
      if (tree.leftChild) {
        children.push(tree.leftChild);
        await collectRecursive(tree.leftChild);
      }

      // Collect right child
      if (tree.rightChild) {
        children.push(tree.rightChild);
        await collectRecursive(tree.rightChild);
      }
    };

    await collectRecursive(userId);
    return children;
  }

  /**
   * Delete all data related to a user
   */
  async deleteUserData(userId: Types.ObjectId, userIdStr: string): Promise<void> {
    console.log(`   🗑️  Deleting data for user: ${userIdStr}`);

    // 1. Delete Investments
    const investmentsResult = await Investment.deleteMany({ user: userId });
    this.stats.investmentsDeleted += investmentsResult.deletedCount || 0;
    if (investmentsResult.deletedCount) {
      console.log(`      ✅ Deleted ${investmentsResult.deletedCount} investments`);
    }

    // 2. Delete Wallets
    const walletsResult = await Wallet.deleteMany({ user: userId });
    this.stats.walletsDeleted += walletsResult.deletedCount || 0;
    if (walletsResult.deletedCount) {
      console.log(`      ✅ Deleted ${walletsResult.deletedCount} wallets`);
    }

    // 3. Delete WalletTransactions
    const transactionsResult = await WalletTransaction.deleteMany({ user: userId });
    this.stats.transactionsDeleted += transactionsResult.deletedCount || 0;
    if (transactionsResult.deletedCount) {
      console.log(`      ✅ Deleted ${transactionsResult.deletedCount} wallet transactions`);
    }

    // 4. Delete Withdrawals
    const withdrawalsResult = await Withdrawal.deleteMany({ user: userId });
    this.stats.withdrawalsDeleted += withdrawalsResult.deletedCount || 0;
    if (withdrawalsResult.deletedCount) {
      console.log(`      ✅ Deleted ${withdrawalsResult.deletedCount} withdrawals`);
    }

    // 5. Delete Vouchers (owned and created)
    const vouchersOwnedResult = await Voucher.deleteMany({ user: userId });
    const vouchersCreatedResult = await Voucher.deleteMany({ createdBy: userId });
    this.stats.vouchersDeleted += (vouchersOwnedResult.deletedCount || 0) + (vouchersCreatedResult.deletedCount || 0);
    if (vouchersOwnedResult.deletedCount || vouchersCreatedResult.deletedCount) {
      console.log(`      ✅ Deleted ${(vouchersOwnedResult.deletedCount || 0) + (vouchersCreatedResult.deletedCount || 0)} vouchers`);
    }

    // 6. Delete Tickets
    const ticketsResult = await Ticket.deleteMany({ raisedBy: userId });
    this.stats.ticketsDeleted += ticketsResult.deletedCount || 0;
    if (ticketsResult.deletedCount) {
      console.log(`      ✅ Deleted ${ticketsResult.deletedCount} tickets`);
    }

    // 7. Delete UserCareerProgress
    const careerProgressResult = await UserCareerProgress.deleteMany({ user: userId });
    this.stats.careerProgressDeleted += careerProgressResult.deletedCount || 0;
    if (careerProgressResult.deletedCount) {
      console.log(`      ✅ Deleted ${careerProgressResult.deletedCount} career progress records`);
    }

    // 8. Update parent's BinaryTree to remove references (before deleting)
    const binaryTree = await BinaryTree.findOne({ user: userId });
    if (binaryTree && binaryTree.parent) {
      const parentTree = await BinaryTree.findOne({ user: binaryTree.parent });
      if (parentTree) {
        if (parentTree.leftChild?.toString() === userId.toString()) {
          parentTree.leftChild = null;
          // Decrement left downlines count
          parentTree.leftDownlines = Math.max(0, (parentTree.leftDownlines || 0) - 1);
          await parentTree.save();
          console.log(`      ✅ Updated parent's left child reference`);
        }
        if (parentTree.rightChild?.toString() === userId.toString()) {
          parentTree.rightChild = null;
          // Decrement right downlines count
          parentTree.rightDownlines = Math.max(0, (parentTree.rightDownlines || 0) - 1);
          await parentTree.save();
          console.log(`      ✅ Updated parent's right child reference`);
        }
      }
    }

    // 9. Delete BinaryTree entry
    const binaryTreeResult = await BinaryTree.deleteOne({ user: userId });
    this.stats.binaryTreesDeleted += binaryTreeResult.deletedCount || 0;
    if (binaryTreeResult.deletedCount) {
      console.log(`      ✅ Deleted binary tree entry`);
    }

    // 10. Update other users' referrer field if they reference this user
    await User.updateMany(
      { referrer: userId },
      { $set: { referrer: null } }
    );

    // 11. Finally, delete the User
    const userResult = await User.deleteOne({ _id: userId });
    this.stats.usersDeleted += userResult.deletedCount || 0;
    if (userResult.deletedCount) {
      console.log(`      ✅ Deleted user record`);
    }
  }

  /**
   * Delete user and all children recursively
   */
  async deleteUserAndChildren(userId: string): Promise<void> {
    console.log(`\n🔍 Finding user: ${userId}`);
    
    // Find the user
    const user = await findUserByUserId(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    console.log(`✅ Found user: ${user.name} (${user.userId})`);
    console.log(`   Email: ${user.email || "N/A"}`);
    console.log(`   Phone: ${user.phone || "N/A"}\n`);

    // Prevent deletion of admin user
    if (user.userId === "BIGBULL-000000" || user.userId === "CROWN-000000" || user.userId === "CNEOX-000000") {
      throw new Error("Cannot delete admin user");
    }

    // Collect all children recursively
    console.log("🌳 Collecting all children from binary tree...");
    const children = await this.collectAllChildren(user._id as Types.ObjectId);
    console.log(`   Found ${children.length} children to delete\n`);

    if (children.length > 0) {
      console.log("📋 Children to be deleted:");
      for (const childId of children) {
        const child = await User.findById(childId);
        if (child) {
          console.log(`   - ${child.userId}: ${child.name}`);
          this.deletedUserIds.push(child.userId || "");
        }
      }
      console.log("");
    }

    // Confirm deletion
    console.log("⚠️  WARNING: This will permanently delete:");
    console.log(`   - 1 root user (${userId})`);
    console.log(`   - ${children.length} children`);
    console.log(`   - All related data (investments, wallets, transactions, etc.)`);
    console.log("\n🗑️  Starting deletion process...\n");

    // Delete children first (bottom-up approach)
    if (children.length > 0) {
      console.log("📦 Deleting children first...");
      for (let i = 0; i < children.length; i++) {
        const childId = children[i];
        const child = await User.findById(childId);
        if (child) {
          console.log(`\n[${i + 1}/${children.length}] Deleting child: ${child.userId} (${child.name})`);
          await this.deleteUserData(childId, child.userId || "");
        }
      }
      console.log(`\n✅ Deleted ${children.length} children\n`);
    }

    // Delete the root user
    console.log(`\n🗑️  Deleting root user: ${userId}`);
    await this.deleteUserData(user._id as Types.ObjectId, userId);

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 DELETION SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Users Deleted: ${this.stats.usersDeleted}`);
    console.log(`   - Root user: ${userId}`);
    console.log(`   - Children: ${children.length}`);
    console.log(`✅ Binary Trees Deleted: ${this.stats.binaryTreesDeleted}`);
    console.log(`✅ Wallets Deleted: ${this.stats.walletsDeleted}`);
    console.log(`✅ Investments Deleted: ${this.stats.investmentsDeleted}`);
    console.log(`✅ Transactions Deleted: ${this.stats.transactionsDeleted}`);
    console.log(`✅ Withdrawals Deleted: ${this.stats.withdrawalsDeleted}`);
    console.log(`✅ Vouchers Deleted: ${this.stats.vouchersDeleted}`);
    console.log(`✅ Tickets Deleted: ${this.stats.ticketsDeleted}`);
    console.log(`✅ Career Progress Deleted: ${this.stats.careerProgressDeleted}`);
    console.log("\n✅ Deletion completed successfully!");
  }
}

// Main execution
async function main() {
  const userId = process.argv[2];

  if (!userId) {
    console.error("❌ Error: User ID is required");
    console.log("\nUsage:");
    console.log("  npx ts-node -r dotenv/config src/scripts/deleteUserAndChildren.ts <USER_ID>");
    console.log("\nExample:");
    console.log("  npx ts-node -r dotenv/config src/scripts/deleteUserAndChildren.ts BIGBULL-000120");
    process.exit(1);
  }

  const deletionService = new UserDeletionService();

  try {
    await deletionService.connectDB();
    await deletionService.deleteUserAndChildren(userId);
  } catch (error: any) {
    console.error("\n❌ Deletion failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await deletionService.disconnectDB();
  }
}

main();
