import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { Wallet } from "../models/Wallet";
import { Package } from "../models/Package";
import { Investment } from "../models/Investment";
import { Payment } from "../models/Payment";
import { BinaryTree } from "../models/BinaryTree";
import { WalletTransaction } from "../models/WalletTransaction";
import { Withdrawal } from "../models/Withdrawal";
import { Voucher } from "../models/Voucher";
import { User } from "../models/User";
import { WalletType, WithdrawalStatus } from "../models/types";
import { processInvestment } from "../services/investment.service";
import { processMockPayment } from "../lib/payments/mock-nowpayments";
import { exchangeWallets } from "../services/wallet-exchange.service";
import { sendWithdrawalCreatedEmail, sendVoucherCreatedEmail } from "../lib/mail-service/email.service";
import { getUserCareerProgress } from "../services/career-level.service";
import { getMinimumVoucherAmount as getMinVoucherAmount } from "../services/package.service";
import { Types } from "mongoose";
import { isWithdrawalDateValid, getNextWithdrawalDate, getWithdrawalScheduleDescription, getWithdrawalDatesForMonth, getCustomSchedules } from "../utils/withdrawalSchedule";
import type { WithdrawalSchedules, CustomSchedule } from "../utils/withdrawalSchedule";

/**
 * Get user wallets
 * GET /api/v1/user/wallets
 */
export const getUserWallets = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const wallets = await Wallet.find({ user: userId })
    .select("type balance reserved currency")
    .lean();

  const walletsFormatted = wallets.map((wallet) => ({
    type: wallet.type,
    balance: parseFloat(wallet.balance.toString()),
    reserved: parseFloat(wallet.reserved?.toString() || "0"),
    currency: wallet.currency || "USD",
  }));

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      wallets: walletsFormatted,
    },
  });
});

/**
 * Get minimum voucher amount
 * GET /api/v1/user/vouchers/minimum-amount
 */
export const getMinimumVoucherAmount = asyncHandler(async (req, res) => {
  try {
    const minVoucherAmount = await getMinVoucherAmount();
    
    if (minVoucherAmount <= 0) {
      throw new AppError("No active investment packages found", 404);
    }

    const response = res as any;
    response.status(200).json({
      status: "success",
      data: {
        minimumVoucherAmount: minVoucherAmount,
        minimumInvestment: minVoucherAmount * 2, // Return both for reference
      },
    });
  } catch (error: any) {
    throw new AppError(error.message || "Failed to get minimum voucher amount", 500);
  }
});

/**
 * Get available packages for users
 * GET /api/v1/user/packages
 */
export const getUserPackages = asyncHandler(async (req, res) => {
  const packages = await Package.find({ status: "Active" })
    .select("_id packageName minAmount maxAmount duration totalOutputPct renewablePrinciplePct referralPct binaryPct powerCapacity status roi binaryBonus cappingLimit principleReturn levelOneReferral")
    .lean();

  const packagesFormatted = packages.map((pkg) => ({
    id: pkg._id,
    packageName: pkg.packageName,
    minAmount: parseFloat(pkg.minAmount.toString()),
    maxAmount: parseFloat(pkg.maxAmount.toString()),
    duration: pkg.duration,
    // New fields
    totalOutputPct: pkg.totalOutputPct,
    renewablePrinciplePct: pkg.renewablePrinciplePct,
    referralPct: pkg.referralPct,
    binaryPct: pkg.binaryPct,
    powerCapacity: parseFloat(pkg.powerCapacity?.toString() || "0"),
    status: pkg.status,
    // Legacy fields (for backward compatibility)
    roi: pkg.roi,
    binaryBonus: pkg.binaryBonus,
    cappingLimit: parseFloat(pkg.cappingLimit?.toString() || "0"),
    principleReturn: pkg.principleReturn,
    levelOneReferral: pkg.levelOneReferral,
  }));

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      packages: packagesFormatted,
    },
  });
});

/**
 * Create investment
 * POST /api/v1/user/invest
 */
export const createInvestment = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const body = req.body;
  const { packageId, amount, currency = "USD", paymentId, voucherId, useMainWallet } = body;

  if (!packageId || !amount) {
    throw new AppError("Package ID and amount are required", 400);
  }

  if (!Types.ObjectId.isValid(packageId)) {
    throw new AppError("Invalid package ID", 400);
  }

  let finalPaymentId: string;
  let paymentResult: any = null;
  let finalVoucherId = voucherId;

  // If useMainWallet is true, check and deduct from main wallet
  if (useMainWallet) {
    const { Wallet } = await import("../models/Wallet");
    const { createWalletTransaction } = await import("../services/transaction.service");
    
    // Get user's main wallet
    const mainWallet = await Wallet.findOne({ 
      user: userId, 
      type: WalletType.MAIN 
    });
    
    if (!mainWallet) {
      throw new AppError("Main wallet not found. Please contact support.", 404);
    }
    
    const mainWalletBalance = parseFloat(mainWallet.balance.toString());
    const investmentAmount = Number(amount);
    
    if (mainWalletBalance < investmentAmount) {
      throw new AppError(
        `Insufficient balance in main wallet. Available: $${mainWalletBalance.toFixed(2)}, Required: $${investmentAmount.toFixed(2)}`,
        400
      );
    }
    
    // Deduct from main wallet
    const newBalance = mainWalletBalance - investmentAmount;
    mainWallet.balance = Types.Decimal128.fromString(newBalance.toString());
    await mainWallet.save();
    
    // Create transaction record
    await createWalletTransaction(
      new Types.ObjectId(userId),
      WalletType.MAIN,
      "debit",
      investmentAmount,
      `main-wallet-${Date.now()}-${userId}`,
      { description: `Investment package activation - $${investmentAmount}` }
    );
    
    // Use a special payment ID format for main wallet payments
    finalPaymentId = `main-wallet-${Date.now()}-${userId}`;
    paymentResult = {
      paymentId: finalPaymentId,
      status: "completed",
      method: "main_wallet",
    };
  } else if (paymentId) {
    // FIXED: Enhanced duplicate prevention - check by paymentId AND check all Payment records
    // Check if investment already exists for this paymentId (prevent duplicates)
    const existingInvestment = await Investment.findOne({ voucherId: paymentId });
    if (existingInvestment) {
      throw new AppError("Investment already exists for this payment. Duplicate investment prevented.", 400);
    }

    // Check if payment record exists and already has an investment
    const payment = await Payment.findOne({ paymentId: paymentId });
    if (payment && payment.investmentId) {
      throw new AppError("Investment already exists for this payment. Duplicate investment prevented.", 400);
    }
    
    // FIXED: Also check if ANY payment record with same invoice_id/payment_id has an investment
    // This prevents duplicates when NOWPayments sends both invoice_id and payment_id
    const allPaymentsWithSameId = await Payment.find({
      $or: [
        { paymentId: paymentId },
        { orderId: paymentId } // Also check by orderId in case paymentId is actually an orderId
      ],
      user: userId
    });
    
    const paymentWithInvestment = allPaymentsWithSameId.find(p => p.investmentId);
    if (paymentWithInvestment) {
      throw new AppError("Investment already exists for this payment (found by invoice_id/payment_id). Duplicate investment prevented.", 400);
    }

    // Payment already processed via NOWPayments, use the provided paymentId
    finalPaymentId = paymentId;
    
    // If voucherId is not provided but payment has voucher in meta, extract it
    if (!finalVoucherId) {
      const { Payment } = await import("../models/Payment");
      const payment = await Payment.findOne({ paymentId, user: userId });
      if (payment && payment.meta && (payment.meta as any).voucherId) {
        // Extract voucherId from payment meta if not provided
        finalVoucherId = (payment.meta as any).voucherId;
      }
    }
    
    // Create payment result structure for response
    paymentResult = {
      paymentId: paymentId,
      status: "completed",
    };
  } else {
    // Process mock payment (legacy flow)
    paymentResult = await processMockPayment({
      amount: Number(amount),
      currency,
      packageId,
      userId,
    });

    if (!paymentResult.success) {
      throw new AppError(paymentResult.message || "Payment failed", 400);
    }

    finalPaymentId = paymentResult.paymentId;
  }

  // Process investment
  const investment = await processInvestment(
    new Types.ObjectId(userId),
    new Types.ObjectId(packageId),
    Number(amount),
    finalPaymentId,
    finalVoucherId // Pass voucherId if provided or extracted from payment
  );

  // Update payment record with investmentId to prevent duplicates
  if (paymentId) {
    await Payment.updateOne(
      { paymentId: paymentId },
      { $set: { investmentId: investment._id } }
    );
  }

  // Get updated wallets
  const wallets = await Wallet.find({ user: userId })
    .select("type balance reserved currency")
    .lean();

  const walletsFormatted = wallets.map((wallet) => ({
    type: wallet.type,
    balance: parseFloat(wallet.balance.toString()),
    reserved: parseFloat(wallet.reserved?.toString() || "0"),
    currency: wallet.currency || "USD",
  }));

  // Get updated binary tree info
  const binaryTree = await BinaryTree.findOne({ user: userId })
    .select("leftBusiness rightBusiness leftCarry rightCarry")
    .lean();

  // Investment confirmation email is sent by processInvestment (investment.service)

  const response = res as any;
  response.status(201).json({
    status: "success",
    message: "Investment created successfully",
    data: {
      investment: {
        id: investment._id,
        packageId: investment.packageId,
        investedAmount: parseFloat(investment.investedAmount.toString()),
        depositAmount: parseFloat(investment.depositAmount.toString()),
        type: investment.type,
        createdAt: investment.createdAt,
      },
      payment: {
        paymentId: paymentResult.paymentId,
        status: paymentResult.status,
      },
      wallets: walletsFormatted,
      binaryTree: binaryTree ? {
        leftBusiness: parseFloat(binaryTree.leftBusiness.toString()),
        rightBusiness: parseFloat(binaryTree.rightBusiness.toString()),
        leftCarry: parseFloat(binaryTree.leftCarry.toString()),
        rightCarry: parseFloat(binaryTree.rightCarry.toString()),
      } : null,
    },
  });
});

