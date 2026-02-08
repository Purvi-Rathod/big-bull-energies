/**
 * Comprehensive Reconciliation Service
 * 
 * Daily reconciliation service that checks:
 * - Wallets (balance consistency, transaction integrity)
 * - Binary Tree (business volume, downlines, carry forward)
 * - Investments (active/inactive, amounts, dates)
 * - Career Rewards (eligibility, payments)
 * - Transaction integrity
 * 
 * Generates detailed reports with warnings and actionable items
 */

import { Types } from "mongoose";
import { User } from "../models/User";
import { BinaryTree } from "../models/BinaryTree";
import { Investment } from "../models/Investment";
import { Wallet } from "../models/Wallet";
import { WalletTransaction } from "../models/WalletTransaction";
import { UserCareerProgress } from "../models/UserCareerProgress";
import { CareerLevel } from "../models/CareerLevel";
import { WalletType } from "../models/types";
import * as fs from "fs";
import * as path from "path";

interface ReconciliationIssue {
  severity: "error" | "warning" | "info";
  category: string;
  userId?: string;
  userObjId?: Types.ObjectId;
  description: string;
  action: string;
  data?: any;
}

interface ReconciliationReport {
  generatedAt: Date;
  summary: {
    totalUsers: number;
    usersChecked: number;
    totalIssues: number;
    errors: number;
    warnings: number;
    info: number;
  };
  issues: ReconciliationIssue[];
  categories: {
    wallets: number;
    binaryTree: number;
    investments: number;
    careerRewards: number;
    transactions: number;
  };
}

/**
 * Recalculate expected business volume for a user from their downlines' investments
 */
async function calculateExpectedBusinessVolume(
  userId: Types.ObjectId,
  allUsers: Map<string, { totalInvestment: number }>,
  userMap: Map<string, { userId: Types.ObjectId; level: number; position: "left" | "right" | "root" | null }>
): Promise<{ left: number; right: number; leftDownlines: number; rightDownlines: number }> {
  const userIdStr = userId.toString();
  const userInfo = userMap.get(userIdStr);
  
  if (!userInfo) {
    return { left: 0, right: 0, leftDownlines: 0, rightDownlines: 0 };
  }
  
  const tree = await BinaryTree.findOne({ user: userId })
    .select("leftChild rightChild")
    .lean();
  
  if (!tree) {
    return { left: 0, right: 0, leftDownlines: 0, rightDownlines: 0 };
  }
  
  let leftBV = 0;
  let rightBV = 0;
  let leftCount = 0;
  let rightCount = 0;
  
  const user = await User.findById(userId).select("userId").lean();
  const isAdmin = (user as any)?.userId === "CROWN-000000" || (user as any)?.userId === "CNEOX-000000";
  
  if (isAdmin) {
    const adminChildren = await BinaryTree.find({ parent: userId })
      .select("user")
      .lean();
    
    for (const child of adminChildren) {
      const childId = child.user?.toString() || (child.user as any)?.toString();
      if (childId) {
        const childInfo = userMap.get(childId);
        if (childInfo) {
          const childDiagnostic = allUsers.get(childId);
          const childInvestment = childDiagnostic ? childDiagnostic.totalInvestment : 0;
          
          const childBV = await calculateExpectedBusinessVolume(
            new Types.ObjectId(childId),
            allUsers,
            userMap
          );
          
          const totalChildBV = childInvestment + childBV.left + childBV.right;
          leftBV += totalChildBV;
          leftCount += 1 + childBV.leftDownlines + childBV.rightDownlines;
        }
      }
    }
  } else {
    if (tree.leftChild) {
      const leftId = (tree.leftChild as any)?.toString() || tree.leftChild.toString();
      const leftInfo = userMap.get(leftId);
      
      if (leftInfo) {
        const leftDiagnostic = allUsers.get(leftId);
        const leftChildInvestment = leftDiagnostic ? leftDiagnostic.totalInvestment : 0;
        
        const leftChildBV = await calculateExpectedBusinessVolume(
          new Types.ObjectId(leftId),
          allUsers,
          userMap
        );
        
        const totalLeftBV = leftChildInvestment + leftChildBV.left + leftChildBV.right;
        leftBV = totalLeftBV;
        leftCount = 1 + leftChildBV.leftDownlines + leftChildBV.rightDownlines;
      }
    }
    
    if (tree.rightChild) {
      const rightId = (tree.rightChild as any)?.toString() || tree.rightChild.toString();
      const rightInfo = userMap.get(rightId);
      
      if (rightInfo) {
        const rightDiagnostic = allUsers.get(rightId);
        const rightChildInvestment = rightDiagnostic ? rightDiagnostic.totalInvestment : 0;
        
        const rightChildBV = await calculateExpectedBusinessVolume(
          new Types.ObjectId(rightId),
          allUsers,
          userMap
        );
        
        const totalRightBV = rightChildInvestment + rightChildBV.left + rightChildBV.right;
        rightBV = totalRightBV;
        rightCount = 1 + rightChildBV.leftDownlines + rightChildBV.rightDownlines;
      }
    }
  }
  
  return { left: leftBV, right: rightBV, leftDownlines: leftCount, rightDownlines: rightCount };
}

