/**
 * Fix Wallet Balances Based on Actual Business Volumes
 * 
 * This script corrects wallet balances when business volumes were adjusted
 * but wallet amounts weren't updated accordingly.
 * 
 * Usage: npx ts-node -r dotenv/config src/scripts/fixWalletBalances.ts [userId1] [userId2] ...
 * Example: npx ts-node -r dotenv/config src/scripts/fixWalletBalances.ts CROWN-000282 CROWN-000281
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Types } from "mongoose";
import * as path from "path";
import { User } from "../models/User";
import { BinaryTree } from "../models/BinaryTree";
import { Wallet } from "../models/Wallet";
import { Investment } from "../models/Investment";
import { WalletTransaction } from "../models/WalletTransaction";
import { WalletType } from "../models/types";
import { updateWallet } from "../services/investment.service";
import { createWalletTransaction } from "../services/transaction.service";

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URL_PRODUCTION || process.env.MONGODB_URL_DEVELOPMENT || process.env.MONGODB_URI || "mongodb://localhost:27017/crown-bankers";

async function connectDB() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");
}

async function disconnectDB() {
  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}

/**
 * Calculate expected referral bonus for a user
 * Referral bonus is based on package referralPct (default 7% or 8%)
 */
async function calculateExpectedReferral(userId: Types.ObjectId): Promise<number> {
  const Package = (await import("../models/Package")).Package;
  const downlines = await User.find({ referrer: userId }).select("_id userId").lean();
  let expectedReferral = 0;
  
  for (const downline of downlines) {
    const downlineObjId = new Types.ObjectId(downline._id.toString());
    const downlineInvestments = await Investment.find({ user: downlineObjId })
      .populate("packageId")
      .sort({ createdAt: 1 })
      .lean();
    
    if (downlineInvestments.length > 0) {
      const firstInvestment = downlineInvestments[0];
      const firstAmount = parseFloat((firstInvestment as any).investedAmount?.toString() || "0");
      
      // Get referral percentage from package (use referralPct, fallback to levelOneReferral, default 7%)
      const pkg = (firstInvestment as any).packageId;
      const referralPct = pkg?.referralPct || pkg?.levelOneReferral || 7;
      
      expectedReferral += firstAmount * (referralPct / 100);
    }
  }
  
  return expectedReferral;
}

/**
 * Calculate expected binary bonus for a user
 * Binary bonus is 10% of matched volume (what has been matched so far)
 * The matched volume is tracked in leftMatched and rightMatched
 * We use the minimum of leftMatched and rightMatched as the actual matched volume
 */
async function calculateExpectedBinary(userId: Types.ObjectId): Promise<number> {
  const tree = await BinaryTree.findOne({ user: userId }).lean();
  if (!tree) {
    return 0;
  }
  
  const leftMatched = parseFloat(tree.leftMatched?.toString() || "0");
  const rightMatched = parseFloat(tree.rightMatched?.toString() || "0");
  
  // The matched volume is the minimum of leftMatched and rightMatched
  // This represents the actual volume that has been matched and should have earned binary bonus
  const matchedVolume = Math.min(leftMatched, rightMatched);
  
  // Binary bonus is 10% of matched volume
  return matchedVolume * 0.10;
}

/**
 * Fix wallet balances for a user
 */