/**
 * Get user investments
 * GET /api/v1/user/investments
 */
export const getUserInvestments = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const investments = await Investment.find({ user: userId })
    .populate("packageId", "packageName roi duration")
    .sort({ createdAt: -1 })
    .lean();

  // Get voucher information for investments that used vouchers
  const voucherIds = investments
    .filter((inv) => inv.voucherId)
    .map((inv) => inv.voucherId);
  
  const vouchersMap = new Map();
  if (voucherIds.length > 0) {
    const vouchers = await Voucher.find({ voucherId: { $in: voucherIds } })
      .select("voucherId amount")
      .lean();
    vouchers.forEach((v: any) => {
      vouchersMap.set(v.voucherId, {
        voucherId: v.voucherId,
        amount: parseFloat(v.amount.toString()),
      });
    });
  }

  const investmentsFormatted = investments.map((inv) => {
    const voucherInfo = inv.voucherId ? vouchersMap.get(inv.voucherId) : null;
    return {
      id: inv._id,
      package: inv.packageId ? {
        id: (inv.packageId as any)._id,
        name: (inv.packageId as any).packageName,
        roi: (inv.packageId as any).roi,
        duration: (inv.packageId as any).duration,
      } : null,
      investedAmount: parseFloat(inv.investedAmount.toString()),
      depositAmount: parseFloat(inv.depositAmount.toString()),
      type: inv.type,
      isBinaryUpdated: inv.isBinaryUpdated,
      createdAt: inv.createdAt,
      expiresOn: inv.expiresOn,
      voucherId: inv.voucherId || null,
      voucher: voucherInfo || null,
    };
  });

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      investments: investmentsFormatted,
    },
  });
});

/**
 * Get user binary tree info
 * GET /api/v1/user/binary-tree
 */
export const getUserBinaryTree = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  // Get user to fetch referrer information
  const user = await User.findById(userId)
    .populate("referrer", "userId name")
    .lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const binaryTree = await BinaryTree.findOne({ user: userId })
    .populate("parent", "userId name")
    .populate("leftChild", "userId name")
    .populate("rightChild", "userId name")
    .lean();

  if (!binaryTree) {
    throw new AppError("Binary tree not found", 404);
  }

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      binaryTree: {
        // Show referrer as parent (the person who referred them)
        // This is what users expect to see, not the binary tree placement parent
        parent: user.referrer ? {
          id: (user.referrer as any)._id,
          userId: (user.referrer as any).userId,
          name: (user.referrer as any).name,
        } : null,
        // Include treeParent for reference (the actual binary tree placement parent)
        // This may differ from referrer if referrer's positions were full
        treeParent: binaryTree.parent ? {
          id: (binaryTree.parent as any)._id,
          userId: (binaryTree.parent as any).userId,
          name: (binaryTree.parent as any).name,
        } : null,
        leftChild: binaryTree.leftChild ? {
          id: (binaryTree.leftChild as any)._id,
          userId: (binaryTree.leftChild as any).userId,
          name: (binaryTree.leftChild as any).name,
        } : null,
        rightChild: binaryTree.rightChild ? {
          id: (binaryTree.rightChild as any)._id,
          userId: (binaryTree.rightChild as any).userId,
          name: (binaryTree.rightChild as any).name,
        } : null,
        leftBusiness: parseFloat(binaryTree.leftBusiness.toString()),
        rightBusiness: parseFloat(binaryTree.rightBusiness.toString()),
        leftCarry: parseFloat(binaryTree.leftCarry.toString()),
        rightCarry: parseFloat(binaryTree.rightCarry.toString()),
        leftDownlines: binaryTree.leftDownlines,
        rightDownlines: binaryTree.rightDownlines,
        cappingLimit: binaryTree.cappingLimit ? parseFloat(binaryTree.cappingLimit.toString()) : 0,
      },
    },
  });
});

/**
 * Get user wallet transactions
 * GET /api/v1/user/transactions
 */