/**
 * Recursively get all downlines
 */
async function getAllDownlines(
  rootUserId: Types.ObjectId,
  visited: Set<string> = new Set(),
  level: number = 0,
  maxDepth: number = 100
): Promise<Map<string, { userId: Types.ObjectId; level: number; position: "left" | "right" | "root" | null }>> {
  const downlines = new Map<string, { userId: Types.ObjectId; level: number; position: "left" | "right" | "root" | null }>();
  
  if (level >= maxDepth) return downlines;
  
  const rootIdStr = rootUserId.toString();
  if (visited.has(rootIdStr)) return downlines;
  visited.add(rootIdStr);
  
  const tree = await BinaryTree.findOne({ user: rootUserId })
    .select("leftChild rightChild parent")
    .lean();
  
  if (!tree) return downlines;
  
  const user = await User.findById(rootUserId).select("userId").lean();
  const isAdmin = (user as any)?.userId === "CROWN-000000" || (user as any)?.userId === "CNEOX-000000";
  
  if (isAdmin) {
    const adminChildren = await BinaryTree.find({ parent: rootUserId })
      .select("user")
      .lean();
    
    for (const child of adminChildren) {
      const childId = child.user?.toString() || (child.user as any)?.toString();
      if (childId && !visited.has(childId)) {
        const childObjId = new Types.ObjectId(childId);
        downlines.set(childId, { userId: childObjId, level: level + 1, position: "root" });
        
        const childDownlines = await getAllDownlines(childObjId, visited, level + 1, maxDepth);
        childDownlines.forEach((value, key) => {
          downlines.set(key, value);
        });
      }
    }
  } else {
    if (tree.leftChild) {
      const leftId = (tree.leftChild as any)?.toString() || tree.leftChild.toString();
      if (!visited.has(leftId)) {
        const leftObjId = new Types.ObjectId(leftId);
        downlines.set(leftId, { userId: leftObjId, level: level + 1, position: "left" });
        
        const leftDownlines = await getAllDownlines(leftObjId, visited, level + 1, maxDepth);
        leftDownlines.forEach((value, key) => {
          downlines.set(key, value);
        });
      }
    }
    
    if (tree.rightChild) {
      const rightId = (tree.rightChild as any)?.toString() || tree.rightChild.toString();
      if (!visited.has(rightId)) {
        const rightObjId = new Types.ObjectId(rightId);
        downlines.set(rightId, { userId: rightObjId, level: level + 1, position: "right" });
        
        const rightDownlines = await getAllDownlines(rightObjId, visited, level + 1, maxDepth);
        rightDownlines.forEach((value, key) => {
          downlines.set(key, value);
        });
      }
    }
  }
  
  return downlines;
}

/**
 * Check wallet balance consistency
 */