async function fixUserWallets(userId: string) {
  console.log(`\n${'─'.repeat(100)}`);
  console.log(`🔍 Processing user: ${userId}`);
  
  try {
    // Find user
    const user = await User.findOne({ userId }).select("_id userId name").lean();
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    const userObjId = new Types.ObjectId(user._id.toString());
    console.log(`   ✅ User found: ${(user as any).userId} (${(user as any).name || 'N/A'})`);
    
    // Get current wallets
    const referralWallet = await Wallet.findOne({ user: userObjId, type: WalletType.REFERRAL });
    const binaryWallet = await Wallet.findOne({ user: userObjId, type: WalletType.BINARY });
    
    const currentReferralBalance = parseFloat(referralWallet?.balance?.toString() || "0");
    const currentBinaryBalance = parseFloat(binaryWallet?.balance?.toString() || "0");
    
    console.log(`\n   📊 Current Wallet Balances:`);
    console.log(`      Referral: $${currentReferralBalance.toFixed(2)}`);
    console.log(`      Binary: $${currentBinaryBalance.toFixed(2)}`);
    
    // Get binary tree for detailed logging
    const tree = await BinaryTree.findOne({ user: userObjId }).lean();
    if (tree) {
      const leftBusiness = parseFloat(tree.leftBusiness?.toString() || "0");
      const rightBusiness = parseFloat(tree.rightBusiness?.toString() || "0");
      const leftMatched = parseFloat(tree.leftMatched?.toString() || "0");
      const rightMatched = parseFloat(tree.rightMatched?.toString() || "0");
      
      console.log(`\n   📈 Business Volumes:`);
      console.log(`      Left Business: $${leftBusiness.toFixed(2)}`);
      console.log(`      Right Business: $${rightBusiness.toFixed(2)}`);
      console.log(`      Left Matched: $${leftMatched.toFixed(2)}`);
      console.log(`      Right Matched: $${rightMatched.toFixed(2)}`);
      console.log(`      Matched Volume: $${Math.min(leftMatched, rightMatched).toFixed(2)}`);
    }
    
    // Get direct downlines for referral calculation
    const Package = (await import("../models/Package")).Package;
    const downlines = await User.find({ referrer: userObjId }).select("_id userId name").lean();
    console.log(`\n   👥 Direct Downlines: ${downlines.length}`);
    for (const downline of downlines) {
      const downlineObjId = new Types.ObjectId(downline._id.toString());
      const firstInvestment = await Investment.findOne({ user: downlineObjId })
        .populate("packageId")
        .sort({ createdAt: 1 })
        .lean();
      if (firstInvestment) {
        const amount = parseFloat((firstInvestment as any).investedAmount?.toString() || "0");
        const pkg = (firstInvestment as any).packageId;
        const referralPct = pkg?.referralPct || pkg?.levelOneReferral || 7;
        const referral = amount * (referralPct / 100);
        console.log(`      - ${(downline as any).userId}: First investment $${amount.toFixed(2)} → Referral $${referral.toFixed(2)} (${referralPct}%)`);
      }
    }
    
    // Calculate expected amounts
    const expectedReferral = await calculateExpectedReferral(userObjId);
    const expectedBinary = await calculateExpectedBinary(userObjId);
    
    console.log(`\n   📐 Expected Wallet Balances:`);
    console.log(`      Referral (based on package referral %): $${expectedReferral.toFixed(2)}`);
    console.log(`      Binary (10% of matched volume): $${expectedBinary.toFixed(2)}`);
    
    // Calculate differences
    const referralDiff = expectedReferral - currentReferralBalance;
    const binaryDiff = expectedBinary - currentBinaryBalance;
    
    console.log(`\n   🔧 Adjustments Needed:`);
    console.log(`      Referral: ${referralDiff >= 0 ? '+' : ''}$${referralDiff.toFixed(2)}`);
    console.log(`      Binary: ${binaryDiff >= 0 ? '+' : ''}$${binaryDiff.toFixed(2)}`);
    
    if (Math.abs(referralDiff) < 0.01 && Math.abs(binaryDiff) < 0.01) {
      console.log(`\n   ✅ No adjustments needed. Wallets are correct.`);
      return { fixed: false, message: "No adjustments needed" };
    }
    
    // Apply adjustments
    const adjustments: Array<{ walletType: WalletType; amount: number; operation: "add" | "subtract" }> = [];
    
    if (Math.abs(referralDiff) >= 0.01) {
      if (referralDiff > 0) {
        // Need to add
        adjustments.push({ walletType: WalletType.REFERRAL, amount: referralDiff, operation: "add" });
      } else {
        // Need to subtract
        adjustments.push({ walletType: WalletType.REFERRAL, amount: Math.abs(referralDiff), operation: "subtract" });
      }
    }
    
    if (Math.abs(binaryDiff) >= 0.01) {
      if (binaryDiff > 0) {
        // Need to add
        adjustments.push({ walletType: WalletType.BINARY, amount: binaryDiff, operation: "add" });
      } else {
        // Need to subtract
        adjustments.push({ walletType: WalletType.BINARY, amount: Math.abs(binaryDiff), operation: "subtract" });
      }
    }
    
    console.log(`\n   🔄 Applying adjustments...`);
    
    for (const adjustment of adjustments) {
      // Get wallet before making changes
      let wallet = await Wallet.findOne({ user: userObjId, type: adjustment.walletType });
      if (!wallet) {
        console.log(`      ⚠️  ${adjustment.walletType} wallet not found, creating...`);
        wallet = await Wallet.create({
          user: userObjId,
          type: adjustment.walletType,
          balance: Types.Decimal128.fromString("0"),
          reserved: Types.Decimal128.fromString("0"),
          currency: "USD",
        });
      }
      
      const balanceBefore = parseFloat(wallet.balance?.toString() || "0");
      
      // Update wallet balance
      if (adjustment.operation === "add") {
        await updateWallet(userObjId, adjustment.walletType, adjustment.amount, "add");
        console.log(`      ✅ Added $${adjustment.amount.toFixed(2)} to ${adjustment.walletType} wallet`);
      } else {
        await updateWallet(userObjId, adjustment.walletType, adjustment.amount, "subtract");
        console.log(`      ✅ Subtracted $${adjustment.amount.toFixed(2)} from ${adjustment.walletType} wallet`);
      }
      
      // Get updated wallet to get balanceAfter
      const updatedWallet = await Wallet.findOne({ user: userObjId, type: adjustment.walletType });
      const balanceAfter = parseFloat(updatedWallet?.balance?.toString() || "0");
      
      // Create adjustment transaction record
      await createWalletTransaction(
        userObjId,
        adjustment.walletType,
        adjustment.operation === "add" ? "credit" : "debit",
        adjustment.amount,
        undefined, // txRef
        {
          type: adjustment.walletType === WalletType.REFERRAL ? "referral" : "binary",
          description: `Wallet balance correction based on actual business volumes`,
          adjustment: true,
          balanceBefore,
          balanceAfter,
        }
      );
      
      console.log(`      📝 Transaction recorded`);
    }
    
    // Show final balances
    const finalReferralWallet = await Wallet.findOne({ user: userObjId, type: WalletType.REFERRAL });
    const finalBinaryWallet = await Wallet.findOne({ user: userObjId, type: WalletType.BINARY });
    
    console.log(`\n   📊 Final Wallet Balances:`);
    console.log(`      Referral: $${parseFloat(finalReferralWallet?.balance?.toString() || "0").toFixed(2)}`);
    console.log(`      Binary: $${parseFloat(finalBinaryWallet?.balance?.toString() || "0").toFixed(2)}`);
    
    // Verify
    const finalReferralBalance = parseFloat(finalReferralWallet?.balance?.toString() || "0");
    const finalBinaryBalance = parseFloat(finalBinaryWallet?.balance?.toString() || "0");
    
    const referralMatch = Math.abs(finalReferralBalance - expectedReferral) < 0.01;
    const binaryMatch = Math.abs(finalBinaryBalance - expectedBinary) < 0.01;
    
    if (referralMatch && binaryMatch) {
      console.log(`\n   ✅ Wallets corrected successfully!`);
      return { 
        fixed: true, 
        message: "Wallets corrected successfully",
        referralAdjustment: referralDiff,
        binaryAdjustment: binaryDiff
      };
    } else {
      console.log(`\n   ⚠️  Wallets may not match expected values exactly:`);
      if (!referralMatch) {
        console.log(`      Referral: Expected $${expectedReferral.toFixed(2)}, Got $${finalReferralBalance.toFixed(2)}`);
      }
      if (!binaryMatch) {
        console.log(`      Binary: Expected $${expectedBinary.toFixed(2)}, Got $${finalBinaryBalance.toFixed(2)}`);
      }
      return { 
        fixed: true, 
        message: "Wallets adjusted but may not match exactly",
        referralAdjustment: referralDiff,
        binaryAdjustment: binaryDiff
      };
    }
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    throw error;
  }
}