export const getUserTransactions = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { walletType, type, page = 1, limit = 50 } = req.query;

  const query: any = { user: userId };
  if (walletType) {
    const wallet = await Wallet.findOne({ user: userId, type: walletType });
    if (wallet) {
      query.wallet = wallet._id;
    } else {
      // If wallet doesn't exist, return empty results
      const response = res as any;
      return response.status(200).json({
        status: "success",
        data: {
          transactions: [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            pages: 0,
          },
        },
      });
    }
  }
  if (type) {
    query.type = type;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const transactions = await WalletTransaction.find(query)
    .populate("wallet", "type")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await WalletTransaction.countDocuments(query);

  const transactionsFormatted = transactions.map((tx) => ({
    id: tx._id,
    walletType: (tx.wallet as any)?.type || "unknown",
    type: tx.type,
    amount: parseFloat(tx.amount.toString()),
    currency: tx.currency || "USD",
    balanceBefore: parseFloat(tx.balanceBefore.toString()),
    balanceAfter: parseFloat(tx.balanceAfter.toString()),
    status: tx.status,
    txRef: tx.txRef,
    meta: tx.meta,
    createdAt: tx.createdAt,
  }));

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      transactions: transactionsFormatted,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

/**
 * Get user reports (transactions grouped by type)
 * GET /api/v1/user/reports
 */
export const getUserReports = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  // Get all wallets for the user
  const wallets = await Wallet.find({ user: userId });
  const walletIds = wallets.map((w) => w._id);

  // Get transactions grouped by wallet type
  const transactions = await WalletTransaction.find({
    user: userId,
    wallet: { $in: walletIds },
  })
    .populate("wallet", "type")
    .sort({ createdAt: -1 })
    .lean();

  // Group transactions by type
  const roiTransactions = transactions.filter(
    (tx) => (tx.wallet as any)?.type === WalletType.ROI
  );
  const binaryTransactions = transactions.filter(
    (tx) => (tx.wallet as any)?.type === WalletType.BINARY
  );
  const referralTransactions = transactions.filter(
    (tx) =>
      (tx.wallet as any)?.type === WalletType.REFERRAL &&
      (tx.meta as any)?.type !== "withdrawal"
  );
  const careerLevelTransactions = transactions.filter(
    (tx) => (tx.wallet as any)?.type === WalletType.CAREER_LEVEL
  );
  const investmentTransactions = transactions.filter(
    (tx) => (tx.wallet as any)?.type === WalletType.INVESTMENT
  );

  // Get withdrawals
  const withdrawals = await Withdrawal.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();

  // Get investments for investment transactions
  const investmentIds = investmentTransactions
    .map((tx) => tx.txRef)
    .filter((id): id is string => !!id && Types.ObjectId.isValid(id));
  
  const investments = investmentIds.length > 0
    ? await Investment.find({
        _id: { $in: investmentIds.map((id) => new Types.ObjectId(id)) },
      })
        .populate("packageId", "packageName roi duration referralPct levelOneReferral")
        .populate("user", "userId name")
        .lean()
    : [];

  const investmentMap = new Map();
  investments.forEach((inv) => {
    investmentMap.set(inv._id.toString(), inv);
  });

  // Get referral source information (investments that generated referral bonuses)
  const referralInvestmentIds = referralTransactions
    .map((tx) => tx.txRef)
    .filter((id): id is string => !!id && Types.ObjectId.isValid(id));
  
  const referralInvestments = referralInvestmentIds.length > 0
    ? await Investment.find({
        _id: { $in: referralInvestmentIds.map((id) => new Types.ObjectId(id)) },
      })
        .populate("packageId", "packageName referralPct levelOneReferral")
        .populate("user", "userId name")
        .lean()
    : [];

  const referralInvestmentMap = new Map();
  referralInvestments.forEach((inv) => {
    referralInvestmentMap.set(inv._id.toString(), inv);
  });

  // Get source users from meta field (meta.fromUser can be ObjectId string or userId like CROWN-000097)
  const referralSourceUserIds = referralTransactions
    .map((tx) => tx.meta?.fromUser)
    .filter((id): id is string => !!id);
  
  const validObjectIds = referralSourceUserIds.filter((id) => Types.ObjectId.isValid(id));
  const userIds = referralSourceUserIds.filter((id) => !Types.ObjectId.isValid(id));

  const orConditions: any[] = [];
  if (validObjectIds.length > 0) {
    orConditions.push({ _id: { $in: validObjectIds.map((id) => new Types.ObjectId(id)) } });
  }
  if (userIds.length > 0) {
    orConditions.push({ userId: { $in: userIds } });
  }

  const referralSourceUsers = orConditions.length > 0
    ? await User.find({ $or: orConditions })
        .select("_id userId name")
        .lean()
    : [];

  const referralSourceUserMap = new Map();
  referralSourceUsers.forEach((u: any) => {
    referralSourceUserMap.set(u._id.toString(), u);
    if (u.userId) referralSourceUserMap.set(u.userId, u);
  });

  const formatTransaction = (tx: any) => ({
    id: tx._id,
    type: tx.type,
    amount: parseFloat(tx.amount.toString()),
    currency: tx.currency || "USD",
    balanceBefore: parseFloat(tx.balanceBefore.toString()),
    balanceAfter: parseFloat(tx.balanceAfter.toString()),
    status: tx.status,
    txRef: tx.txRef,
    meta: tx.meta,
    createdAt: tx.createdAt,
  });

  const formatInvestmentTransaction = (tx: any) => {
    const investment = tx.txRef ? investmentMap.get(tx.txRef) : null;
    return {
      id: tx._id,
      type: tx.type,
      amount: parseFloat(tx.amount.toString()),
      currency: tx.currency || "USD",
      balanceBefore: parseFloat(tx.balanceBefore.toString()),
      balanceAfter: parseFloat(tx.balanceAfter.toString()),
      status: tx.status,
      txRef: tx.txRef,
      investment: investment ? {
        id: investment._id,
        packageName: (investment.packageId as any)?.packageName || "N/A",
        roi: (investment.packageId as any)?.roi || 0,
        duration: (investment.packageId as any)?.duration || 0,
        investedAmount: parseFloat(investment.investedAmount.toString()),
        type: investment.type,
        createdAt: investment.createdAt,
      } : null,
      meta: tx.meta,
      createdAt: tx.createdAt,
    };
  };

  const formatReferralTransaction = (tx: any) => {
    const investment = tx.txRef ? referralInvestmentMap.get(tx.txRef) : null;
    const sourceUserId = tx.meta?.fromUser;
    const sourceUser = sourceUserId ? referralSourceUserMap.get(sourceUserId) : null;
    
    // Get package details
    const packageInfo = investment && (investment.packageId as any) ? {
      packageName: (investment.packageId as any)?.packageName || "N/A",
      referralPct: (investment.packageId as any)?.referralPct || (investment.packageId as any)?.levelOneReferral || 7,
      investedAmount: parseFloat(investment.investedAmount.toString()),
    } : null;

    // Use package referral percentage if available, otherwise calculate from amount
    let referralPct = null;
    if (packageInfo) {
      referralPct = packageInfo.referralPct;
    } else if (investment && parseFloat(investment.investedAmount.toString()) > 0) {
      // Fallback: calculate from transaction amount and invested amount
      referralPct = (parseFloat(tx.amount.toString()) / parseFloat(investment.investedAmount.toString())) * 100;
    }

    return {
      id: tx._id,
      type: tx.type,
      amount: parseFloat(tx.amount.toString()),
      currency: tx.currency || "USD",
      balanceBefore: parseFloat(tx.balanceBefore.toString()),
      balanceAfter: parseFloat(tx.balanceAfter.toString()),
      status: tx.status,
      txRef: tx.txRef,
      meta: tx.meta,
      createdAt: tx.createdAt,
      referralSource: sourceUser ? {
        userId: sourceUser.userId,
        name: sourceUser.name,
      } : null,
      packageInfo: packageInfo,
      referralPercentage: referralPct,
    };
  };

  const formatWithdrawal = (wd: any) => ({
    id: wd._id,
    amount: parseFloat(wd.amount.toString()),
    charges: parseFloat(wd.charges.toString()),
    finalAmount: parseFloat(wd.finalAmount.toString()),
    walletType: wd.walletType,
    status: wd.status,
    method: wd.method,
    withdrawalId: wd.withdrawalId,
    createdAt: wd.createdAt,
  });

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      roi: roiTransactions.map(formatTransaction),
      binary: binaryTransactions.map(formatTransaction),
      referral: referralTransactions.map(formatReferralTransaction),
      careerLevel: careerLevelTransactions.map(formatTransaction),
      investment: investmentTransactions.map(formatInvestmentTransaction),
      withdrawals: withdrawals.map(formatWithdrawal),
    },
  });
});

