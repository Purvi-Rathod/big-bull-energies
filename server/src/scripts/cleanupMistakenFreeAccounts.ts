/**
 * Script to cleanup mistakenly created free accounts
 * 
 * This script will:
 * 1. Unlock accounts (set withdrawEnabled = true)
 * 2. Remove binary targets (set binaryTargetAmount = 0, targetStatus = null)
 * 3. Remove investments created for these users
 * 4. Remove funds from wallets (investment wallet, ROI wallet, referral wallet, binary wallet)
 * 5. Deactivate users (set status = "inactive")
 * 6. Remove free account type (set accountType = null or "normal")
 * 
 * Usage: npx ts-node -r dotenv/config src/scripts/cleanupMistakenFreeAccounts.ts BIGBULL-000577 BIGBULL-000576 BIGBULL-000575
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Types } from "mongoose";
import * as path from "path";
import { User } from "../models/User";
import { Investment } from "../models/Investment";
import { Wallet } from "../models/Wallet";
import { WalletTransaction } from "../models/WalletTransaction";
import connectdb from "../db/index";
import { findUserByUserId } from "../services/userId.service";

// Load environment variables
try {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
} catch (e) {}
try {
  dotenv.config({ path: path.join(__dirname, '../.env') });
} catch (e) {}
dotenv.config();

async function cleanupUser(userId: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧹 Cleaning up user: ${userId}`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    // Find user
    let user = await findUserByUserId(userId);
    if (!user) {
      console.log(`❌ User ${userId} not found`);
      return { success: false, error: "User not found" };
    }

    console.log(`✅ User found: ${user.userId} (${user.name || 'N/A'})`);
    console.log(`   Current status: ${user.status}`);
    console.log(`   Account type: ${user.accountType || 'normal'}`);
    console.log(`   Withdraw enabled: ${user.withdrawEnabled}`);
    console.log(`   Binary target: $${user.binaryTargetAmount || 0}`);
    console.log(`   Target status: ${user.targetStatus || 'N/A'}\n`);

    // Get user's investments
    const investments = await Investment.find({ user: user._id });
    console.log(`📊 Found ${investments.length} investment(s)`);

    let totalInvestmentAmount = 0;
    investments.forEach((inv, idx) => {
      const amount = parseFloat(inv.investedAmount.toString());
      totalInvestmentAmount += amount;
      console.log(`   Investment ${idx + 1}: $${amount.toFixed(2)} (ID: ${inv._id})`);
    });
    console.log(`   Total investment amount: $${totalInvestmentAmount.toFixed(2)}\n`);

    // Get user's wallets
    const wallets = await Wallet.find({ user: user._id });
    console.log(`💰 Found ${wallets.length} wallet(s)`);

    let totalWalletBalance = 0;
    wallets.forEach((wallet, idx) => {
      const balance = parseFloat(wallet.balance.toString());
      totalWalletBalance += balance;
      console.log(`   ${wallet.type} wallet: $${balance.toFixed(2)}`);
    });
    console.log(`   Total wallet balance: $${totalWalletBalance.toFixed(2)}\n`);

    // Get wallet transactions
    const transactions = await WalletTransaction.find({ user: user._id });
    console.log(`📝 Found ${transactions.length} wallet transaction(s)\n`);

    // Start cleanup
    console.log(`🔄 Starting cleanup...\n`);

    // 1. Delete investments
    if (investments.length > 0) {
      const deleteResult = await Investment.deleteMany({ user: user._id });
      console.log(`   ✅ Deleted ${deleteResult.deletedCount} investment(s)`);
    }

    // 2. Delete wallet transactions
    if (transactions.length > 0) {
      const deleteResult = await WalletTransaction.deleteMany({ user: user._id });
      console.log(`   ✅ Deleted ${deleteResult.deletedCount} wallet transaction(s)`);
    }

    // 3. Reset wallets to zero
    if (wallets.length > 0) {
      await Wallet.updateMany(
        { user: user._id },
        { balance: Types.Decimal128.fromString("0") }
      );
      console.log(`   ✅ Reset ${wallets.length} wallet(s) to $0`);
    }

    // 4. Unlock account and remove targets
    user.withdrawEnabled = true;
    user.binaryTargetAmount = 0;
    user.targetStatus = undefined; // Remove target status
    user.accountType = undefined; // Remove free account type (set to normal)
    user.status = "inactive"; // Deactivate user
    await user.save();

    console.log(`   ✅ Unlocked account (withdrawEnabled = true)`);
    console.log(`   ✅ Removed binary target (binaryTargetAmount = 0)`);
    console.log(`   ✅ Removed target status`);
    console.log(`   ✅ Removed free account type`);
    console.log(`   ✅ Deactivated user (status = inactive)\n`);

    console.log(`✨ Cleanup completed successfully for ${userId}!\n`);

    return {
      success: true,
      investmentsDeleted: investments.length,
      transactionsDeleted: transactions.length,
      walletsReset: wallets.length,
      totalInvestmentRemoved: totalInvestmentAmount,
      totalWalletBalanceRemoved: totalWalletBalance
    };

  } catch (error: any) {
    console.error(`❌ Error cleaning up user ${userId}:`, error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

async function main() {
  const userIds = process.argv.slice(2);

  if (userIds.length === 0) {
    console.error("❌ Please provide user IDs as arguments");
    console.error("Usage: npx ts-node -r dotenv/config src/scripts/cleanupMistakenFreeAccounts.ts BIGBULL-000577 BIGBULL-000576 BIGBULL-000575");
    process.exit(1);
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧹 CLEANUP MISTAKEN FREE ACCOUNTS`);
  console.log(`${'='.repeat(80)}`);
  console.log(`\nUsers to cleanup: ${userIds.join(", ")}\n`);

  try {
    await connectdb();
    console.log("✅ Connected to database\n");

    const results = [];
    for (const userId of userIds) {
      const result = await cleanupUser(userId.trim());
      results.push({ userId, ...result });
    }

    // Summary
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 CLEANUP SUMMARY`);
    console.log(`${'='.repeat(80)}\n`);

    let totalInvestmentsDeleted = 0;
    let totalTransactionsDeleted = 0;
    let totalWalletsReset = 0;
    let totalInvestmentRemoved = 0;
    let totalWalletBalanceRemoved = 0;
    let successCount = 0;
    let failCount = 0;

    results.forEach((result) => {
      if (result.success) {
        successCount++;
        totalInvestmentsDeleted += result.investmentsDeleted || 0;
        totalTransactionsDeleted += result.transactionsDeleted || 0;
        totalWalletsReset += result.walletsReset || 0;
        totalInvestmentRemoved += result.totalInvestmentRemoved || 0;
        totalWalletBalanceRemoved += result.totalWalletBalanceRemoved || 0;
        console.log(`✅ ${result.userId}: Success`);
      } else {
        failCount++;
        console.log(`❌ ${result.userId}: Failed - ${result.error}`);
      }
    });

    console.log(`\n📈 Totals:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   💰 Investments deleted: ${totalInvestmentsDeleted}`);
    console.log(`   📝 Transactions deleted: ${totalTransactionsDeleted}`);
    console.log(`   💳 Wallets reset: ${totalWalletsReset}`);
    console.log(`   💵 Total investment removed: $${totalInvestmentRemoved.toFixed(2)}`);
    console.log(`   💵 Total wallet balance removed: $${totalWalletBalanceRemoved.toFixed(2)}\n`);

    await mongoose.connection.close();
    console.log("🔌 Disconnected from database\n");

    process.exit(failCount > 0 ? 1 : 0);
  } catch (error: any) {
    console.error("\n❌ FATAL ERROR:", error.message);
    console.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { cleanupUser };