async function main() {
  const userIds = process.argv.slice(2);
  
  if (userIds.length === 0) {
    console.error("❌ Error: At least one user ID required");
    console.error("Usage: npx ts-node -r dotenv/config src/scripts/fixWalletBalances.ts [userId1] [userId2] ...");
    console.error("Example: npx ts-node -r dotenv/config src/scripts/fixWalletBalances.ts CROWN-000282 CROWN-000281");
    process.exit(1);
  }
  
  try {
    await connectDB();
    
    console.log(`\n⚠️  WARNING: This script will modify wallet balances!`);
    console.log(`   Users to process: ${userIds.join(", ")}\n`);
    
    const results: Array<{ userId: string; success: boolean; message: string }> = [];
    let successCount = 0;
    let failureCount = 0;
    
    for (const userId of userIds) {
      try {
        const result = await fixUserWallets(userId);
        results.push({ userId, success: true, message: result.message });
        successCount++;
      } catch (error: any) {
        results.push({ userId, success: false, message: error.message });
        failureCount++;
      }
    }
    
    // Summary
    console.log(`\n${'='.repeat(100)}`);
    console.log(`📊 SUMMARY`);
    console.log(`${'='.repeat(100)}\n`);
    
    console.log(`Total users processed: ${userIds.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}\n`);
    
    if (failureCount > 0) {
      console.log(`❌ Failed fixes:`);
      results.filter(r => !r.success).forEach((result) => {
        console.log(`   - ${result.userId}: ${result.message}`);
      });
      console.log();
    }
    
    if (successCount > 0) {
      console.log(`✅ Successfully fixed:`);
      results.filter(r => r.success).forEach((result) => {
        console.log(`   - ${result.userId}: ${result.message}`);
      });
      console.log();
    }
    
    await disconnectDB();
    
    if (failureCount > 0) {
      console.log(`⚠️  Some fixes failed. Please review the errors above.\n`);
      process.exit(1);
    } else {
      console.log(`✅ All wallet balances corrected successfully!\n`);
    }
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

export { fixUserWallets, calculateExpectedReferral, calculateExpectedBinary };