async function checkWallets(userId: Types.ObjectId, userIdStr: string): Promise<ReconciliationIssue[]> {
  const issues: ReconciliationIssue[] = [];
  
  // Get all wallets for user
  const wallets = await Wallet.find({ user: userId }).lean();
  
  // Get all transactions for user
  const transactions = await WalletTransaction.find({ user: userId })
    .sort({ createdAt: 1 })
    .lean();
  
  // Check each wallet
  for (const wallet of wallets) {
    const walletType = wallet.type;
    const currentBalance = parseFloat(wallet.balance.toString());
    
    // Recalculate balance from transactions
    let calculatedBalance = 0;
    const walletTransactions = transactions.filter(tx => 
      tx.wallet.toString() === wallet._id.toString()
    );
    
    for (const tx of walletTransactions) {
      const amount = parseFloat(tx.amount.toString());
      if (tx.type === "credit") {
        calculatedBalance += amount;
      } else {
        calculatedBalance -= amount;
      }
    }
    
    // Check balance mismatch
    const balanceDiff = Math.abs(currentBalance - calculatedBalance);
    if (balanceDiff > 0.01) {
      issues.push({
        severity: "error",
        category: "wallets",
        userId: userIdStr,
        userObjId: userId,
        description: `Wallet balance mismatch for ${walletType}: Stored ${currentBalance.toFixed(2)} vs Calculated ${calculatedBalance.toFixed(2)} (Difference: ${balanceDiff.toFixed(2)})`,
        action: `Recalculate wallet balance for ${walletType} wallet`,
        data: { walletType, storedBalance: currentBalance, calculatedBalance, difference: balanceDiff }
      });
    }
    
    // Check for negative balance
    if (currentBalance < 0) {
      issues.push({
        severity: "error",
        category: "wallets",
        userId: userIdStr,
        userObjId: userId,
        description: `Negative balance in ${walletType} wallet: $${currentBalance.toFixed(2)}`,
        action: `Fix negative balance in ${walletType} wallet`,
        data: { walletType, balance: currentBalance }
      });
    }
    
    // Check reserved amount exceeds balance
    const reserved = parseFloat((wallet.reserved || Types.Decimal128.fromString("0")).toString());
    if (reserved > currentBalance) {
      issues.push({
        severity: "warning",
        category: "wallets",
        userId: userIdStr,
        userObjId: userId,
        description: `Reserved amount (${reserved.toFixed(2)}) exceeds balance (${currentBalance.toFixed(2)}) in ${walletType} wallet`,
        action: `Review reserved amount in ${walletType} wallet`,
        data: { walletType, balance: currentBalance, reserved }
      });
    }
  }
  
  return issues;
}

/**
 * Check binary tree consistency
 */