/**
 * Get withdrawal schedule information for user
 * GET /api/v1/user/withdrawal-schedule
 */
export const getWithdrawalSchedule = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  // Get user's active investments to determine package
  const activeInvestments = await Investment.find({
    user: userId,
    isActive: true,
  })
    .populate("packageId")
    .lean();

  if (activeInvestments.length === 0) {
    const response = res as any;
    response.status(200).json({
      status: "success",
      data: {
        hasActiveInvestment: false,
        message: "You need an active investment to have a withdrawal schedule",
      },
    });
    return;
  }

  // Get package information from first active investment
  const firstInvestment = activeInvestments[0];
  const pkg = firstInvestment.packageId as any;
  
  if (!pkg || !pkg.packageName) {
    const response = res as any;
    response.status(200).json({
      status: "success",
      data: {
        hasActiveInvestment: true,
        canWithdrawToday: true,
        message: "Withdrawal schedule not available for this package",
      },
    });
    return;
  }

  const packageName = pkg.packageName;
  const customSchedules = await getCustomSchedules();
  const canWithdrawToday = await isWithdrawalDateValid(packageName, new Date(), customSchedules);
  const nextDate = await getNextWithdrawalDate(packageName, new Date(), customSchedules);
  const scheduleDescription = await getWithdrawalScheduleDescription(packageName, customSchedules);
  const thisMonthDates = await getWithdrawalDatesForMonth(packageName, undefined, undefined, customSchedules);
  const nextMonthDates = await getWithdrawalDatesForMonth(
    packageName,
    new Date().getMonth() + 1,
    undefined,
    customSchedules
  );

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      hasActiveInvestment: true,
      packageName,
      scheduleDescription,
      canWithdrawToday,
      nextWithdrawalDate: nextDate.toISOString(),
      nextWithdrawalDateFormatted: nextDate.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Europe/London',
      }),
      thisMonthDates: thisMonthDates.map((d) => ({
        date: d.toISOString(),
        formatted: d.toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Europe/London',
        }),
      })),
      nextMonthDates: nextMonthDates.map((d) => ({
        date: d.toISOString(),
        formatted: d.toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Europe/London',
        }),
      })),
    },
  });
});

/**
 * Create withdrawal request
 * POST /api/v1/user/withdraw
 */
export const createWithdrawal = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { amount, walletType, method = "regular" } = req.body;

  const MIN_WITHDRAWAL_AMOUNT = 15;
  const amountNum = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  if (!amountNum || amountNum <= 0) {
    throw new AppError("Invalid withdrawal amount", 400);
  }
  if (amountNum < MIN_WITHDRAWAL_AMOUNT) {
    throw new AppError(`Minimum withdrawal amount is $${MIN_WITHDRAWAL_AMOUNT}`, 400);
  }
  const withdrawalAmount = amountNum;

  if (
    !walletType ||
    !["roi", "interest", "withdrawal", "career_level", "referral", "binary"].includes(
      walletType
    )
  ) {
    throw new AppError("Invalid wallet type", 400);
  }

  // Check if user has wallet address or bank account
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Check target completion for withdrawal lock
  const { checkTargetCompletion } = await import("../services/target-completion.service");
  const targetCheck = await checkTargetCompletion(userId);
  
  // For free accounts: official withdrawal rules
  // Before target: can withdraw Referral and Binary only; ROI locked.
  // After target: all eligible wallets withdrawable as per system rules.
  if (user.accountType === "free") {
    const targetCompleted = targetCheck.isCompleted;

    if (!targetCompleted) {
      // Before completing binary target: only Binary and Referral wallets; ROI withdrawal is locked
      if (walletType !== "binary" && walletType !== "referral") {
        throw new AppError(
          "Before completing your binary target, you can only withdraw from Binary and Referral wallets. ROI withdrawal is locked until your target is completed.",
          403
        );
      }
      // Withdrawal amount is limited to balance in that wallet (binary/referral income earned) — checked below via wallet balance
    }
    // After target completed: no extra restriction; all wallet types allowed (falls through to normal checks)
  } else {
    // For normal and powerleg accounts: standard target check
    if (!targetCheck.isCompleted) {
      const message = targetCheck.message || "Your target is not completed. Complete your binary target to unlock withdrawal.";
      throw new AppError(message, 403);
    }

    // Check if withdrawals are enabled (additional safety check)
    if (user.withdrawEnabled === false && user.binaryTargetAmount && user.binaryTargetAmount > 0) {
      throw new AppError(
        "Your target is not completed. Complete your binary target to unlock withdrawal.",
        403
      );
    }
  }

  const hasWalletAddress = user.walletAddress && user.walletAddress.trim().length > 0;
  const hasBankAccount = user.bankAccount?.accountNumber && user.bankAccount.accountNumber.trim().length > 0;

  if (!hasWalletAddress && !hasBankAccount) {
    throw new AppError(
      "Wallet address or bank account is required. Please set your wallet address or bank account details before requesting a withdrawal.",
      400
    );
  }

  // Get user's binary tree to check capping limit
  const binaryTree = await BinaryTree.findOne({ user: userId });
  if (!binaryTree) {
    throw new AppError("Binary tree not found", 404);
  }

  const cappingLimit = parseFloat(binaryTree.cappingLimit?.toString() || "0");
  if (cappingLimit > 0 && withdrawalAmount > cappingLimit) {
    throw new AppError(
      `Withdrawal amount exceeds capping limit of $${cappingLimit.toFixed(2)}`,
      400
    );
  }

  // Get the wallet
  const wallet = await Wallet.findOne({ user: userId, type: walletType });
  if (!wallet) {
    throw new AppError(`Wallet of type ${walletType} not found`, 404);
  }

  const currentBalance = parseFloat(wallet.balance.toString());
  if (withdrawalAmount > currentBalance) {
    throw new AppError("Insufficient balance", 400);
  }

  // Check ROI withdrawal schedule if withdrawing from ROI wallet
  if (walletType === "roi") {
    // Get user's active investments to determine package
    const activeInvestments = await Investment.find({
      user: userId,
      isActive: true,
    })
      .populate("packageId")
      .lean();

    if (activeInvestments.length > 0) {
      // Check if today is a valid withdrawal date for any of the user's packages
      let canWithdraw = false;
      let packageName = "";
      let scheduleDescription = "";

      // Get custom schedules once for all checks
      const { getCustomSchedules } = await import('../utils/withdrawalSchedule');
      const customSchedules = await getCustomSchedules();

      for (const investment of activeInvestments) {
        const pkg = investment.packageId as any;
        if (pkg && pkg.packageName) {
          packageName = pkg.packageName;
          scheduleDescription = await getWithdrawalScheduleDescription(packageName, customSchedules);
          
          if (await isWithdrawalDateValid(packageName, new Date(), customSchedules)) {
            canWithdraw = true;
            break; // At least one package allows withdrawal today
          }
        }
      }

      if (!canWithdraw && packageName) {
        const nextDate = await getNextWithdrawalDate(packageName, new Date(), customSchedules);
        const nextDateStr = nextDate.toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'Europe/London',
        });
        
        throw new AppError(
          `ROI withdrawals are only allowed on scheduled dates. ${scheduleDescription}. Next withdrawal date: ${nextDateStr}`,
          400
        );
      }
    }
  }

  // Calculate charges (5% default)
  const charges = withdrawalAmount * 0.05;
  const finalAmount = withdrawalAmount - charges;

  // Create withdrawal record
  const withdrawal = await Withdrawal.create({
    user: userId,
    amount: Types.Decimal128.fromString(withdrawalAmount.toString()),
    charges: Types.Decimal128.fromString(charges.toString()),
    finalAmount: Types.Decimal128.fromString(finalAmount.toString()),
    walletType,
    status: WithdrawalStatus.PENDING,
    method,
  });

  // Reserve the amount in wallet
  const reservedAmount = parseFloat(wallet.reserved?.toString() || "0");
  wallet.reserved = Types.Decimal128.fromString(
    (reservedAmount + withdrawalAmount).toString()
  );
  await wallet.save();

  // Create transaction record
  await WalletTransaction.create({
    user: userId,
    wallet: wallet._id,
    type: "debit",
    amount: Types.Decimal128.fromString(withdrawalAmount.toString()),
    currency: wallet.currency || "USD",
    balanceBefore: wallet.balance,
    balanceAfter: Types.Decimal128.fromString(
      (currentBalance - withdrawalAmount).toString()
    ),
    status: "pending",
    txRef: withdrawal._id.toString(),
    meta: { type: "withdrawal", withdrawalId: withdrawal._id.toString() },
  });

  // Send withdrawal created email notification asynchronously (non-blocking)
  const userEmail = user?.email;
  const userName = user?.name || "User";
  const amountVal = parseFloat(withdrawal.amount.toString());
  const chargesVal = parseFloat(withdrawal.charges.toString());
  const finalAmountVal = parseFloat(withdrawal.finalAmount.toString());
  const withdrawalIdStr = withdrawal._id.toString();
  const walletTypeVal = withdrawal.walletType;
  setImmediate(async () => {
    try {
      if (!userEmail) {
        console.warn("Skipping withdrawal created email: user has no email");
        return;
      }
      const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:3000";
      const dashboardLink = `${clientUrl}/withdraw`;
      await sendWithdrawalCreatedEmail({
        to: userEmail,
        name: userName,
        amount: amountVal,
        charges: chargesVal,
        finalAmount: finalAmountVal,
        walletType: walletTypeVal,
        withdrawalId: withdrawalIdStr,
        dashboardLink,
      });
    } catch (emailError: any) {
      console.error("Failed to send withdrawal created email:", emailError.message);
    }
  });

  const response = res as any;
  response.status(201).json({
    status: "success",
    data: {
      withdrawal: {
        id: withdrawal._id,
        amount: parseFloat(withdrawal.amount.toString()),
        charges: parseFloat(withdrawal.charges.toString()),
        finalAmount: parseFloat(withdrawal.finalAmount.toString()),
        walletType: withdrawal.walletType,
        status: withdrawal.status,
        method: withdrawal.method,
        createdAt: withdrawal.createdAt,
      },
    },
  });
});

