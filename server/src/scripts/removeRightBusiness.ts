/**
 * Remove Right Business Script
 *
 * Zeros out right-side business for specified accounts to prevent them from
 * receiving binary income in the next daily calculation.
 *
 * Affected accounts:
 *   BIGBULL-000220 - Right business $7000
 *   BIGBULL-000637 - Right business $6000
 *   BIGBULL-000638 - Right business $5000
 *   BIGBULL-000639 - Right business $4000
 *   BIGBULL-000640 - Right business $3000
 *   BIGBULL-000641 - Right business $2000
 *   BIGBULL-000642 - Right business $1000
 *
 * Usage: npx ts-node -r dotenv/config src/scripts/removeRightBusiness.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Types } from "mongoose";
import * as path from "path";
import { User } from "../models/User";
import { BinaryTree } from "../models/BinaryTree";

// Load environment variables
try {
  dotenv.config({ path: path.join(__dirname, "../../../.env") });
} catch (e) {}
try {
  dotenv.config({ path: path.join(__dirname, "../../.env") });
} catch (e) {}
dotenv.config();

// Prioritize production database
const MONGODB_URI =
  process.env.MONGODB_URL_PRODUCTION ||
  process.env.MONGODB_URL_DEVELOPMENT ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/crown-bankers";

const USER_IDS_TO_UPDATE = [
  "BIGBULL-000220",
  "BIGBULL-000637",
  "BIGBULL-000638",
  "BIGBULL-000639",
  "BIGBULL-000640",
  "BIGBULL-000641",
  "BIGBULL-000642",
];

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

async function removeRightBusiness() {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`🔧 REMOVE RIGHT BUSINESS (Prevent Binary Income)`);
  console.log(`${"=".repeat(80)}\n`);

  console.log(`📋 Accounts to update: ${USER_IDS_TO_UPDATE.length}\n`);

  const results: Array<{ userId: string; success: boolean; message: string }> = [];
  let successCount = 0;
  let failureCount = 0;

  for (const userId of USER_IDS_TO_UPDATE) {
    console.log(`\n${"─".repeat(80)}`);
    console.log(`🔍 Processing ${userId}...`);

    try {
      const user = await User.findOne({ userId }).select("_id userId name").lean();
      if (!user) {
        const errorMsg = `User ${userId} not found`;
        console.error(`   ❌ ${errorMsg}`);
        results.push({ userId, success: false, message: errorMsg });
        failureCount++;
        continue;
      }

      const userObjId = new Types.ObjectId(user._id.toString());
      console.log(`   ✅ User found: ${(user as any).userId} (${(user as any).name || "N/A"})`);

      const tree = await BinaryTree.findOne({ user: userObjId });
      if (!tree) {
        const errorMsg = `Binary tree not found for user ${userId}`;
        console.error(`   ❌ ${errorMsg}`);
        results.push({ userId, success: false, message: errorMsg });
        failureCount++;
        continue;
      }

      const currentRightBusiness = parseFloat(tree.rightBusiness?.toString() || "0");
      const currentRightPowerleg = parseFloat(tree.rightPowerlegBusiness?.toString() || "0");
      const currentRightCarry = parseFloat(tree.rightCarry?.toString() || "0");
      const currentRightMatched = parseFloat(tree.rightMatched?.toString() || "0");

      console.log(`   📊 Current right-side values:`);
      console.log(`      rightBusiness: $${currentRightBusiness.toFixed(2)}`);
      console.log(`      rightPowerlegBusiness: $${currentRightPowerleg.toFixed(2)}`);
      console.log(`      rightCarry: $${currentRightCarry.toFixed(2)}`);
      console.log(`      rightMatched: $${currentRightMatched.toFixed(2)}`);

      if (
        currentRightBusiness === 0 &&
        currentRightPowerleg === 0 &&
        currentRightCarry === 0 &&
        currentRightMatched === 0
      ) {
        console.log(`   ⏭️  Skipping: Right business already zero`);
        results.push({ userId, success: true, message: "Already zero (no changes needed)" });
        successCount++;
        continue;
      }

      // Zero out all right-side business fields
      tree.rightBusiness = Types.Decimal128.fromString("0");
      tree.rightPowerlegBusiness = Types.Decimal128.fromString("0");
      tree.rightCarry = Types.Decimal128.fromString("0");
      tree.rightMatched = Types.Decimal128.fromString("0");

      await tree.save();

      console.log(`   ✅ Successfully removed right business for ${userId}`);
      results.push({ userId, success: true, message: "Right business zeroed" });
      successCount++;
    } catch (error: any) {
      const errorMsg = `Error: ${error.message}`;
      console.error(`   ❌ ${errorMsg}`);
      results.push({ userId, success: false, message: errorMsg });
      failureCount++;
    }
  }

  // Summary
  console.log(`\n${"=".repeat(80)}`);
  console.log(`📊 SUMMARY`);
  console.log(`${"=".repeat(80)}\n`);

  console.log(`Total accounts: ${USER_IDS_TO_UPDATE.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}\n`);

  if (failureCount > 0) {
    console.log(`❌ Failed:`);
    results.filter((r) => !r.success).forEach((r) => console.log(`   - ${r.userId}: ${r.message}`));
  }

  return { successCount, failureCount, results };
}

async function main() {
  try {
    await connectDB();

    console.log(`\n⚠️  WARNING: This will zero out right business for ${USER_IDS_TO_UPDATE.length} accounts.`);
    console.log(`   These accounts will NOT receive binary income in the next daily run.\n`);

    const result = await removeRightBusiness();

    await disconnectDB();

    if (result.failureCount > 0) {
      process.exit(1);
    } else {
      console.log(`✅ All accounts updated successfully!\n`);
    }
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    await disconnectDB();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { removeRightBusiness, USER_IDS_TO_UPDATE };