async function checkBinaryTree(
  userId: Types.ObjectId,
  userIdStr: string,
  allUsers: Map<string, { totalInvestment: number }>,
  userMap: Map<string, { userId: Types.ObjectId; level: number; position: "left" | "right" | "root" | null }>
): Promise<ReconciliationIssue[]> {
  const issues: ReconciliationIssue[] = [];
  
  const tree = await BinaryTree.findOne({ user: userId }).lean();
  if (!tree) {
    return issues;
  }
  
  const storedLeftBusiness = parseFloat(tree.leftBusiness?.toString() || "0");
  const storedRightBusiness = parseFloat(tree.rightBusiness?.toString() || "0");
  const storedLeftDownlines = tree.leftDownlines || 0;
  const storedRightDownlines = tree.rightDownlines || 0;
  const storedLeftCarry = parseFloat(tree.leftCarry?.toString() || "0");
  const storedRightCarry = parseFloat(tree.rightCarry?.toString() || "0");
  const storedLeftMatched = parseFloat(tree.leftMatched?.toString() || "0");
  const storedRightMatched = parseFloat(tree.rightMatched?.toString() || "0");
  
  // Calculate expected values
  const expectedBV = await calculateExpectedBusinessVolume(userId, allUsers, userMap);
  const expectedLeftBusiness = expectedBV.left;
  const expectedRightBusiness = expectedBV.right;
  const expectedLeftDownlines = expectedBV.leftDownlines;
  const expectedRightDownlines = expectedBV.rightDownlines;
  
  // Check business volume mismatches
  const leftBVDiff = Math.abs(storedLeftBusiness - expectedLeftBusiness);
  const rightBVDiff = Math.abs(storedRightBusiness - expectedRightBusiness);
  const tolerance = 0.01;
  
  if (leftBVDiff > tolerance) {
    issues.push({
      severity: "error",
      category: "binaryTree",
      userId: userIdStr,
      userObjId: userId,
      description: `Left Business Volume Mismatch: Stored ${storedLeftBusiness.toFixed(2)} vs Expected ${expectedLeftBusiness.toFixed(2)} (Difference: ${leftBVDiff.toFixed(2)})`,
      action: `Update leftBusiness to ${expectedLeftBusiness.toFixed(2)}`,
      data: { stored: storedLeftBusiness, expected: expectedLeftBusiness, difference: leftBVDiff }
    });
  }
  
  if (rightBVDiff > tolerance) {
    issues.push({
      severity: "error",
      category: "binaryTree",
      userId: userIdStr,
      userObjId: userId,
      description: `Right Business Volume Mismatch: Stored ${storedRightBusiness.toFixed(2)} vs Expected ${expectedRightBusiness.toFixed(2)} (Difference: ${rightBVDiff.toFixed(2)})`,
      action: `Update rightBusiness to ${expectedRightBusiness.toFixed(2)}`,
      data: { stored: storedRightBusiness, expected: expectedRightBusiness, difference: rightBVDiff }
    });
  }
  
  // Check downline count mismatches
  if (storedLeftDownlines !== expectedLeftDownlines) {
    issues.push({
      severity: "warning",
      category: "binaryTree",
      userId: userIdStr,
      userObjId: userId,
      description: `Left Downlines Count Mismatch: Stored ${storedLeftDownlines} vs Expected ${expectedLeftDownlines}`,
      action: `Update leftDownlines to ${expectedLeftDownlines}`,
      data: { stored: storedLeftDownlines, expected: expectedLeftDownlines }
    });
  }
  
  if (storedRightDownlines !== expectedRightDownlines) {
    issues.push({
      severity: "warning",
      category: "binaryTree",
      userId: userIdStr,
      userObjId: userId,
      description: `Right Downlines Count Mismatch: Stored ${storedRightDownlines} vs Expected ${expectedRightDownlines}`,
      action: `Update rightDownlines to ${expectedRightDownlines}`,
      data: { stored: storedRightDownlines, expected: expectedRightDownlines }
    });
  }
  
  // Check carry forward consistency
  if (storedLeftMatched > storedLeftBusiness) {
    issues.push({
      severity: "error",
      category: "binaryTree",
      userId: userIdStr,
      userObjId: userId,
      description: `Left Matched (${storedLeftMatched.toFixed(2)}) exceeds Left Business (${storedLeftBusiness.toFixed(2)})`,
      action: `Recalculate leftMatched and leftCarry`,
      data: { leftMatched: storedLeftMatched, leftBusiness: storedLeftBusiness }
    });
  }
  
  if (storedRightMatched > storedRightBusiness) {
    issues.push({
      severity: "error",
      category: "binaryTree",
      userId: userIdStr,
      userObjId: userId,
      description: `Right Matched (${storedRightMatched.toFixed(2)}) exceeds Right Business (${storedRightBusiness.toFixed(2)})`,
      action: `Recalculate rightMatched and rightCarry`,
      data: { rightMatched: storedRightMatched, rightBusiness: storedRightBusiness }
    });
  }
  
  // Check negative carry forward
  if (storedLeftCarry < 0) {
    issues.push({
      severity: "error",
      category: "binaryTree",
      userId: userIdStr,
      userObjId: userId,
      description: `Left Carry Forward is negative: ${storedLeftCarry.toFixed(2)}`,
      action: `Reset leftCarry to 0`,
      data: { leftCarry: storedLeftCarry }
    });
  }
  
  if (storedRightCarry < 0) {
    issues.push({
      severity: "error",
      category: "binaryTree",
      userId: userIdStr,
      userObjId: userId,
      description: `Right Carry Forward is negative: ${storedRightCarry.toFixed(2)}`,
      action: `Reset rightCarry to 0`,
      data: { rightCarry: storedRightCarry }
    });
  }
  
  return issues;
}

/**
 * Check investments consistency
 */
async function checkInvestments(userId: Types.ObjectId, userIdStr: string): Promise<ReconciliationIssue[]> {
  const issues: ReconciliationIssue[] = [];
  
  const investments = await Investment.find({ user: userId }).lean();
  
  for (const investment of investments) {
    const investedAmount = parseFloat(investment.investedAmount?.toString() || "0");
    const principal = parseFloat(investment.principal?.toString() || "0");
    const daysRemaining = investment.daysRemaining || 0;
    const daysElapsed = investment.daysElapsed || 0;
    const durationDays = investment.durationDays || 0;
    
    // Check if investment amount is zero
    if (investedAmount === 0 && investment.isActive) {
      issues.push({
        severity: "warning",
        category: "investments",
        userId: userIdStr,
        userObjId: userId,
        description: `Active investment with zero invested amount (Investment ID: ${investment._id})`,
        action: `Review investment ${investment._id}`,
        data: { investmentId: investment._id }
      });
    }
    
    // Check if principal matches invested amount (should be equal initially)
    if (Math.abs(principal - investedAmount) > 0.01 && investment.isActive) {
      // This might be okay if principal was increased through renewable principal
      // But we'll flag it as info
      issues.push({
        severity: "info",
        category: "investments",
        userId: userIdStr,
        userObjId: userId,
        description: `Principal (${principal.toFixed(2)}) differs from invested amount (${investedAmount.toFixed(2)})`,
        action: `Verify principal calculation for investment ${investment._id}`,
        data: { investmentId: investment._id, principal, investedAmount }
      });
    }
    
    // Check days calculation
    const expectedDaysRemaining = durationDays - daysElapsed;
    if (Math.abs(daysRemaining - expectedDaysRemaining) > 1) {
      issues.push({
        severity: "warning",
        category: "investments",
        userId: userIdStr,
        userObjId: userId,
        description: `Days remaining mismatch: Stored ${daysRemaining} vs Expected ${expectedDaysRemaining} (Investment ID: ${investment._id})`,
        action: `Recalculate days remaining for investment ${investment._id}`,
        data: { investmentId: investment._id, stored: daysRemaining, expected: expectedDaysRemaining }
      });
    }
    
    // Check if investment should be expired
    const endDate = new Date(investment.endDate);
    const now = new Date();
    if (endDate < now && investment.isActive) {
      issues.push({
        severity: "error",
        category: "investments",
        userId: userIdStr,
        userObjId: userId,
        description: `Investment expired but still active (Investment ID: ${investment._id}, End Date: ${endDate.toISOString()})`,
        action: `Deactivate investment ${investment._id}`,
        data: { investmentId: investment._id, endDate }
      });
    }
  }
  
  return issues;
}