/**
 * Get user vouchers
 * GET /api/v1/user/vouchers?status=active
 */
export const getUserVouchers = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  // Get status filter from query params
  const { status } = req.query;
  
  // Build query filter
  const filter: any = { user: userId };
  if (status) {
    filter.status = status;
  }

  const vouchers = await Voucher.find(filter)
    .populate("fromWallet", "type")
    .populate("createdBy", "name userId")
    .sort({ createdAt: -1 })
    .lean();

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      vouchers: vouchers.map((v) => ({
        id: v._id,
        voucherId: v.voucherId,
        amount: parseFloat(v.amount.toString()),
        investmentValue: v.investmentValue ? parseFloat(v.investmentValue.toString()) : parseFloat(v.amount.toString()) * 2, // Default 2x if not set
        multiplier: v.multiplier || 2,
        originalAmount: v.originalAmount
          ? parseFloat(v.originalAmount.toString())
          : null,
        fromWalletType: (v.fromWallet as any)?.type || null,
        createdBy: v.createdBy
          ? {
              name: (v.createdBy as any).name,
              userId: (v.createdBy as any).userId,
            }
          : null,
        status: v.status,
        createdOn: v.createdOn,
        usedAt: v.usedAt,
        expiry: v.expiry,
        createdAt: (v as any).createdAt,
      })),
    },
  });
});

/**
 * Create voucher (from wallet or via payment gateway)
 * POST /api/v1/user/vouchers/create
 * 
 * If fromWalletType is provided, voucher is created from wallet balance
 * If fromWalletType is not provided, payment gateway is used
 */
