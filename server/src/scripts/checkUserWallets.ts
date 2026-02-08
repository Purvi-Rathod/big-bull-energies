/**
 * Check User Wallets and Business Volumes
 * 
 * Usage: npx ts-node -r dotenv/config src/scripts/checkUserWallets.ts [userId]
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

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URL_PRODUCTION || process.env.MONGODB_URL_DEVELOPMENT || process.env.MONGODB_URI || "mongodb://localhost:27017/crown-bankers";

async function connectDB() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");
}

async function checkUser(userId: string) {
  const user = await User.findOne({ userId }).lean();
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const userObjId = new Types.ObjectId(user._id.toString());

  // Get wallets
  const referralWallet = await Wallet.findOne({ user: userObjId, type: "referral" }).lean();
  const binaryWallet = await Wallet.findOne({ user: userObjId, type: "binary" }).lean();

  // Get binary tree
  const tree = await BinaryTree.findOne({ user: userObjId }).lean();

  // Get investments
  const investments = await Investment.find({ user: userObjId }).lean();

  // Get transactions
  const referralTransactions = await WalletTransaction.find({
    user: userObjId,
    walletType: "referral",
    type: "credit"
  }).sort({ createdAt: 1 }).lean();

  const binaryTransactions = await WalletTransaction.find({
    user: userObjId,
    walletType: "binary",
    type: "credit"
  }).sort({ createdAt: 1 }).lean();

  console.log(`\n${'='.repeat(100)}`);
  console.log(`USER: ${userId} (${(user as any).name || 'N/A'})`);
  console.log(`${'='.repeat(100)}\n`);

  console.log(`📊 WALLETS:`);
  console.log(`   Referral Wallet: $${parseFloat(referralWallet?.balance?.toString() || "0").toFixed(2)}`);
  console.log(`   Binary Wallet: $${parseFloat(binaryWallet?.balance?.toString() || "0").toFixed(2)}\n`);

  console.log(`📈 BINARY TREE:`);
  if (tree) {
    console.log(`   Left Business: $${parseFloat(tree.leftBusiness?.toString() || "0").toFixed(2)}`);
    console.log(`   Right Business: $${parseFloat(tree.rightBusiness?.toString() || "0").toFixed(2)}`);
    console.log(`   Left Matched: $${parseFloat(tree.leftMatched?.toString() || "0").toFixed(2)}`);
    console.log(`   Right Matched: $${parseFloat(tree.rightMatched?.toString() || "0").toFixed(2)}`);
    console.log(`   Left Carry: $${parseFloat(tree.leftCarry?.toString() || "0").toFixed(2)}`);
    console.log(`   Right Carry: $${parseFloat(tree.rightCarry?.toString() || "0").toFixed(2)}`);
  } else {
    console.log(`   No binary tree found`);
  }
  console.log();

  console.log(`💰 INVESTMENTS:`);
  const totalInvestment = investments.reduce((sum, inv) => {
    return sum + parseFloat((inv as any).investedAmount?.toString() || "0");
  }, 0);
  console.log(`   Total Investments: ${investments.length}`);
  console.log(`   Total Investment Amount: $${totalInvestment.toFixed(2)}`);
  investments.forEach((inv, idx) => {
    console.log(`   ${idx + 1}. $${parseFloat((inv as any).investedAmount?.toString() || "0").toFixed(2)} - ${(inv as any).isActive ? 'Active' : 'Inactive'}`);
  });
  console.log();

  console.log(`📝 REFERRAL TRANSACTIONS (${referralTransactions.length}):`);
  let totalReferral = 0;
  referralTransactions.forEach((txn, idx) => {
    const amount = parseFloat((txn as any).amount?.toString() || "0");
    totalReferral += amount;
    console.log(`   ${idx + 1}. $${amount.toFixed(2)} - ${(txn as any).createdAt}`);
  });
  console.log(`   Total Referral Credits: $${totalReferral.toFixed(2)}\n`);

  console.log(`📝 BINARY TRANSACTIONS (${binaryTransactions.length}):`);
  let totalBinary = 0;
  binaryTransactions.forEach((txn, idx) => {
    const amount = parseFloat((txn as any).amount?.toString() || "0");
    totalBinary += amount;
    console.log(`   ${idx + 1}. $${amount.toFixed(2)} - ${(txn as any).createdAt}`);
  });
  console.log(`   Total Binary Credits: $${totalBinary.toFixed(2)}\n`);

  // Calculate expected values
  console.log(`🔍 EXPECTED VALUES:`);
  
  // Expected referral: 7% of first investment from each direct downline
  // Need to check downlines' first investments
  const downlines = await User.find({ referrer: userObjId }).select("_id userId").lean();
  let expectedReferral = 0;
  
  for (const downline of downlines) {
    const downlineObjId = new Types.ObjectId(downline._id.toString());
    const downlineInvestments = await Investment.find({ user: downlineObjId }).sort({ createdAt: 1 }).lean();
    if (downlineInvestments.length > 0) {
      const firstInvestment = downlineInvestments[0];
      const firstAmount = parseFloat((firstInvestment as any).investedAmount?.toString() || "0");
      expectedReferral += firstAmount * 0.07; // 7% referral
    }
  }
  
  console.log(`   Expected Referral (7% of first investments from ${downlines.length} direct downlines): $${expectedReferral.toFixed(2)}`);
  
  // Expected binary: Based on matched volume
  // For now, show what should be based on business volume
  if (tree) {
    const leftBusiness = parseFloat(tree.leftBusiness?.toString() || "0");
    const rightBusiness = parseFloat(tree.rightBusiness?.toString() || "0");
    const matched = Math.min(leftBusiness, rightBusiness);
    const expectedBinary = matched * 0.10; // 10% binary
    console.log(`   Expected Binary (10% of matched volume): $${expectedBinary.toFixed(2)}`);
    console.log(`   Matched Volume: $${matched.toFixed(2)}`);
  }

  console.log(`\n${'='.repeat(100)}\n`);

  return {
    userId,
    referralBalance: parseFloat(referralWallet?.balance?.toString() || "0"),
    binaryBalance: parseFloat(binaryWallet?.balance?.toString() || "0"),
    expectedReferral,
    totalInvestment,
    tree
  };
}

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error("Usage: npx ts-node -r dotenv/config src/scripts/checkUserWallets.ts [userId]");
    process.exit(1);
  }

  try {
    await connectDB();
    await checkUser(userId);
    await mongoose.disconnect();
  } catch (error: any) {
    console.error("Error:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { checkUser };