/**
 * Check career rewards consistency
 */
async function checkCareerRewards(userId: Types.ObjectId, userIdStr: string): Promise<ReconciliationIssue[]> {
  const issues: ReconciliationIssue[] = [];
  
  const tree = await BinaryTree.findOne({ user: userId }).lean();
  if (!tree) {
    return issues;
  }
  
  const leftBusiness = parseFloat(tree.leftBusiness?.toString() || "0");
  const rightBusiness = parseFloat(tree.rightBusiness?.toString() || "0");
  const leftPowerlegBV = parseFloat((tree.leftPowerlegBusiness || Types.Decimal128.fromString("0")).toString());
  const rightPowerlegBV = parseFloat((tree.rightPowerlegBusiness || Types.Decimal128.fromString("0")).toString());
  
  // Calculate business volume excluding powerleg
  const leftBusinessExcludingPowerleg = leftBusiness - leftPowerlegBV;
  const rightBusinessExcludingPowerleg = rightBusiness - rightPowerlegBV;
  
  // Get user career progress
  const userProgress = await UserCareerProgress.findOne({ user: userId }).lean();
  if (!userProgress) {
    return issues;
  }
  
  // Get all active career levels
  const activeLevels = await CareerLevel.find({ status: "Active" })
    .sort({ level: 1 })
    .lean();
  
  // Check if user should have completed levels but hasn't
  const completedLevelIds = userProgress.completedLevels.map(cl => cl.levelId.toString());
  const totalRewardsEarned = parseFloat(userProgress.totalRewardsEarned?.toString() || "0");
  
  let expectedRewards = 0;
  for (const level of activeLevels) {
    const levelIdStr = level._id.toString();
    const isCompleted = completedLevelIds.includes(levelIdStr);
    const levelThreshold = parseFloat(level.investmentThreshold.toString());
    const rewardAmount = parseFloat(level.rewardAmount.toString());
    
    // Check if user meets criteria for this level (both sides must meet threshold)
    if (leftBusinessExcludingPowerleg >= levelThreshold && rightBusinessExcludingPowerleg >= levelThreshold) {
      if (!isCompleted) {
        issues.push({
          severity: "error",
          category: "careerRewards",
          userId: userIdStr,
          userObjId: userId,
          description: `User eligible for ${level.name} level (threshold: $${levelThreshold}) but not completed. Left BV: $${leftBusinessExcludingPowerleg.toFixed(2)}, Right BV: $${rightBusinessExcludingPowerleg.toFixed(2)}`,
          action: `Award ${level.name} level reward of $${rewardAmount.toFixed(2)}`,
          data: { levelId: level._id, levelName: level.name, threshold: levelThreshold, rewardAmount }
        });
      } else {
        expectedRewards += rewardAmount;
      }
    }
  }
  
  // Check if total rewards earned matches completed levels
  const calculatedRewards = userProgress.completedLevels.reduce((sum, cl) => {
    return sum + parseFloat(cl.rewardAmount.toString());
  }, 0);
  
  const rewardsDiff = Math.abs(totalRewardsEarned - calculatedRewards);
  if (rewardsDiff > 0.01) {
    issues.push({
      severity: "warning",
      category: "careerRewards",
      userId: userIdStr,
      userObjId: userId,
      description: `Total rewards earned mismatch: Stored ${totalRewardsEarned.toFixed(2)} vs Calculated ${calculatedRewards.toFixed(2)}`,
      action: `Update totalRewardsEarned to ${calculatedRewards.toFixed(2)}`,
      data: { stored: totalRewardsEarned, calculated: calculatedRewards, difference: rewardsDiff }
    });
  }
  
  return issues;
}