export const createVoucher = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { amount, fromWalletType, currency = "USD" } = req.body;

  if (!amount || amount <= 0) {
    throw new AppError("Invalid voucher amount", 400);
  }

  // Get minimum voucher amount dynamically from active packages
  const minVoucherAmount = await getMinVoucherAmount();
  if (minVoucherAmount <= 0) {
    throw new AppError("No active investment packages found. Cannot create voucher.", 400);
  }
  
  if (amount < minVoucherAmount) {
    throw new AppError(`Minimum voucher amount is $${minVoucherAmount.toFixed(2)}. You cannot create a voucher below this amount.`, 400);
  }

  const voucherMultiplier = 2; // 2x multiplier: $100 voucher = $200 investment value
  const investmentValue = amount * voucherMultiplier;
  const expiryDays = 120; // 120 days expiration

  // Generate unique voucher ID
  const voucherId = `VCH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // If fromWalletType is provided, create voucher from wallet
  if (fromWalletType) {
    // Fixed wallet cannot be used for vouchers (does not count for referral/binary, non-withdrawable)
    if (fromWalletType === WalletType.FIXED) {
      throw new AppError("Cannot create voucher from Fixed wallet. Fixed wallet does not count for referral or binary.", 400);
    }
    const fromWallet = await Wallet.findOne({ user: userId, type: fromWalletType });
    if (!fromWallet) {
      throw new AppError(`Wallet of type ${fromWalletType} not found`, 404);
    }

    const currentBalance = parseFloat(fromWallet.balance.toString());
    if (amount > currentBalance) {
      throw new AppError("Insufficient balance", 400);
    }

    // Create voucher
    const voucher = await Voucher.create({
      voucherId,
      user: userId,
      fromWallet: fromWallet._id,
      amount: Types.Decimal128.fromString(amount.toString()),
      investmentValue: Types.Decimal128.fromString(investmentValue.toString()),
      multiplier: voucherMultiplier,
      originalAmount: Types.Decimal128.fromString(amount.toString()),
      createdBy: userId,
      status: "active",
      expiry: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
    });

    // Deduct amount from wallet
    const newBalance = parseFloat(fromWallet.balance.toString()) - amount;
    fromWallet.balance = Types.Decimal128.fromString(newBalance.toString());
    await fromWallet.save();

    // Create transaction
    await WalletTransaction.create({
      user: userId,
      wallet: fromWallet._id,
      type: "debit",
      amount: Types.Decimal128.fromString(amount.toString()),
      currency: fromWallet.currency || "USD",
      balanceBefore: Types.Decimal128.fromString(
        (parseFloat(fromWallet.balance.toString()) + amount).toString()
      ),
      balanceAfter: fromWallet.balance,
      status: "completed",
      txRef: voucherId,
      meta: { type: "voucher_creation", voucherId },
    });

    const userForEmail = await User.findById(userId).select("email name").lean();
    if (userForEmail?.email) {
      const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:3000";
      const expiryStr = voucher.expiry ? new Date(voucher.expiry).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric", timeZone: "Europe/London" }) : "N/A";
      sendVoucherCreatedEmail({
        to: userForEmail.email,
        name: userForEmail.name || "User",
        voucherId: voucher.voucherId,
        amount: parseFloat(voucher.amount.toString()),
        investmentValue: parseFloat(voucher.investmentValue.toString()),
        expiryDate: expiryStr,
        dashboardLink: `${clientUrl}/vouchers`,
        source: "wallet",
      }).catch((err: any) => console.error("Failed to send voucher created email:", err.message));
    }

    const response = res as any;
    return response.status(201).json({
      status: "success",
      message: "Voucher created successfully",
      data: {
        voucher: {
          id: voucher._id,
          voucherId: voucher.voucherId,
          amount: parseFloat(voucher.amount.toString()),
          investmentValue: parseFloat(voucher.investmentValue.toString()),
          multiplier: voucher.multiplier,
          status: voucher.status,
          expiry: voucher.expiry,
          createdAt: (voucher as any).createdAt,
        },
      },
    });
  }

  // If no fromWalletType, check if payment gateway is enabled
  // If gateway is disabled, create voucher directly without payment
  const { Settings } = await import("../models/Settings");
  const nowpaymentsSetting = await Settings.findOne({ key: "nowpayments_enabled" });
  const isNOWPaymentsEnabled = nowpaymentsSetting === null || nowpaymentsSetting.value === true || nowpaymentsSetting.value === "true";

  // If payment gateway is disabled, create voucher directly without payment
  if (!isNOWPaymentsEnabled) {
    // Create voucher immediately without payment processing
    const voucher = await Voucher.create({
      voucherId,
      user: userId,
      amount: Types.Decimal128.fromString(amount.toString()),
      investmentValue: Types.Decimal128.fromString(investmentValue.toString()),
      multiplier: voucherMultiplier,
      originalAmount: Types.Decimal128.fromString(amount.toString()),
      createdBy: userId,
      status: "active",
      expiry: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
    });

    const userForEmail = await User.findById(userId).select("email name").lean();
    if (userForEmail?.email) {
      const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:3000";
      const expiryStr = voucher.expiry ? new Date(voucher.expiry).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric", timeZone: "Europe/London" }) : "N/A";
      sendVoucherCreatedEmail({
        to: userForEmail.email,
        name: userForEmail.name || "User",
        voucherId: voucher.voucherId,
        amount: parseFloat(voucher.amount.toString()),
        investmentValue: parseFloat(voucher.investmentValue.toString()),
        expiryDate: expiryStr,
        dashboardLink: `${clientUrl}/vouchers`,
        source: "wallet",
      }).catch((err: any) => console.error("Failed to send voucher created email:", err.message));
    }

    const response = res as any;
    return response.status(201).json({
      status: "success",
      message: "Voucher created successfully (payment gateway disabled)",
      data: {
        voucher: {
          id: voucher._id,
          voucherId: voucher.voucherId,
          amount: parseFloat(voucher.amount.toString()),
          investmentValue: parseFloat(voucher.investmentValue.toString()),
          multiplier: voucher.multiplier,
          status: voucher.status,
          expiry: voucher.expiry,
          createdAt: (voucher as any).createdAt,
        },
      },
    });
  }

  // If payment gateway is enabled, proceed with payment processing
  const { createNOWPaymentsInvoice } = await import("../lib/payments/nowpayments");

  // Generate order ID for voucher purchase
  const orderId = `VCH_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Get callback URLs
  const baseUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  const callbackUrl = process.env.NOWPAYMENTS_CALLBACK_URL || `${process.env.API_URL || 'https://api.crownbankers.com'}/api/v1/payment/callback`;
  const successUrl = `${baseUrl}/vouchers/success?orderId=${orderId}`;
  const cancelUrl = `${baseUrl}/vouchers/cancel?orderId=${orderId}`;

  // Get user email
  const user = await User.findById(userId).select("email").lean();
  const customerEmail = user?.email || undefined;

  // Create invoice with NOWPayments
  try {
    const invoiceResponse = await createNOWPaymentsInvoice({
      price_amount: amount,
      price_currency: currency.toUpperCase(),
      order_id: orderId,
      order_description: `Voucher Purchase - $${amount} (Investment Value: $${investmentValue})`,
      ipn_callback_url: callbackUrl,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
    });

    // Construct invoice URL
    let invoiceUrl = invoiceResponse.invoice_url;
    if (!invoiceUrl && invoiceResponse.id) {
      invoiceUrl = `https://nowpayments.io/invoice/?iid=${invoiceResponse.id}`;
    } else if (!invoiceUrl && invoiceResponse.token) {
      invoiceUrl = `https://nowpayments.io/invoice/?token=${invoiceResponse.token}`;
    }

    if (!invoiceUrl) {
      throw new AppError("Invoice URL not provided by NOWPayments", 500);
    }

    // Create voucher with pending status (will be activated after payment)
    const voucher = await Voucher.create({
      voucherId,
      user: userId,
      amount: Types.Decimal128.fromString(amount.toString()),
      investmentValue: Types.Decimal128.fromString(investmentValue.toString()),
      multiplier: voucherMultiplier,
      originalAmount: Types.Decimal128.fromString(amount.toString()),
      createdBy: userId,
      status: "active", // Will be activated after payment confirmation
      expiry: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
      paymentId: invoiceResponse.id || invoiceResponse.token || orderId,
      orderId,
    });

    const userForEmail = await User.findById(userId).select("email name").lean();
    if (userForEmail?.email) {
      const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:3000";
      const expiryStr = voucher.expiry ? new Date(voucher.expiry).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric", timeZone: "Europe/London" }) : "N/A";
      sendVoucherCreatedEmail({
        to: userForEmail.email,
        name: userForEmail.name || "User",
        voucherId: voucher.voucherId,
        amount: parseFloat(voucher.amount.toString()),
        investmentValue: parseFloat(voucher.investmentValue.toString()),
        expiryDate: expiryStr,
        dashboardLink: `${clientUrl}/vouchers`,
        source: "payment",
      }).catch((err: any) => console.error("Failed to send voucher created email:", err.message));
    }

    // Store payment record (using Payment model if it exists, or create a simple record)
    const { Payment } = await import("../models/Payment");
    await Payment.create({
      user: new Types.ObjectId(userId),
      orderId,
      paymentId: invoiceResponse.id || invoiceResponse.token || orderId,
      amount: Types.Decimal128.fromString(amount.toString()),
      currency,
      status: "pending",
      paymentUrl: invoiceUrl,
      payCurrency: invoiceResponse.pay_currency || undefined,
      meta: { type: "voucher_purchase", voucherId: voucher.voucherId },
    });

    const response = res as any;
    response.status(200).json({
      status: "success",
      message: "Voucher payment invoice created successfully",
      data: {
        voucher: {
          id: voucher._id,
          voucherId: voucher.voucherId,
          amount: parseFloat(voucher.amount.toString()),
          investmentValue: parseFloat(voucher.investmentValue.toString()),
          multiplier: voucher.multiplier,
          status: voucher.status,
          expiry: voucher.expiry,
        },
        payment: {
          paymentId: invoiceResponse.id || invoiceResponse.token,
          invoiceId: invoiceResponse.id,
          invoiceToken: invoiceResponse.token,
          paymentUrl: invoiceUrl,
          priceAmount: invoiceResponse.price_amount,
          priceCurrency: invoiceResponse.price_currency,
          orderId: invoiceResponse.order_id || orderId,
          status: "pending",
        },
        orderId,
      },
    });
  } catch (error: any) {
    console.error("NOWPayments voucher payment creation error:", error);
    throw new AppError(
      error.message || "Failed to create voucher payment request",
      500
    );
  }
});

/**
 * Update user wallet address
 * PUT /api/v1/user/wallet-address
 * Users can only set wallet address once. After that, only admins can update it.
 */
