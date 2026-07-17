/**
 * Fix Script: Delete Duplicate Investment and Clean Up ROI
 * 
 * This script deletes Investment #2 (orphaned investment) for user BIGBULL-000282
 * and removes associated ROI transactions and updates ROI wallet balance.
 * 
 * Usage: npx ts-node -r dotenv/config src/scripts/fixDuplicateInvestment.ts [userId]
 * Example: npx ts-node -r dotenv/config src/scripts/fixDuplicateInvestment.ts BIGBULL-000282
 * 
 * The script will automatically find the orphaned investment (Investment #2) for the user.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Types } from "mongoose";
import * as path from "path";
import { User } from "../models/User";
import { Investment } from "../models/Investment";
import { WalletTransaction } from "../models/WalletTransaction";
import { Wallet } from "../models/Wallet";
import { Package } from "../models/Package";
import { Payment } from "../models/Payment";
import { WalletType } from "../models/types";

// Load environment variables
try {
  dotenv.config({ path: path.join(__dirname, '../../../.env') });
} catch (e) {}
try {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
} catch (e) {}
dotenv.config();

// Prioritize production database for this fix script
const MONGODB_URI = process.env.MONGODB_URL_PRODUCTION || process.env.MONGODB_URL_DEVELOPMENT || process.env.MONGODB_URI || "mongodb://localhost:27017/crown-bankers";

function formatDecimal128(value: any): number {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  if (value.toString) return parseFloat(value.toString());
  return 0;
}

async function connectDB() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/.*@/, "//***@")}\n`);
    
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");
    
    // Ensure models are registered
    User.modelName;
    Investment.modelName;
    WalletTransaction.modelName;
    Wallet.modelName;
    Package.modelName;
    Payment.modelName;
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

async function fixDuplicateInvestmentForUser(userId: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔧 FIXING DUPLICATE INVESTMENT FOR USER: ${userId}`);
  console.log(`${'='.repeat(80)}\n`);

  // Find user first
  let user = await User.findOne({ userId }).lean();
  if (!user && !userId.includes('-')) {
    user = await User.findOne({ userId: `BIGBULL-${userId}` }).lean();
  }
  if (!user && !userId.includes('-')) {
    user = await User.findOne({ userId: `CNEOX-${userId}` }).lean();
  }
  if (!user) {
    throw new Error(`User with userId "${userId}" not found. Tried: "${userId}", "BIGBULL-${userId}", "CNEOX-${userId}"`);
  }

  console.log(`✅ User Found: ${user.userId} (${user.name || 'N/A'})\n`);

  // Get all investments for this user
  const allInvestments = await Investment.find({ user: user._id })
    .populate('packageId', 'packageName')
    .sort({ createdAt: 1 })
    .lean();

  console.log(`📋 Found ${allInvestments.length} investments for user ${user.userId}\n`);

  if (allInvestments.length === 0) {
    throw new Error(`No investments found for user ${user.userId}`);
  }

  // Find investments with their linked payments
  const investmentsWithPayments = await Promise.all(
    allInvestments.map(async (inv) => {
      // Check if investment has linked payment via investmentId
      const paymentByInvestmentId = await Payment.findOne({ 
        investmentId: inv._id 
      }).lean();

      // Check if investment voucherId matches any payment's paymentId
      const paymentByVoucherId = inv.voucherId 
        ? await Payment.findOne({ 
            paymentId: inv.voucherId,
            user: user._id
          }).lean()
        : null;

      return {
        investment: inv,
        linkedPayment: paymentByInvestmentId || paymentByVoucherId,
        hasPayment: !!(paymentByInvestmentId || paymentByVoucherId)
      };
    })
  );

  // Find orphaned investment (Investment #2 - no linked payment)
  const orphanedInvestments = investmentsWithPayments.filter(inv => !inv.hasPayment);

  if (orphanedInvestments.length === 0) {
    console.log(`✅ No orphaned investments found. All investments have linked payments.\n`);
    return;
  }

  if (orphanedInvestments.length > 1) {
    console.log(`⚠️  Warning: Found ${orphanedInvestments.length} orphaned investments:`);
    orphanedInvestments.forEach((inv, idx) => {
      console.log(`   ${idx + 1}. Investment ID: ${inv.investment._id}, Amount: $${formatDecimal128(inv.investment.investedAmount).toFixed(2)}, voucherId: ${inv.investment.voucherId || 'N/A'}`);
    });
    console.log(`\n   Will delete the first one (oldest): ${orphanedInvestments[0].investment._id}\n`);
  }

  // Use the first orphaned investment (or the one specified)
  const investmentData = orphanedInvestments[0];
  const investment = investmentData.investment;

  console.log(`📋 Orphaned Investment Found:`);
  console.log(`   - ID: ${investment._id}`);
  console.log(`   - Amount: $${formatDecimal128(investment.investedAmount).toFixed(2)}`);
  console.log(`   - Package: ${(investment.packageId as any)?.packageName || 'N/A'}`);
  console.log(`   - voucherId: ${investment.voucherId || 'N/A'}`);
  console.log(`   - Created: ${new Date(investment.createdAt).toISOString()}`);
  console.log(`   - Total ROI Earned: $${formatDecimal128(investment.totalRoiEarned || 0).toFixed(2)}`);
  console.log(`   - Days Elapsed: ${investment.daysElapsed || 0}`);
  console.log(`   - Status: ${investment.isActive ? 'Active' : 'Inactive'}\n`);

  // Find all ROI transactions for this investment
  const userObjId = new Types.ObjectId((user as any)._id.toString());
  const roiWallet = await Wallet.findOne({ user: userObjId, type: WalletType.ROI });
  
  let roiTransactions: any[] = [];
  let totalROIToDeduct = 0;
  
  if (!roiWallet) {
    console.log("⚠️  ROI wallet not found, skipping ROI transaction cleanup\n");
  } else {
    console.log(`💰 Finding ROI transactions for investment ${investment._id}...`);
    
    // Find ROI transactions linked to this investment
    // ROI transactions have txRef = investmentId and meta.type = "roi_payout"
    roiTransactions = await WalletTransaction.find({
      user: userObjId,
      wallet: roiWallet._id,
      txRef: investment._id.toString(),
      'meta.type': 'roi_payout'
    }).sort({ createdAt: 1 }).lean();

    console.log(`   Found ${roiTransactions.length} ROI transactions\n`);

    if (roiTransactions.length > 0) {
      console.log(`📊 ROI Transactions to Delete:`);
      roiTransactions.forEach((tx, index) => {
        const amount = formatDecimal128(tx.amount);
        totalROIToDeduct += amount;
        console.log(`   ${index + 1}. Amount: $${amount.toFixed(2)}, Date: ${new Date(tx.createdAt).toISOString()}`);
      });
      console.log(`   Total ROI to deduct: $${totalROIToDeduct.toFixed(2)}\n`);

      // Update ROI wallet balance (deduct the ROI)
      const currentBalance = formatDecimal128(roiWallet.balance);
      const newBalance = Math.max(0, currentBalance - totalROIToDeduct);
      
      console.log(`💵 Updating ROI Wallet Balance:`);
      console.log(`   Current Balance: $${currentBalance.toFixed(2)}`);
      console.log(`   ROI to Deduct: $${totalROIToDeduct.toFixed(2)}`);
      console.log(`   New Balance: $${newBalance.toFixed(2)}\n`);

      // Delete ROI transactions
      console.log(`🗑️  Deleting ROI transactions...`);
      const deleteResult = await WalletTransaction.deleteMany({
        _id: { $in: roiTransactions.map(tx => tx._id) }
      });
      console.log(`   ✅ Deleted ${deleteResult.deletedCount} ROI transactions\n`);

      // Update wallet balance
      if (totalROIToDeduct > 0) {
        roiWallet.balance = Types.Decimal128.fromString(newBalance.toString());
        await roiWallet.save();
        console.log(`   ✅ Updated ROI wallet balance to $${newBalance.toFixed(2)}\n`);
      }
    } else {
      console.log(`   ⚠️  No ROI transactions found for this investment\n`);
    }
  }

  // Delete the investment
  const investmentId = investment._id.toString();
  console.log(`🗑️  Deleting investment ${investmentId}...`);
  const deleteResult = await Investment.deleteOne({ _id: investment._id });
  
  if (deleteResult.deletedCount === 0) {
    throw new Error(`Failed to delete investment ${investmentId}`);
  }

  console.log(`   ✅ Investment deleted successfully\n`);

  // Verify deletion
  const verifyInvestment = await Investment.findById(investment._id);
  if (verifyInvestment) {
    throw new Error(`Investment still exists after deletion attempt`);
  }

  console.log(`✅✅✅ FIX COMPLETED SUCCESSFULLY ✅✅✅\n`);
  console.log(`Summary:`);
  console.log(`   - Investment deleted: ${investmentId}`);
  if (roiTransactions && roiTransactions.length > 0) {
    console.log(`   - ROI transactions deleted: ${roiTransactions.length}`);
    const totalROI = roiTransactions.reduce((sum, tx) => sum + formatDecimal128(tx.amount), 0);
    console.log(`   - Total ROI deducted: $${totalROI.toFixed(2)}`);
    console.log(`   - ROI wallet balance updated`);
  }
  console.log(`\n${'='.repeat(80)}\n`);
}

async function main() {
  const userId = process.argv[2] || 'BIGBULL-000282'; // Default to BIGBULL-000282

  if (!userId) {
    console.error('❌ Error: User ID is required');
    console.error('Usage: npx ts-node -r dotenv/config src/scripts/fixDuplicateInvestment.ts [userId]');
    console.error('Example: npx ts-node -r dotenv/config src/scripts/fixDuplicateInvestment.ts BIGBULL-000282');
    console.error('   (If userId not provided, defaults to BIGBULL-000282)');
    process.exit(1);
  }

  try {
    await connectDB();
    await fixDuplicateInvestmentForUser(userId);
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

export { fixDuplicateInvestmentForUser };