/**
 * Check transaction integrity
 */
async function checkTransactions(userId: Types.ObjectId, userIdStr: string): Promise<ReconciliationIssue[]> {
  const issues: ReconciliationIssue[] = [];
  
  const transactions = await WalletTransaction.find({ user: userId })
    .populate("wallet", "type")
    .sort({ createdAt: 1 })
    .lean();
  
  // Check for duplicate transactions (same idempotencyKey or txRef)
  const idempotencyKeys = new Map<string, number>();
  const txRefs = new Map<string, number>();
  
  for (const tx of transactions) {
    if (tx.idempotencyKey) {
      const count = idempotencyKeys.get(tx.idempotencyKey) || 0;
      idempotencyKeys.set(tx.idempotencyKey, count + 1);
      
      if (count > 0) {
        issues.push({
          severity: "error",
          category: "transactions",
          userId: userIdStr,
          userObjId: userId,
          description: `Duplicate transaction with idempotencyKey: ${tx.idempotencyKey}`,
          action: `Review duplicate transaction ${tx._id}`,
          data: { transactionId: tx._id, idempotencyKey: tx.idempotencyKey }
        });
      }
    }
    
    if (tx.txRef) {
      const count = txRefs.get(tx.txRef) || 0;
      txRefs.set(tx.txRef, count + 1);
      
      if (count > 0) {
        issues.push({
          severity: "warning",
          category: "transactions",
          userId: userIdStr,
          userObjId: userId,
          description: `Duplicate transaction with txRef: ${tx.txRef}`,
          action: `Review duplicate transaction ${tx._id}`,
          data: { transactionId: tx._id, txRef: tx.txRef }
        });
      }
    }
    
    // Check balance consistency in transaction
    const balanceBefore = parseFloat(tx.balanceBefore.toString());
    const balanceAfter = parseFloat(tx.balanceAfter.toString());
    const amount = parseFloat(tx.amount.toString());
    
    const expectedBalanceAfter = tx.type === "credit" 
      ? balanceBefore + amount 
      : balanceBefore - amount;
    
    const balanceDiff = Math.abs(balanceAfter - expectedBalanceAfter);
    if (balanceDiff > 0.01) {
      issues.push({
        severity: "error",
        category: "transactions",
        userId: userIdStr,
        userObjId: userId,
        description: `Transaction balance inconsistency: Expected balanceAfter ${expectedBalanceAfter.toFixed(2)} but got ${balanceAfter.toFixed(2)} (Transaction ID: ${tx._id})`,
        action: `Review transaction ${tx._id}`,
        data: { transactionId: tx._id, balanceBefore, balanceAfter, amount, type: tx.type }
      });
    }
  }
  
  return issues;
}

/**
 * Main reconciliation function
 */
