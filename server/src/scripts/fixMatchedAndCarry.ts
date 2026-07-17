/**
 * Fix Matched Amounts and Recalculate Carry Forward
 * 
 * This script fixes cases where matched amounts exceed business volumes
 * and recalculates carry forward according to the rulebook.
 * 
 * Usage: npx ts-node -r dotenv/config src/scripts/fixMatchedAndCarry.ts [userId1] [userId2] ...
 * Example: npx ts-node -r dotenv/config src/scripts/fixMatchedAndCarry.ts BIGBULL-000532 BIGBULL-000281
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Types } from "mongoose";
import * as path from "path";
import * as fs from "fs";
import { User } from "../models/User";
import { BinaryTree } from "../models/BinaryTree";
import { Wallet } from "../models/Wallet";
import { WalletType } from "../models/types";
import { calculateBinaryBonus, updateWallet } from "../services/investment.service";
import { createBinaryTransaction } from "../services/transaction.service";

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

async function connectDB() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/.*@/, "//***@")}\n`);
    
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");
    
    User.modelName;
    BinaryTree.modelName;
    Wallet.modelName;
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

/**
 * Fix matched amounts and recalculate carry forward for a user
 */
async function fixUserMatchedAndCarry(userId: string) {
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
    
    // Find binary tree
    const tree = await BinaryTree.findOne({ user: userObjId });
    if (!tree) {
      throw new Error(`Binary tree not found for user ${userId}`);
    }
    
    console.log(`   ✅ Binary tree found`);
    
    // Get current values
    const leftBusiness = parseFloat(tree.leftBusiness?.toString() || "0");
    const rightBusiness = parseFloat(tree.rightBusiness?.toString() || "0");
    const leftCarry = parseFloat(tree.leftCarry?.toString() || "0");
    const rightCarry = parseFloat(tree.rightCarry?.toString() || "0");
    const leftMatched = parseFloat(tree.leftMatched?.toString() || "0");
    const rightMatched = parseFloat(tree.rightMatched?.toString() || "0");
    
    console.log(`   📊 Current values:`);
    console.log(`      Left Business: $${leftBusiness.toFixed(2)}`);
    console.log(`      Right Business: $${rightBusiness.toFixed(2)}`);
    console.log(`      Left Carry: $${leftCarry.toFixed(2)}`);
    console.log(`      Right Carry: $${rightCarry.toFixed(2)}`);
    console.log(`      Left Matched: $${leftMatched.toFixed(2)}`);
    console.log(`      Right Matched: $${rightMatched.toFixed(2)}`);
    
    // Check for issues
    const leftMatchedIssue = leftMatched > leftBusiness;
    const rightMatchedIssue = rightMatched > rightBusiness;
    
    if (!leftMatchedIssue && !rightMatchedIssue) {
      console.log(`   ℹ️  No issues found. Matched amounts are within business volumes.`);
      return { fixed: false, message: "No issues found" };
    }
    
    console.log(`   ⚠️  Issues detected:`);
    if (leftMatchedIssue) {
      console.log(`      ❌ Left Matched ($${leftMatched.toFixed(2)}) exceeds Left Business ($${leftBusiness.toFixed(2)})`);
    }
    if (rightMatchedIssue) {
      console.log(`      ❌ Right Matched ($${rightMatched.toFixed(2)}) exceeds Right Business ($${rightBusiness.toFixed(2)})`);
    }
    
    // Fix: Reset matched amounts to not exceed business volumes
    // Matched cannot exceed business, so we cap it at business volume
    const fixedLeftMatched = Math.min(leftMatched, leftBusiness);
    const fixedRightMatched = Math.min(rightMatched, rightBusiness);
    
    console.log(`\n   🔧 Fixing matched amounts:`);
    if (leftMatchedIssue) {
      console.log(`      Left Matched: $${leftMatched.toFixed(2)} → $${fixedLeftMatched.toFixed(2)}`);
    }
    if (rightMatchedIssue) {
      console.log(`      Right Matched: $${rightMatched.toFixed(2)} → $${fixedRightMatched.toFixed(2)}`);
    }
    
    // Update matched amounts first
    tree.leftMatched = Types.Decimal128.fromString(fixedLeftMatched.toString());
    tree.rightMatched = Types.Decimal128.fromString(fixedRightMatched.toString());
    await tree.save();
    
    console.log(`   ✅ Matched amounts fixed`);
    
    // Recalculate carry forward and binary bonus
    // According to rulebook:
    // left_available = leftCarry + (leftBusiness - leftMatched)
    // right_available = rightCarry + (rightBusiness - rightMatched)
    // matched = min(left_available, right_available)
    // newLeftCarry = left_available - matched
    // newRightCarry = right_available - matched
    
    const leftUnmatchedBusiness = leftBusiness - fixedLeftMatched;
    const rightUnmatchedBusiness = rightBusiness - fixedRightMatched;
    const leftAvailable = leftCarry + leftUnmatchedBusiness;
    const rightAvailable = rightCarry + rightUnmatchedBusiness;
    
    console.log(`\n   📐 Recalculating carry forward:`);
    console.log(`      Left Unmatched Business: $${leftUnmatchedBusiness.toFixed(2)}`);
    console.log(`      Right Unmatched Business: $${rightUnmatchedBusiness.toFixed(2)}`);
    console.log(`      Left Available: $${leftAvailable.toFixed(2)}`);
    console.log(`      Right Available: $${rightAvailable.toFixed(2)}`);
    
    // Calculate matched volume
    const matched = Math.min(leftAvailable, rightAvailable);
    console.log(`      Matched Volume: $${matched.toFixed(2)}`);
    
    // Calculate new carry forward
    const newLeftCarry = Math.max(0, leftAvailable - matched);
    const newRightCarry = Math.max(0, rightAvailable - matched);
    
    console.log(`      New Left Carry: $${newLeftCarry.toFixed(2)}`);
    console.log(`      New Right Carry: $${newRightCarry.toFixed(2)}`);
    
    // Calculate consumption from carry vs business
    const leftConsumedFromCarry = Math.min(leftCarry, matched);
    const rightConsumedFromCarry = Math.min(rightCarry, matched);
    const leftConsumedFromBusiness = matched - leftConsumedFromCarry;
    const rightConsumedFromBusiness = matched - rightConsumedFromCarry;
    
    // Update matched amounts based on consumption
    const newLeftMatched = fixedLeftMatched + leftConsumedFromBusiness;
    const newRightMatched = fixedRightMatched + rightConsumedFromBusiness;
    
    console.log(`\n   📊 Consumption breakdown:`);
    console.log(`      Left consumed from carry: $${leftConsumedFromCarry.toFixed(2)}`);
    console.log(`      Left consumed from business: $${leftConsumedFromBusiness.toFixed(2)}`);
    console.log(`      Right consumed from carry: $${rightConsumedFromCarry.toFixed(2)}`);
    console.log(`      Right consumed from business: $${rightConsumedFromBusiness.toFixed(2)}`);
    console.log(`      New Left Matched: $${newLeftMatched.toFixed(2)}`);
    console.log(`      New Right Matched: $${newRightMatched.toFixed(2)}`);
    
    // Update binary tree
    const updatedTree = await BinaryTree.findOneAndUpdate(
      { user: userObjId },
      {
        $set: {
          leftCarry: Types.Decimal128.fromString(newLeftCarry.toString()),
          rightCarry: Types.Decimal128.fromString(newRightCarry.toString()),
          leftMatched: Types.Decimal128.fromString(newLeftMatched.toString()),
          rightMatched: Types.Decimal128.fromString(newRightMatched.toString()),
        },
      },
      { new: true }
    );
    
    if (!updatedTree) {
      throw new Error("Failed to update binary tree");
    }
    
    console.log(`   ✅ Binary tree updated`);
    
    // Calculate binary bonus if there's matching
    if (matched > 0) {
      console.log(`\n   💰 Calculating binary bonus...`);
      
      // Get user's active investment to determine binary percentage and power capacity
      const Investment = (await import("../models/Investment")).Investment;
      const Package = (await import("../models/Package")).Package;
      
      const activeInvestment = await Investment.findOne({ 
        user: userObjId, 
        isActive: true 
      }).populate("package");
      
      let binaryPct = 10; // Default 10%
      let powerCapacity = 1000; // Default $1000
      
      if (activeInvestment && (activeInvestment as any).package) {
        const pkg = (activeInvestment as any).package;
        binaryPct = pkg.binaryPct || 10;
        powerCapacity = pkg.powerCapacity || 1000;
        console.log(`      Using package: ${pkg.name || 'N/A'} (Binary: ${binaryPct}%, Cap: $${powerCapacity})`);
      } else {
        console.log(`      No active investment found, using defaults (Binary: ${binaryPct}%, Cap: $${powerCapacity})`);
      }
      
      // Calculate binary bonus
      const binaryResult = await calculateBinaryBonus(userObjId, binaryPct, powerCapacity);
      
      console.log(`      Matched Volume: $${binaryResult.matched.toFixed(2)}`);
      console.log(`      Binary Bonus: $${binaryResult.binaryBonus.toFixed(2)}`);
      console.log(`      Credited Bonus: $${binaryResult.creditedBonus.toFixed(2)}`);
      
      // Credit binary bonus to wallet
      if (binaryResult.creditedBonus > 0) {
        const binaryWallet = await Wallet.findOne({ 
          user: userObjId, 
          type: WalletType.BINARY 
        });
        
        if (binaryWallet) {
          const balanceBefore = parseFloat(binaryWallet.balance?.toString() || "0");
          await updateWallet(
            userObjId,
            WalletType.BINARY,
            binaryResult.creditedBonus,
            "add"
          );
          
          // Create transaction record
          await createBinaryTransaction(
            userObjId,
            binaryResult.creditedBonus,
            undefined, // fromUserId (recalculation, not from specific user)
            undefined // investmentId (recalculation)
          );
          
          const updatedWallet = await Wallet.findOne({ 
            user: userObjId, 
            type: WalletType.BINARY 
          });
          const balanceAfter = parseFloat(updatedWallet?.balance?.toString() || "0");
          
          console.log(`      Binary Wallet:`);
          console.log(`         Balance Before: $${balanceBefore.toFixed(2)}`);
          console.log(`         Balance After: $${balanceAfter.toFixed(2)}`);
          console.log(`         Credited: $${binaryResult.creditedBonus.toFixed(2)}`);
        } else {
          console.log(`      ⚠️  Binary wallet not found for user`);
        }
      } else {
        console.log(`      ℹ️  No binary bonus to credit (matched volume is 0)`);
      }
    } else {
      console.log(`\n   ℹ️  No matching volume, skipping binary bonus calculation`);
    }
    
    // Show final values
    const finalTree = await BinaryTree.findOne({ user: userObjId });
    if (finalTree) {
      console.log(`\n   📊 Final values:`);
      console.log(`      Left Business: $${parseFloat(finalTree.leftBusiness?.toString() || "0").toFixed(2)}`);
      console.log(`      Right Business: $${parseFloat(finalTree.rightBusiness?.toString() || "0").toFixed(2)}`);
      console.log(`      Left Carry: $${parseFloat(finalTree.leftCarry?.toString() || "0").toFixed(2)}`);
      console.log(`      Right Carry: $${parseFloat(finalTree.rightCarry?.toString() || "0").toFixed(2)}`);
      console.log(`      Left Matched: $${parseFloat(finalTree.leftMatched?.toString() || "0").toFixed(2)}`);
      console.log(`      Right Matched: $${parseFloat(finalTree.rightMatched?.toString() || "0").toFixed(2)}`);
    }
    
    return { 
      fixed: true, 
      message: "Successfully fixed matched amounts and recalculated carry forward",
      matched,
      binaryBonus: matched > 0 ? (await calculateBinaryBonus(userObjId, 10, 1000)).creditedBonus : 0
    };
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
    console.error("Usage: npx ts-node -r dotenv/config src/scripts/fixMatchedAndCarry.ts [userId1] [userId2] ...");
    console.error("Example: npx ts-node -r dotenv/config src/scripts/fixMatchedAndCarry.ts BIGBULL-000532 BIGBULL-000281");
    process.exit(1);
  }
  
  try {
    await connectDB();
    
    console.log(`\n⚠️  WARNING: This script will modify binary tree data and update wallets!`);
    console.log(`   Users to process: ${userIds.join(", ")}\n`);
    
    const results: Array<{ userId: string; success: boolean; message: string }> = [];
    let successCount = 0;
    let failureCount = 0;
    
    for (const userId of userIds) {
      try {
        const result = await fixUserMatchedAndCarry(userId);
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
      console.log(`✅ All fixes applied successfully!\n`);
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

export { fixUserMatchedAndCarry };