export const updateWalletAddress = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { walletAddress, bankAccount } = req.body;

  // Get current user to check if wallet address already exists
  const currentUser = await User.findById(userId);
  if (!currentUser) {
    throw new AppError("User not found", 404);
  }

  // Check if user is trying to update an existing wallet address
  // Only allow if it's an admin request (check if req.admin exists or user is CROWN-000000 or CNEOX-000000)
  const isAdminRequest = (req as any).admin !== undefined || currentUser.userId === "CROWN-000000" || currentUser.userId === "CNEOX-000000";
  
  if (walletAddress && currentUser.walletAddress && currentUser.walletAddress.trim().length > 0) {
    if (!isAdminRequest) {
      throw new AppError(
        "Wallet address cannot be changed once set. Please contact admin support to update your wallet address.",
        403
      );
    }
  }

  const updateData: any = {};
  if (walletAddress) {
    updateData.walletAddress = walletAddress;
  }
  if (bankAccount) {
    updateData.bankAccount = bankAccount;
  }

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        walletAddress: user.walletAddress,
        bankAccount: user.bankAccount,
      },
    },
  });
});

/**
 * Update user profile (basic info + payment info)
 * PUT /api/v1/user/profile
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { name, email, phone, country, walletAddress, bankAccount } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    country?: string;
    walletAddress?: string;
    bankAccount?: {
      accountNumber?: string;
      bankName?: string;
      ifscCode?: string;
      accountHolderName?: string;
    };
  };

  const updateData: any = {};

  if (typeof name === "string" && name.trim().length > 0) {
    updateData.name = name.trim();
  }

  // Prevent users from updating email address - emails are used for account identification
  // Email can only be changed by admin
  if (email !== undefined) {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new AppError("User not found", 404);
    }

    // Check if user is trying to change their email (only block if email actually changes)
    const emailChanged = email && email.toLowerCase() !== (currentUser.email?.toLowerCase() || '');
    
    if (emailChanged) {
      // Check if this is an admin request
      const isAdminRequest = (req as any).admin !== undefined || currentUser.userId === "CROWN-000000" || currentUser.userId === "CNEOX-000000";
      
      if (!isAdminRequest) {
        throw new AppError(
          "Email address cannot be changed. Please contact admin support to update your email address.",
          403
        );
      }
    }
    
    // Allow email update if admin or if email hasn't changed
    if (email) {
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError("Invalid email format", 400);
      }
      updateData.email = email.toLowerCase();
    } else {
      // Allow clearing email (admin only or if already empty)
      if (!currentUser.email || currentUser.email.trim().length === 0) {
        updateData.email = undefined;
      } else {
        // Regular users cannot clear their email
        const isAdminRequest = (req as any).admin !== undefined || currentUser.userId === "CROWN-000000" || currentUser.userId === "CNEOX-000000";
        if (!isAdminRequest) {
          throw new AppError(
            "Email address cannot be removed. Please contact admin support.",
            403
          );
        }
        updateData.email = undefined;
      }
    }
  }

  if (phone !== undefined) {
    // Basic phone validation (optional)
    if (phone && !/^[0-9+\-\s]+$/.test(phone)) {
      throw new AppError("Invalid phone number format", 400);
    }
    // NOTE: We intentionally do NOT enforce uniqueness on phone anymore.
    // Multiple user accounts can share the same phone number.
    updateData.phone = phone;
  }

  if (typeof country === "string" && country.trim().length > 0) {
    updateData.country = country.trim();
  }

  // Prevent users from updating wallet address through profile update
  // Wallet address can only be set once via wallet-address endpoint, then only admins can change it
  if (walletAddress !== undefined) {
    // Get current user to check if wallet address already exists
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new AppError("User not found", 404);
    }

    // Check if user is trying to update an existing wallet address
    const isAdminRequest = (req as any).admin !== undefined || currentUser.userId === "CROWN-000000";
    
    if (currentUser.walletAddress && currentUser.walletAddress.trim().length > 0) {
      if (!isAdminRequest) {
        throw new AppError(
          "Wallet address cannot be changed once set. Please contact admin support to update your wallet address.",
          403
        );
      }
    }
    
    // Only allow setting if it doesn't exist yet, or if it's an admin request
    if (!currentUser.walletAddress || isAdminRequest) {
      updateData.walletAddress = walletAddress;
    }
  }

  if (bankAccount !== undefined) {
    updateData.bankAccount = {
      accountNumber: bankAccount.accountNumber || "",
      bankName: bankAccount.bankName || "",
      ifscCode: bankAccount.ifscCode || "",
      accountHolderName: bankAccount.accountHolderName || "",
    };
  }

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        walletAddress: user.walletAddress,
        bankAccount: user.bankAccount,
        status: user.status,
        referrer: user.referrer,
        position: user.position,
      },
    },
  });
});

/**
 * Get user referral links
 * GET /api/v1/user/referral-links
 */
export const getUserReferralLinks = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const baseUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:3000";
  const leftLink = `${baseUrl}/signup?referrer=${user.userId}&position=left`;
  const rightLink = `${baseUrl}/signup?referrer=${user.userId}&position=right`;

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      leftLink,
      rightLink,
      userId: user.userId,
    },
  });
});

/**
 * Get user's direct referrals (level 1 only)
 * GET /api/v1/user/direct-referrals
 */
