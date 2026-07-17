/**
 * Diagnostic Script: User Account & Free-Activation Rules Check
 *
 * For a given userId, loads user profile, investments (including free),
 * wallets, and binary tree; validates against RULEBOOK (especially
 * Free Account / funded activation rules) and reports OK vs issues.
 *
 * Usage: npx ts-node -r dotenv/config src/scripts/diagnoseUserAccount.ts [userId]
 * Example: npx ts-node -r dotenv/config src/scripts/diagnoseUserAccount.ts BIGBULL-000220
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Types } from "mongoose";
import * as path from "path";
import { User } from "../models/User";
import { Investment } from "../models/Investment";
import { Wallet } from "../models/Wallet";
import { BinaryTree } from "../models/BinaryTree";
import { Package } from "../models/Package";

try {
  dotenv.config({ path: path.join(__dirname, "../../../.env") });
} catch (e) {}
try {
  dotenv.config({ path: path.join(__dirname, "../../.env") });
} catch (e) {}
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URL_PRODUCTION ||
  process.env.MONGODB_URL_DEVELOPMENT ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/crown-bankers";

function dec(v: any): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v);
  if (v.toString) return parseFloat(v.toString());
  return 0;
}

async function connectDB() {
  if (!MONGODB_URI || MONGODB_URI === "mongodb://localhost:27017/crown-bankers") {
    console.log("⚠️  Using default MongoDB URI. Set MONGODB_URL_* in .env if needed.\n");
  }
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");
  User.modelName;
  Investment.modelName;
  Wallet.modelName;
  BinaryTree.modelName;
  Package.modelName;
}

async function disconnectDB() {
  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}

interface CheckResult {
  ok: boolean;
  message: string;
  rule?: string;
}

export async function diagnoseUserAccount(userId: string): Promise<{
  user: any;
  investments: any[];
  wallets: any[];
  binaryTree: any;
  freeRules: CheckResult[];
  accountChecks: CheckResult[];
  summary: { allOk: boolean; issues: string[] };
}> {
  const issues: string[] = [];
  const freeRules: CheckResult[] = [];
  const accountChecks: CheckResult[] = [];

  let user = await User.findOne({ userId }).lean();
  if (!user && !userId.includes("-")) {
    user = await User.findOne({ userId: `BIGBULL-${userId}` }).lean();
  }
  if (!user && !userId.includes("-")) {
    user = await User.findOne({ userId: `CNEOX-${userId}` }).lean();
  }
  if (!user && Types.ObjectId.isValid(userId)) {
    user = await User.findById(userId).lean();
  }
  if (!user) {
    throw new Error(`User not found: "${userId}" (tried ${userId}, BIGBULL-${userId}, CNEOX-${userId})`);
  }

  const userObjId = (user as any)._id;
  const investments = await Investment.find({ user: userObjId })
    .populate("packageId", "packageName")
    .sort({ createdAt: 1 })
    .lean();
  const wallets = await Wallet.find({ user: userObjId }).lean();
  const binaryTree = await BinaryTree.findOne({ user: userObjId }).lean();

  const accountType = (user as any).accountType || "normal";
  const binaryTargetAmount = (user as any).binaryTargetAmount ?? 0;
  const targetStatus = (user as any).targetStatus || "pending";
  const withdrawEnabled = (user as any).withdrawEnabled ?? false;

  const freeInvestments = investments.filter((i: any) => i.type === "free");
  const paidInvestments = investments.filter((i: any) => i.type !== "free" && i.type !== "career_reward" && i.type !== "admin");

  // --- Free Account Rules (RULEBOOK: Free Account (Funded) Rules) ---
  // Activation: no referral to uplines, no BV for free activation; user earns ROI on funded package; binary/referral only for future paid.
  // Withdrawal before target: ROI locked; Referral + Binary unlocked (limited to balance).
  // Withdrawal after target: ROI withdrawable; all eligible incomes.

  if (accountType === "free") {
    if (freeInvestments.length === 0) {
      freeRules.push({ ok: false, message: "User is accountType=free but has no investment with type=free.", rule: "Free account must have at least one free activation investment." });
      issues.push("accountType=free but no type=free investment");
    } else {
      freeRules.push({ ok: true, message: `Found ${freeInvestments.length} free activation(s).`, rule: "Free account should have free activation investment(s)." });
    }
    if (binaryTargetAmount > 0 && targetStatus !== "pending" && targetStatus !== "completed") {
      freeRules.push({ ok: false, message: `binaryTargetAmount=${binaryTargetAmount} but targetStatus="${targetStatus}" (expected pending or completed).`, rule: "targetStatus should be pending or completed." });
      issues.push("Invalid targetStatus for free account");
    } else if (binaryTargetAmount > 0) {
      freeRules.push({ ok: true, message: `Target: $${binaryTargetAmount}, targetStatus=${targetStatus}.`, rule: "Target and status present." });
    }
    const expectedWithdraw = binaryTargetAmount === 0 || targetStatus === "completed";
    if (withdrawEnabled !== expectedWithdraw) {
      freeRules.push({
        ok: false,
        message: `withdrawEnabled=${withdrawEnabled} but should be ${expectedWithdraw} (target ${binaryTargetAmount === 0 ? "none" : targetStatus}).`,
        rule: "Before target: ROI locked. After target: ROI withdrawable; withdrawEnabled should be true.",
      });
      issues.push("withdrawEnabled inconsistent with target completion");
    } else {
      freeRules.push({ ok: true, message: `withdrawEnabled=${withdrawEnabled} (correct for target).`, rule: "Withdrawal rules." });
    }
  } else if (freeInvestments.length > 0) {
    freeRules.push({ ok: false, message: `User has ${freeInvestments.length} free investment(s) but accountType="${accountType}" (expected "free").`, rule: "If user has free activations, accountType should be free." });
    issues.push("Has free investments but accountType is not free");
  }

  // --- General account checks ---
  if (!user) {
    accountChecks.push({ ok: false, message: "User not found." });
  } else {
    accountChecks.push({ ok: true, message: `User: ${(user as any).userId}, ${(user as any).name || "N/A"}, status=${(user as any).status}` });
  }
  if (!binaryTree && (accountType !== "free" || paidInvestments.length > 0)) {
    accountChecks.push({ ok: false, message: "No binary tree record; expected for non-free or users with paid investments." });
    issues.push("Missing binary tree");
  } else if (binaryTree) {
    accountChecks.push({
      ok: true,
      message: `Binary tree: leftBusiness=$${dec((binaryTree as any).leftBusiness)}, rightBusiness=$${dec((binaryTree as any).rightBusiness)}, leftDownlines=${(binaryTree as any).leftDownlines}, rightDownlines=${(binaryTree as any).rightDownlines}.`,
    });
  }
  const walletCount = wallets.length;
  if (walletCount === 0) {
    accountChecks.push({ ok: false, message: "No wallets found." });
    issues.push("No wallets");
  } else {
    accountChecks.push({ ok: true, message: `Wallets: ${walletCount} wallet(s).` });
  }

  const totalInvested = investments.reduce((s: number, i: any) => s + dec(i.investedAmount), 0);
  accountChecks.push({ ok: true, message: `Investments: ${investments.length} total (${freeInvestments.length} free, ${paidInvestments.length} paid/other), total invested=$${totalInvested.toFixed(2)}.` });

  return {
    user,
    investments,
    wallets,
    binaryTree,
    freeRules,
    accountChecks,
    summary: { allOk: issues.length === 0, issues },
  };
}

function printReport(result: Awaited<ReturnType<typeof diagnoseUserAccount>>) {
  const u = result.user as any;
  console.log("\n" + "=".repeat(80));
  console.log("USER ACCOUNT DIAGNOSTIC (Rulebook & Free-Activation Rules)");
  console.log("=".repeat(80));
  console.log(`User: ${u.userId} | ${u.name || "N/A"} | ${u.email || "N/A"}`);
  console.log(`Status: ${u.status} | accountType: ${u.accountType || "normal"}`);
  console.log(`binaryTargetAmount: ${u.binaryTargetAmount ?? 0} | targetStatus: ${u.targetStatus ?? "pending"} | withdrawEnabled: ${u.withdrawEnabled ?? false}`);
  console.log("");

  console.log("--- Free Account Rules (RULEBOOK) ---");
  result.freeRules.forEach((r) => {
    console.log(r.ok ? "  ✅" : "  ❌", r.message);
    if (r.rule) console.log("     Rule:", r.rule);
  });
  if (result.freeRules.length === 0) console.log("  (No free-account rules applied; user is normal account.)");
  console.log("");

  console.log("--- Account & Data Checks ---");
  result.accountChecks.forEach((r) => console.log(r.ok ? "  ✅" : "  ❌", r.message));
  console.log("");

  console.log("--- Investments ---");
  result.investments.forEach((inv: any, i: number) => {
    const amt = dec(inv.investedAmount);
    const pkg = inv.packageId?.packageName || "N/A";
    console.log(`  ${i + 1}. $${amt.toFixed(2)} | type=${inv.type} | ${inv.isActive ? "Active" : "Inactive"} | ${pkg} | voucherId=${inv.voucherId || "N/A"}`);
  });
  console.log("");

  console.log("--- Wallets ---");
  result.wallets.forEach((w: any) => {
    const bal = dec(w.balance);
    console.log(`  ${w.type}: $${bal.toFixed(2)}`);
  });
  console.log("");

  if (result.binaryTree) {
    const t = result.binaryTree as any;
    console.log("--- Binary Tree ---");
    console.log(`  leftBusiness: $${dec(t.leftBusiness)} | rightBusiness: $${dec(t.rightBusiness)}`);
    console.log(`  leftDownlines: ${t.leftDownlines} | rightDownlines: ${t.rightDownlines}`);
    console.log("");
  }

  console.log("--- Summary ---");
  if (result.summary.allOk) {
    console.log("  ✅ All checks passed; account is OK per rules.");
  } else {
    console.log("  ❌ Issues found:");
    result.summary.issues.forEach((i) => console.log("     -", i));
  }
  console.log("=".repeat(80) + "\n");
}

async function main() {
  const userId = process.argv[2] || "BIGBULL-000220";
  try {
    await connectDB();
    const result = await diagnoseUserAccount(userId);
    printReport(result);
    await disconnectDB();
  } catch (e: any) {
    console.error("❌", e.message);
    await disconnectDB();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { printReport };