export async function runReconciliation(
  rootUserId?: string,
  maxUsers?: number
): Promise<ReconciliationReport> {
  const startTime = new Date();
  const issues: ReconciliationIssue[] = [];
  
  console.log(`\n${'='.repeat(100)}`);
  console.log(`🔍 COMPREHENSIVE RECONCILIATION SERVICE`);
  console.log(`${'='.repeat(100)}\n`);
  console.log(`Started at: ${startTime.toISOString()}\n`);
  
  // Get users to check
  let usersToCheck: any[] = [];
  
  if (rootUserId) {
    // Check specific user and all their downlines
    const rootUser = await User.findOne({ userId: rootUserId }).lean();
    if (!rootUser) {
      throw new Error(`User ${rootUserId} not found`);
    }
    
    const rootUserObjId = new Types.ObjectId(rootUser._id.toString());
    const visited = new Set<string>();
    visited.add(rootUserObjId.toString());
    const downlines = await getAllDownlines(rootUserObjId, visited, 0);
    
    usersToCheck = [rootUser];
    for (const [userIdStr, info] of downlines.entries()) {
      const user = await User.findById(info.userId).lean();
      if (user) {
        usersToCheck.push(user);
      }
    }
    
    console.log(`📊 Checking user ${rootUserId} and ${downlines.size} downlines (${usersToCheck.length} total users)\n`);
  } else {
    // Check all users (or limited by maxUsers)
    const query = User.find({}).select("_id userId name").lean();
    if (maxUsers) {
      query.limit(maxUsers);
    }
    usersToCheck = await query;
    console.log(`📊 Checking ${usersToCheck.length} users\n`);
  }
  
  // Build user map and investment map for binary tree calculations
  const userMap = new Map<string, { userId: Types.ObjectId; level: number; position: "left" | "right" | "root" | null }>();
  const allUsers = new Map<string, { totalInvestment: number }>();
  
  // Pre-calculate investments for all users
  for (const user of usersToCheck) {
    const userObjId = new Types.ObjectId(user._id.toString());
    const investments = await Investment.find({ user: userObjId }).lean();
    const totalInvestment = investments.reduce((sum, inv) => {
      return sum + parseFloat(inv.investedAmount?.toString() || "0");
    }, 0);
    
    allUsers.set(userObjId.toString(), { totalInvestment });
  }
  
  // Build proper tree structure for userMap
  if (rootUserId) {
    // For specific user, build tree structure from root
    const rootUser = usersToCheck.find(u => (u as any).userId === rootUserId);
    if (rootUser) {
      const rootUserObjId = new Types.ObjectId(rootUser._id.toString());
      const visited = new Set<string>();
      visited.add(rootUserObjId.toString());
      const downlines = await getAllDownlines(rootUserObjId, visited, 0);
    
      userMap.set(rootUserObjId.toString(), { userId: rootUserObjId, level: 0, position: "root" });
      downlines.forEach((value, key) => {
        userMap.set(key, value);
      });
    }
  } else {
    // For all users, build simplified map (level 0 for all)
    for (const user of usersToCheck) {
      const userObjId = new Types.ObjectId(user._id.toString());
      userMap.set(userObjId.toString(), {
        userId: userObjId,
        level: 0,
        position: "root"
      });
    }
  }
  
  // Process users from deepest to shallowest for accurate BV calculation
  const sortedUsers = Array.from(userMap.entries())
    .sort((a, b) => b[1].level - a[1].level)
    .map(([userIdStr]) => {
      return usersToCheck.find(u => new Types.ObjectId(u._id.toString()).toString() === userIdStr);
    })
    .filter(u => u !== undefined) as any[];
  
  // Check each user
  let processed = 0;
  for (const user of sortedUsers) {
    processed++;
    if (processed % 100 === 0) {
      console.log(`   Processed ${processed}/${sortedUsers.length} users...`);
    }
    
    const userObjId = new Types.ObjectId(user._id.toString());
    const userIdStr = (user as any).userId || userObjId.toString();
    
    try {
      // Check wallets
      const walletIssues = await checkWallets(userObjId, userIdStr);
      issues.push(...walletIssues);
      
      // Check binary tree
      const treeIssues = await checkBinaryTree(userObjId, userIdStr, allUsers, userMap);
      issues.push(...treeIssues);
      
      // Check investments
      const investmentIssues = await checkInvestments(userObjId, userIdStr);
      issues.push(...investmentIssues);
      
      // Check career rewards
      const careerIssues = await checkCareerRewards(userObjId, userIdStr);
      issues.push(...careerIssues);
      
      // Check transactions
      const transactionIssues = await checkTransactions(userObjId, userIdStr);
      issues.push(...transactionIssues);
    } catch (error: any) {
      issues.push({
        severity: "error",
        category: "general",
        userId: userIdStr,
        userObjId: userObjId,
        description: `Error checking user: ${error.message}`,
        action: `Review user ${userIdStr}`,
        data: { error: error.message }
      });
    }
  }
  
  // Generate summary
  const errors = issues.filter(i => i.severity === "error").length;
  const warnings = issues.filter(i => i.severity === "warning").length;
  const info = issues.filter(i => i.severity === "info").length;
  
  const report: ReconciliationReport = {
    generatedAt: new Date(),
    summary: {
      totalUsers: usersToCheck.length,
      usersChecked: processed,
      totalIssues: issues.length,
      errors,
      warnings,
      info
    },
    issues,
    categories: {
      wallets: issues.filter(i => i.category === "wallets").length,
      binaryTree: issues.filter(i => i.category === "binaryTree").length,
      investments: issues.filter(i => i.category === "investments").length,
      careerRewards: issues.filter(i => i.category === "careerRewards").length,
      transactions: issues.filter(i => i.category === "transactions").length
    }
  };
  
  return report;
}