export const getUserDirectReferrals = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { page = 1, limit = 20, search = "", status = "", position = "" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build query
  const query: any = { referrer: userId };

  // Search filter (search in userId, name, email, phone)
  if (search) {
    const searchRegex = new RegExp(search as string, "i");
    query.$or = [
      { userId: searchRegex },
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  // Position filter
  if (position) {
    query.position = position;
  }

  // First, get all referrals matching the base query (without status filter)
  // We need to check investments for all to determine status correctly
  const allReferrals = await User.find(query)
    .select("userId name email phone status createdAt position country _id")
    .sort({ createdAt: -1 })
    .lean();

  // Get all referral user IDs
  const allReferralIds = allReferrals.map((ref) => ref._id);

  // Check which referrals have active investments
  const activeInvestments = await Investment.find({
    user: { $in: allReferralIds },
    isActive: true,
  })
    .select("user")
    .lean();

  // Create a Set of user IDs with active investments (normalize to string for comparison)
  const usersWithActiveInvestments = new Set(
    activeInvestments.map((inv) => {
      // Handle both ObjectId and string formats
      const userId = inv.user;
      return userId instanceof Types.ObjectId ? userId.toString() : String(userId);
    })
  );

  // Format all referrals and determine status based on active investments
  const allFormatted = allReferrals.map((ref) => {
    // Determine status: "active" if user has active investment, otherwise "inactive"
    // But preserve other statuses like "suspended" or "blocked" from user.status
    let displayStatus: string;
    const refIdStr = ref._id.toString();
    
    if (ref.status === "suspended" || ref.status === "blocked" || ref.status === "suspected") {
      // Preserve these statuses
      displayStatus = ref.status;
    } else if (usersWithActiveInvestments.has(refIdStr)) {
      // User has active investment
      displayStatus = "active";
    } else {
      // User has no active investment
      displayStatus = "inactive";
    }

    return {
      id: ref._id,
      userId: ref.userId,
      name: ref.name,
      email: ref.email,
      phone: ref.phone,
      status: displayStatus,
      position: ref.position,
      country: ref.country,
      joinedAt: ref.createdAt,
    };
  });

  // Apply status filter if provided
  let filtered = allFormatted;
  if (status) {
    const statusStr = typeof status === 'string' ? status : String(status);
    filtered = allFormatted.filter((ref) => ref.status.toLowerCase() === statusStr.toLowerCase());
  }

  // Get total count after status filtering
  const total = filtered.length;

  // Apply pagination
  const formatted = filtered.slice(skip, skip + limitNum);

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      referrals: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});

/**
 * Exchange funds between wallets
 * POST /api/v1/user/wallet-exchange
 */
export const exchangeWalletFunds = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { fromWalletType, toWalletType, amount, exchangeRate } = req.body;

  if (!fromWalletType || !toWalletType || !amount) {
    throw new AppError("From wallet type, to wallet type, and amount are required", 400);
  }

  if (amount <= 0) {
    throw new AppError("Amount must be greater than zero", 400);
  }

  // CRITICAL: Enforce wallet exchange restrictions
  // Fixed wallet cannot be used for exchange (not counted for referral/binary, admin-only, non-withdrawable)
  if (fromWalletType === WalletType.FIXED || toWalletType === WalletType.FIXED) {
    throw new AppError("Fixed wallet cannot be used for exchange. It does not count for referral or binary.", 400);
  }
  // Users can exchange FROM: referral, binary, career_level, roi, or interest wallets
  // Career Level and ROI wallets can only be exchanged once per day
  const allowedFromWallets = [
    WalletType.REFERRAL,
    WalletType.BINARY,
    WalletType.CAREER_LEVEL,
    WalletType.ROI,
    WalletType.INTEREST,
  ];
  if (!allowedFromWallets.includes(fromWalletType)) {
    throw new AppError(
      `Exchange is only allowed from Referral, Binary, Career Level, ROI, or Interest wallets. You cannot exchange from ${fromWalletType} wallet.`,
      400
    );
  }

  // Users can exchange TO: any income wallet (roi, interest, referral, binary, career_level)
  // Withdrawal wallet is deprecated - users should withdraw directly from income wallets
  const allowedToWallets = [
    WalletType.ROI,
    WalletType.INTEREST,
    WalletType.REFERRAL,
    WalletType.BINARY,
    WalletType.CAREER_LEVEL,
  ];
  if (!allowedToWallets.includes(toWalletType)) {
    throw new AppError(
      `Exchange is only allowed to ROI, Interest, Referral, Binary, or Career Level wallets. Withdrawal wallet is no longer available.`,
      400
    );
  }

  // Validate wallet types exist in enum
  const validWalletTypes = Object.values(WalletType);
  if (!validWalletTypes.includes(fromWalletType) || !validWalletTypes.includes(toWalletType)) {
    throw new AppError("Invalid wallet type", 400);
  }

  // Check daily limit for Career Level and ROI wallets (once per day)
  if (fromWalletType === WalletType.CAREER_LEVEL || fromWalletType === WalletType.ROI) {
    // Get the wallet ID for the source wallet type
    const sourceWallet = await Wallet.findOne({
      user: userId,
      type: fromWalletType,
    });

    if (sourceWallet) {
      // Check if user has already exchanged from this wallet today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingExchangeToday = await WalletTransaction.findOne({
        user: userId,
        wallet: sourceWallet._id,
        type: "debit",
        "meta.type": "wallet_exchange",
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
      });

      if (existingExchangeToday) {
        const walletName =
          fromWalletType === WalletType.CAREER_LEVEL ? "Career Level" : "ROI";
        throw new AppError(
          `You have already exchanged from ${walletName} wallet today. You can only exchange once per day from this wallet.`,
          400
        );
      }
    }
  }

  // Exchange rate is fixed at 1.0 (ignore user-provided exchangeRate for security)
  const fixedExchangeRate = 1.0;

  // Perform exchange with fixed 1:1 rate
  const result = await exchangeWallets(
    userId,
    fromWalletType,
    toWalletType,
    amount,
    fixedExchangeRate
  );

  const response = res as any;
  response.status(200).json({
    status: "success",
    message: "Wallet exchange completed successfully",
    data: result,
  });
});

/**
 * Get user's career progress (User)
 * GET /api/v1/user/career-progress
 */
/**
 * Create ticket
 * POST /api/v1/user/tickets
 */
export const createTicket = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const body = req.body;
  const { department, service, subject, description, document } = body as {
    department: "Admin support" | "Technical Support";
    service?: "Package Activation" | "Downline Activation" | "Authentication";
    subject: string;
    description?: string;
    document?: string;
  };

  if (!department || !subject) {
    throw new AppError("Department and subject are required", 400);
  }

  if (!["Admin support", "Technical Support"].includes(department)) {
    throw new AppError("Invalid department. Must be 'Admin support' or 'Technical Support'", 400);
  }

  const { Ticket } = await import("../models/Ticket");
  
  const ticket = await Ticket.create({
    raisedBy: userId,
    department,
    service: service || undefined,
    subject,
    description: description || undefined,
    document: document || undefined,
    status: "Open",
  });

  const populatedTicket = await Ticket.findById(ticket._id)
    .populate("raisedBy", "userId name email")
    .lean();

  // Send confirmation email to user
  try {
    if ((populatedTicket?.raisedBy as any)?.email) {
      const { sendTicketCreatedEmail } = await import("../lib/mail-service/email.service");
      sendTicketCreatedEmail({
        to: (populatedTicket.raisedBy as any).email,
        name: (populatedTicket.raisedBy as any).name || "User",
        ticketId: ticket._id.toString(),
        subject: ticket.subject,
        department: ticket.department,
      }).catch((error) => {
        console.error('Failed to send ticket creation email:', error);
      });
    }
  } catch (error) {
    console.error('Error preparing ticket creation email:', error);
  }

  const response = res as any;
  response.status(201).json({
    status: "success",
    message: "Ticket created successfully",
    data: {
      ticket: {
        id: ticket._id,
        raisedBy: {
          userId: (populatedTicket?.raisedBy as any)?.userId || "N/A",
          name: (populatedTicket?.raisedBy as any)?.name || "Unknown",
          email: (populatedTicket?.raisedBy as any)?.email || "N/A",
        },
        department: ticket.department,
        service: ticket.service,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        document: ticket.document,
        createdAt: ticket.createdAt,
      },
    },
  });
});

/**
 * Get user tickets
 * GET /api/v1/user/tickets
 */
export const getUserTickets = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const { Ticket } = await import("../models/Ticket");
  const tickets = await Ticket.find({ raisedBy: userId })
    .sort({ createdAt: -1 })
    .lean();

  const formattedTickets = tickets.map((ticket) => ({
    id: ticket._id,
    department: ticket.department,
    service: ticket.service,
    subject: ticket.subject,
    description: ticket.description,
    status: ticket.status,
    document: ticket.document,
    reply: ticket.reply,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  }));

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      tickets: formattedTickets,
    },
  });
});

export const getUserCareerProgressController = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const progress = await getUserCareerProgress(userId);

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      progress: progress || {
        currentLevel: null,
        currentLevelName: null,
        levelInvestment: 0,
        totalBusinessVolume: 0,
        completedLevels: [],
        totalRewardsEarned: 0,
        lastCheckedAt: null,
      },
    },
  });
});

/**
 * Get user target completion status
 * GET /api/v1/user/target-status
 */
export const getUserTargetStatus = asyncHandler(async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const { checkTargetCompletion } = await import("../services/target-completion.service");
  const targetCheck = await checkTargetCompletion(userId);

  const response = res as any;
  response.status(200).json({
    status: "success",
    data: {
      binaryTargetAmount: user.binaryTargetAmount || 0,
      targetStatus: user.targetStatus || "pending",
      withdrawEnabled: user.withdrawEnabled || false,
      leftBusiness: targetCheck.leftBusiness,
      rightBusiness: targetCheck.rightBusiness,
      totalBusiness: targetCheck.totalBusiness,
      isCompleted: targetCheck.isCompleted,
      message: targetCheck.message,
    },
  });
});