/**
 * Generate and save reconciliation report
 */
export async function generateReconciliationReport(
  rootUserId?: string,
  maxUsers?: number
): Promise<string> {
  const report = await runReconciliation(rootUserId, maxUsers);
  
  // Create reports directory
  const reportsDir = path.join(__dirname, '../../reconciliation-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFileName = `reconciliation-${rootUserId || 'all'}-${timestamp}.txt`;
  const reportFilePath = path.join(reportsDir, reportFileName);
  
  // Generate report text
  let reportText = `COMPREHENSIVE RECONCILIATION REPORT\n`;
  reportText += `Generated: ${report.generatedAt.toISOString()}\n`;
  reportText += `${'='.repeat(100)}\n\n`;
  
  reportText += `SUMMARY\n`;
  reportText += `${'='.repeat(100)}\n`;
  reportText += `Total Users Checked: ${report.summary.usersChecked}\n`;
  reportText += `Total Issues Found: ${report.summary.totalIssues}\n`;
  reportText += `  - Errors: ${report.summary.errors}\n`;
  reportText += `  - Warnings: ${report.summary.warnings}\n`;
  reportText += `  - Info: ${report.summary.info}\n\n`;
  
  reportText += `ISSUES BY CATEGORY\n`;
  reportText += `${'='.repeat(100)}\n`;
  reportText += `Wallets: ${report.categories.wallets}\n`;
  reportText += `Binary Tree: ${report.categories.binaryTree}\n`;
  reportText += `Investments: ${report.categories.investments}\n`;
  reportText += `Career Rewards: ${report.categories.careerRewards}\n`;
  reportText += `Transactions: ${report.categories.transactions}\n\n`;
  
  // Group issues by severity
  const errors = report.issues.filter(i => i.severity === "error");
  const warnings = report.issues.filter(i => i.severity === "warning");
  const info = report.issues.filter(i => i.severity === "info");
  
  if (errors.length > 0) {
    reportText += `\n${'='.repeat(100)}\n`;
    reportText += `❌ ERRORS (${errors.length})\n`;
    reportText += `${'='.repeat(100)}\n\n`;
    
    errors.forEach((issue, idx) => {
      reportText += `${idx + 1}. [${issue.category.toUpperCase()}] ${issue.userId || 'Unknown'}\n`;
      reportText += `   ${issue.description}\n`;
      reportText += `   Action: ${issue.action}\n\n`;
    });
  }
  
  if (warnings.length > 0) {
    reportText += `\n${'='.repeat(100)}\n`;
    reportText += `⚠️  WARNINGS (${warnings.length})\n`;
    reportText += `${'='.repeat(100)}\n\n`;
    
    warnings.forEach((issue, idx) => {
      reportText += `${idx + 1}. [${issue.category.toUpperCase()}] ${issue.userId || 'Unknown'}\n`;
      reportText += `   ${issue.description}\n`;
      reportText += `   Action: ${issue.action}\n\n`;
    });
  }
  
  if (info.length > 0) {
    reportText += `\n${'='.repeat(100)}\n`;
    reportText += `ℹ️  INFO (${info.length})\n`;
    reportText += `${'='.repeat(100)}\n\n`;
    
    info.forEach((issue, idx) => {
      reportText += `${idx + 1}. [${issue.category.toUpperCase()}] ${issue.userId || 'Unknown'}\n`;
      reportText += `   ${issue.description}\n`;
      reportText += `   Action: ${issue.action}\n\n`;
    });
  }
  
  // Action summary
  reportText += `\n${'='.repeat(100)}\n`;
  reportText += `ACTION SUMMARY\n`;
  reportText += `${'='.repeat(100)}\n\n`;
  
  const uniqueActions = new Set<string>();
  report.issues.forEach(issue => {
    uniqueActions.add(issue.action);
  });
  
  Array.from(uniqueActions).forEach((action, idx) => {
    reportText += `${idx + 1}. ${action}\n`;
  });
  
  // Write to file
  fs.writeFileSync(reportFilePath, reportText, 'utf8');
  
  console.log(`\n${'='.repeat(100)}`);
  console.log(`✅ RECONCILIATION COMPLETE`);
  console.log(`${'='.repeat(100)}\n`);
  console.log(`Report saved to: ${reportFilePath}\n`);
  
  return reportFilePath;
}
