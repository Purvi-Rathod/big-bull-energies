import { Types } from "mongoose";
import { User } from "../models/User";
import { BinaryTree } from "../models/BinaryTree";
import { Investment } from "../models/Investment";
import { Wallet } from "../models/Wallet";
import { WalletTransaction } from "../models/WalletTransaction";
import { Package } from "../models/Package";
import { WalletType } from "../models/types";
import { AppError } from "../utils/AppError";
import {
  createInvestmentTransaction,
  createReferralTransaction,
  createBinaryTransaction,
} from "./transaction.service";
import { initializeBinaryTree, getAdminUser } from "./userInit.service";

/**
 * Calculate daily binary bonuses for all users
 * Per rule book: Active principal counts as business volume each day
 * This function processes all users and calculates binary bonuses using consumption model
 * Should be called daily by cron job (runs at end of day, just like ROI)
 * 
 * NOTE: Binary bonuses are NOT calculated immediately when investments are made.
 * Only business volume (BV) is added immediately. Binary bonuses are calculated
 * once per day via this cron job, similar to ROI calculations.
 */
export async function calculateDailyBinaryBonuses() {
  try {
    console.log(`[Binary Cron] Starting daily binary bonus calculation at ${new Date().toISOString()}`);

    // Get all users with binary tree entries
    const allTrees = await BinaryTree.find({}).populate("user").lean();
    console.log(`[Binary Cron] Found ${allTrees.length} binary tree entries`);

    let processedCount = 0;
    let errorCount = 0;
    let totalBinaryPaid = 0;

    // Get default package for binaryPct and powerCapacity (or use defaults)
    const defaultPackage = await Package.findOne({ status: "Active" }).lean();
    const defaultBinaryPct = defaultPackage?.binaryPct || defaultPackage?.binaryBonus || 10;
    const defaultPowerCapacity = parseFloat(
      defaultPackage?.powerCapacity?.toString() || 
      defaultPackage?.cappingLimit?.toString() || 
      "1000"
    );

    // NOTE: Business volume is already added to the tree when investments are created
    // via addBusinessVolumeUpTree(). We don't need to add it again here.
    // The daily binary bonus calculation should only calculate bonuses based on
    // the existing business volume in the tree.

    for (const tree of allTrees) {
      try {
        const userId = tree.user as any;
        if (!userId || !userId._id) {
          continue;
        }

        const userIdStr = userId._id.toString();
        const userIdObj = new Types.ObjectId(userIdStr);

        // IMPORTANT: Business volume is already added when investments are created via addBusinessVolumeUpTree
        // We should NOT add it again here. The daily calculation should only calculate bonuses based on
        // the existing business volume in the tree.
        // Business volume is cumulative and only increases when new investments are made, not daily.

        // Get current tree values (business volume was already added when investments were created)
        const updatedTree = await BinaryTree.findOne({ user: userIdObj });
        if (!updatedTree) continue;

        // Check if user has any available volume for matching
        const leftBusiness = parseFloat(updatedTree.leftBusiness?.toString() || "0");
        const rightBusiness = parseFloat(updatedTree.rightBusiness?.toString() || "0");
        const leftCarry = parseFloat(updatedTree.leftCarry?.toString() || "0");
        const rightCarry = parseFloat(updatedTree.rightCarry?.toString() || "0");

        const leftAvailable = leftCarry + (leftBusiness - parseFloat(updatedTree.leftMatched?.toString() || "0"));
        const rightAvailable = rightCarry + (rightBusiness - parseFloat(updatedTree.rightMatched?.toString() || "0"));

        // Skip if no volume available for matching
        if (leftAvailable <= 0 && rightAvailable <= 0) {
          continue;
        }

        // CRITICAL: Check if binary bonus was already calculated today to prevent duplicates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get user's binary wallet
        const binaryWallet = await Wallet.findOne({ user: userIdObj, type: WalletType.BINARY });
        
        if (binaryWallet) {
          // Check if binary transaction was already created today
          const existingBinaryTransaction = await WalletTransaction.findOne({
            user: userIdObj,
            wallet: binaryWallet._id,
            type: "credit",
            "meta.type": "binary",
            createdAt: {
              $gte: today,
              $lt: tomorrow,
            },
          });

          if (existingBinaryTransaction) {
            // Binary bonus already calculated today, skip to prevent duplicate
            console.log(`[Binary Cron] Binary bonus already calculated today for user ${userIdObj}, skipping`);
            continue;
          }
        }

        // Get user's active investment to find their package-specific capping limit
        const userInvestment = await Investment.findOne({
          user: userIdObj,
          isActive: true,
        })
          .populate("packageId")
          .sort({ startDate: -1 }) // Get most recent active investment
          .lean();

        // Get user's package-specific capping limit (daily cap)
        let userDailyCap = defaultPowerCapacity; // Default fallback
        if (userInvestment?.packageId) {
          const userPackage = userInvestment.packageId as any;
          userDailyCap = parseFloat(
            userPackage?.powerCapacity?.toString() ||
            userPackage?.cappingLimit?.toString() ||
            defaultPowerCapacity.toString()
          );
        }

        // Calculate binary bonus using consumption model with user's daily cap
        const binaryResult = await calculateBinaryBonus(
          userIdObj,
          defaultBinaryPct,
          userDailyCap
        );

        // Add binary bonus to user's binary wallet (cashable)
        if (binaryResult.binaryBonus > 0) {
          await updateWallet(
            userIdObj,
            WalletType.BINARY,
            binaryResult.binaryBonus,
            "add"
          );

          // Create binary transaction
          await createBinaryTransaction(
            userIdObj,
            binaryResult.binaryBonus,
            undefined, // fromUserId (daily calculation, not from specific user)
            undefined // investmentId (daily calculation)
          );

          totalBinaryPaid += binaryResult.binaryBonus;
          processedCount++;
        }
      } catch (error) {
        console.error(`[Binary Cron] Error processing user ${tree.user}:`, error);
        errorCount++;
      }
    }

    console.log(
      `[Binary Cron] Completed: ${processedCount} users processed, ${errorCount} errors, $${totalBinaryPaid.toFixed(2)} total binary paid`
    );

    return {
      processed: processedCount,
      errors: errorCount,
      totalBinaryPaid,
      total: allTrees.length,
    };
  } catch (error) {
    console.error("[Binary Cron] Fatal error:", error);
    throw error;
  }
}

/**
 * Add Business Volume (BV) to a user's binary tree leg
 * When a downline activates a package, their invested amount is added to referrer's leg
 */
export async function addBusinessVolume(
  userId: Types.ObjectId,
  amount: number,
  position: "left" | "right",
  isPowerleg: boolean = false
) {
  try {
    const userTree = await BinaryTree.findOne({ user: userId });
    if (!userTree) {
      throw new AppError("User binary tree not found", 404);
    }

    // Add BV to the specified leg's business (always add to regular BV for binary bonuses)
    const currentBusiness = position === "left" 
      ? parseFloat(userTree.leftBusiness.toString())
      : parseFloat(userTree.rightBusiness.toString());
    
    const newBusiness = currentBusiness + amount;
    
    if (position === "left") {
      userTree.leftBusiness = Types.Decimal128.fromString(newBusiness.toString());
      // Also track powerleg BV separately if it's a powerleg investment
      if (isPowerleg) {
        const currentPowerlegBV = parseFloat((userTree.leftPowerlegBusiness || Types.Decimal128.fromString("0")).toString());
        userTree.leftPowerlegBusiness = Types.Decimal128.fromString((currentPowerlegBV + amount).toString());
      }
    } else {
      userTree.rightBusiness = Types.Decimal128.fromString(newBusiness.toString());
      // Also track powerleg BV separately if it's a powerleg investment
      if (isPowerleg) {
        const currentPowerlegBV = parseFloat((userTree.rightPowerlegBusiness || Types.Decimal128.fromString("0")).toString());
        userTree.rightPowerlegBusiness = Types.Decimal128.fromString((currentPowerlegBV + amount).toString());
      }
    }

    await userTree.save();

    // Check and award career levels after business volume is added
    try {
      const { checkAndAwardCareerLevels } = await import("./career-level.service");
      await checkAndAwardCareerLevels(userId);
    } catch (careerError) {
      // Don't fail the business volume addition if career level check fails
      console.error(`[Career Level] Error checking career levels for user ${userId}:`, careerError);
    }

    // Check target completion after business volume is added
    try {
      const { updateTargetCompletionStatus } = await import("./target-completion.service");
      await updateTargetCompletionStatus(userId);
    } catch (targetError) {
      // Don't fail the business volume addition if target check fails
      console.error(`[Target Completion] Error checking target completion for user ${userId}:`, targetError);
    }

    return {
      leftBusiness: parseFloat(userTree.leftBusiness.toString()),
      rightBusiness: parseFloat(userTree.rightBusiness.toString()),
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to add business volume", 500);
  }
}

/**
 * Calculate and process binary bonus using consumption model
 * 
 * CORRECTED FORMULA (per user requirements):
 * 1. Matching Business = MIN(Left Business, Right Business) - from available volumes
 * 2. Binary Bonus = Matching Business × 10%
 * 3. Daily Capping: If Binary Bonus > Daily Cap → Credit only Cap amount (remaining ignored)
 * 4. Carry Forward = Business Volume - Matching Business (NOT affected by cap)
 * 
 * Key Points:
 * - Capping applies to BONUS amount, not matched volume
 * - Carry forward is calculated from BUSINESS VOLUME, not bonus
 * - Daily cap resets every day (user can earn up to cap every day)
 */
export async function calculateBinaryBonus(
  userId: Types.ObjectId,
  binaryPct: number = 10,
  dailyCap: number = 5000
): Promise<{ binaryBonus: number; matched: number; creditedBonus: number }> {
  try {
    const userTree = await BinaryTree.findOne({ user: userId });
    if (!userTree) {
      throw new AppError("User binary tree not found", 404);
    }

    // Get current values
    const leftBusiness = parseFloat(userTree.leftBusiness.toString()); // Cumulative (never decreases)
    const rightBusiness = parseFloat(userTree.rightBusiness.toString()); // Cumulative (never decreases)
    const leftCarry = parseFloat(userTree.leftCarry.toString()); // Unmatched portion
    const rightCarry = parseFloat(userTree.rightCarry.toString()); // Unmatched portion
    const leftMatched = parseFloat(userTree.leftMatched?.toString() || "0"); // Previously matched from leftBusiness
    const rightMatched = parseFloat(userTree.rightMatched?.toString() || "0"); // Previously matched from rightBusiness

    // Calculate available volume for matching
    // left_available = leftCarry + (leftBusiness - leftMatched)
    // right_available = rightCarry + (rightBusiness - rightMatched)
    const leftUnmatchedBusiness = leftBusiness - leftMatched;
    const rightUnmatchedBusiness = rightBusiness - rightMatched;
    const leftAvailable = leftCarry + leftUnmatchedBusiness;
    const rightAvailable = rightCarry + rightUnmatchedBusiness;

    // Step 1: Find matched volume (minimum of both sides) - this is BUSINESS VOLUME
    const matched = Math.min(leftAvailable, rightAvailable);

    // Step 2: Calculate full binary bonus from matched business
    const fullBinaryBonus = matched * (binaryPct / 100);

    // Step 3: Apply daily capping to BONUS amount (not matched volume)
    // If bonus > cap, credit only cap amount. Remaining bonus is ignored (not stored).
    const creditedBonus = Math.min(fullBinaryBonus, dailyCap);

    // Step 4: Calculate carry forward from BUSINESS VOLUME (NOT affected by cap)
    // Carry = Business - Matched Business
    // This is the key fix: carry is based on volume, not bonus
    let newLeftCarry = 0;
    let newRightCarry = 0;
    let newLeftMatched = leftMatched;
    let newRightMatched = rightMatched;

    if (matched > 0) {
      // Calculate new carry forward: available - matched (from business volume)
      newLeftCarry = Math.max(0, leftAvailable - matched);
      newRightCarry = Math.max(0, rightAvailable - matched);
      
      // Update matched amounts to track what was consumed from business
      // Consumption priority: carry first, then unmatched business
      const leftConsumedFromCarry = Math.min(leftCarry, matched);
      const rightConsumedFromCarry = Math.min(rightCarry, matched);
      
      // Remaining consumption from unmatched business
      const leftConsumedFromBusiness = matched - leftConsumedFromCarry;
      const rightConsumedFromBusiness = matched - rightConsumedFromCarry;
      
      // Update matched amounts (only track what was consumed from business, not from carry)
      newLeftMatched = leftMatched + leftConsumedFromBusiness;
      newRightMatched = rightMatched + rightConsumedFromBusiness;
    } else {
      // No matching, preserve existing carry forward
      newLeftCarry = leftCarry;
      newRightCarry = rightCarry;
    }

    // Update binary tree atomically to avoid race conditions
    // IMPORTANT: leftBusiness and rightBusiness remain unchanged (cumulative)
    // CRITICAL: Use findOneAndUpdate to ensure atomic update and avoid stale data issues
    const updatedTree = await BinaryTree.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          leftCarry: Types.Decimal128.fromString(newLeftCarry.toString()),
          rightCarry: Types.Decimal128.fromString(newRightCarry.toString()),
          leftMatched: Types.Decimal128.fromString(newLeftMatched.toString()),
          rightMatched: Types.Decimal128.fromString(newRightMatched.toString()),
        },
      },
      { new: true } // Return updated document
    );
    
    if (!updatedTree) {
      throw new AppError("Failed to update binary tree", 500);
    }

    return {
      binaryBonus: creditedBonus, // Return the credited (capped) bonus
      matched: matched, // Return actual matched business volume
      creditedBonus: creditedBonus, // Explicitly return credited amount
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to calculate binary bonus", 500);
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use addBusinessVolume and calculateBinaryBonus separately
 */
export async function updateBinaryTreeBusiness(
  userId: Types.ObjectId,
  amount: number,
  position: "left" | "right"
) {
  // Add BV first
  await addBusinessVolume(userId, amount, position);
  
  // Then calculate binary bonus (will use default 10% and $1000 cap)
  // Note: This should ideally get package info for correct binaryPct and powerCapacity
  const result = await calculateBinaryBonus(userId, 10, 1000);
  
  return {
    binaryBonus: result.binaryBonus,
    leftBusiness: 0, // Will be updated by addBusinessVolume
    rightBusiness: 0,
    leftCarry: 0,
    rightCarry: 0,
  };
}

/**
 * Update wallet balance
 * Creates wallet if it doesn't exist
 */
export async function updateWallet(
  userId: Types.ObjectId,
  walletType: WalletType,
  amount: number,
  operation: "add" | "subtract" = "add"
) {
  try {
    let wallet = await Wallet.findOne({ user: userId, type: walletType });
    
    // If wallet doesn't exist, create it
    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        type: walletType,
        balance: Types.Decimal128.fromString("0"),
        reserved: Types.Decimal128.fromString("0"),
        currency: "USD",
      });
    }

    const currentBalance = parseFloat(wallet.balance.toString());
    const newBalance = operation === "add" 
      ? currentBalance + amount 
      : currentBalance - amount;

    if (newBalance < 0) {
      throw new AppError("Insufficient wallet balance", 400);
    }

    wallet.balance = Types.Decimal128.fromString(newBalance.toString());
    await wallet.save();

    // Verify the save was successful by reloading the wallet
    const savedWallet = await Wallet.findById(wallet._id);
    if (!savedWallet) {
      throw new AppError("Failed to save wallet - wallet not found after save", 500);
    }
    
    const savedBalance = parseFloat(savedWallet.balance.toString());
    if (Math.abs(savedBalance - newBalance) > 0.01) {
      console.error(`[updateWallet] Balance mismatch! Expected: ${newBalance}, Saved: ${savedBalance}`);
      throw new AppError(`Wallet balance not saved correctly. Expected: ${newBalance}, Got: ${savedBalance}`, 500);
    }

    return savedWallet;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to update wallet", 500);
  }
}

/**
 * Process investment and update all related tables
 * @param isFreeAccount - When true, no referral income for upline and no business volume added to binary tree (funded/free accounts)
 */
export async function processInvestment(
  userId: Types.ObjectId,
  packageId: Types.ObjectId,
  amount: number,
  paymentId?: string,
  voucherId?: string,
  isFreeAccount: boolean = false
) {
  try {
    console.log(`[Investment Service] 🚀 Starting investment processing...`);
    console.log(`[Investment Service] User ID: ${userId}`);
    console.log(`[Investment Service] Package ID: ${packageId}`);
    console.log(`[Investment Service] Amount: $${amount}`);
    console.log(`[Investment Service] Payment ID: ${paymentId || 'none'}`);
    console.log(`[Investment Service] Voucher ID: ${voucherId || 'none'}`);
    if (isFreeAccount) console.log(`[Investment Service] Free/funded account: no referral, no BV`);
    
    // Get user and package
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    console.log(`[Investment Service] User found: ${user.userId} (${user.name}), Status: ${user.status}`);

    // Activate user if they are inactive (users become active when they invest)
    if (user.status === "inactive") {
      user.status = "active";
      await user.save();
      console.log(`[Investment Service] ✅ User ${user.userId} activated after investment`);
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      throw new AppError("Package not found", 404);
    }
    
    console.log(`[Investment Service] Package found: ${pkg.packageName}, ROI: ${pkg.roi}%, Duration: ${pkg.duration} days`);

    // Handle voucher if provided
    let voucher = null;
    if (voucherId) {
      const { Voucher } = await import("../models/Voucher");
      voucher = await Voucher.findOne({ 
        voucherId, 
        user: userId, 
        status: "active" 
      });

      if (!voucher) {
        throw new AppError("Voucher not found or already used", 404);
      }

      // Check if voucher is expired
      if (voucher.expiry && new Date() > voucher.expiry) {
        throw new AppError("Voucher has expired", 400);
      }

      // Validate: Investment amount must be at least 2x the voucher purchase amount
      const voucherPurchaseAmount = parseFloat(voucher.amount.toString());
      const minimumInvestmentRequired = voucherPurchaseAmount * 2;
      
      if (amount < minimumInvestmentRequired) {
        throw new AppError(
          `To use this voucher, you must invest at least $${minimumInvestmentRequired.toLocaleString()} (2x the voucher purchase amount of $${voucherPurchaseAmount.toLocaleString()})`,
          400
        );
      }

      // Verify voucher investment value
      const voucherInvestmentValue = parseFloat(voucher.investmentValue.toString());
      if (voucherInvestmentValue < amount) {
        // Voucher doesn't cover full amount, but that's okay - remaining will be paid via gateway
        // This is handled in createPayment controller
      }
      // If voucherInvestmentValue >= amount, voucher fully covers the investment - no additional payment needed

      // Mark voucher as used
      voucher.status = "used";
      voucher.usedAt = new Date();
      await voucher.save();

      // Notify voucher owner (may be same user or a different user if voucher was gifted)
      const voucherOwnerId = voucher.user instanceof Types.ObjectId ? voucher.user : (voucher.user as any)?._id;
      const ownerUser = voucherOwnerId ? await User.findById(voucherOwnerId).select("email name userId").lean() : null;
      if (ownerUser?.email) {
        const { sendVoucherUsedEmail } = await import("../lib/mail-service/email.service");
        const usedByName = user.name || (user as any).userId || userId.toString();
        const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:3000";
        sendVoucherUsedEmail({
          to: ownerUser.email,
          name: ownerUser.name || "User",
          voucherId: voucher.voucherId,
          amount: parseFloat(voucher.amount.toString()),
          investmentValue: parseFloat(voucher.investmentValue.toString()),
          usedBy: usedByName,
          dashboardLink: `${clientUrl}/vouchers`,
        }).catch((err: any) => console.error("[Investment Service] Failed to send voucher used email:", err.message));
      }
    }

    // Validate amount
    const minAmount = parseFloat(pkg.minAmount.toString());
    const maxAmount = parseFloat(pkg.maxAmount.toString());
    
    if (amount < minAmount || amount > maxAmount) {
      throw new AppError(
        `Investment amount must be between $${minAmount} and $${maxAmount}`,
        400
      );
    }

    // Get user's binary tree to determine position
    let userTree = await BinaryTree.findOne({ user: userId });
    if (!userTree) {
      // Binary tree not found - try to create it using user's referrer and position
      console.warn(`Binary tree not found for user ${userId}, attempting to create it...`);
      try {
        const referrerId = user.referrer ? (user.referrer as Types.ObjectId) : null;
        const position = (user.position as "left" | "right" | null) || null;
        
        // If no referrer, assign to admin
        const finalReferrerId = referrerId || await getAdminUser();
        
        await initializeBinaryTree(userId, finalReferrerId, position || undefined);
        userTree = await BinaryTree.findOne({ user: userId });
        if (!userTree) {
          throw new AppError("Failed to create binary tree for user. Please contact support.", 500);
        }
        console.log(`Binary tree created successfully for user ${userId}`);
      } catch (initError: any) {
        console.error(`Failed to create binary tree for user ${userId}:`, initError);
        throw new AppError(
          `User binary tree not found and could not be created: ${initError.message || 'Unknown error'}. Please contact support.`,
          500
        );
      }
    }

    // Determine position (left or right) based on user's position in parent's tree
    let position: "left" | "right" = "left"; // Default
    if (user.position) {
      position = user.position as "left" | "right";
    }

    // Get package configuration (use new fields, fallback to legacy)
    const durationDays = pkg.duration || 150;
    const totalOutputPct = pkg.totalOutputPct || pkg.roi || 225;
    const renewablePrinciplePct = pkg.renewablePrinciplePct || pkg.principleReturn || 50;
    
    // FIXED: Store daily ROI percentage from package.roi (daily percentage)
    // Package.roi is the DAILY ROI percentage (e.g., 1.75 means 1.75% per day)
    // Store as decimal for calculation (1.75% = 0.0175)
    let dailyRoiRate: number;
    if (pkg.roi && pkg.roi > 0) {
      // Use package.roi as daily percentage (convert to decimal)
      dailyRoiRate = pkg.roi / 100; // 1.75% = 0.0175
    } else if (pkg.totalOutputPct && pkg.totalOutputPct > 0) {
      // Fallback: calculate from totalOutputPct if roi not available
      dailyRoiRate = (pkg.totalOutputPct / 100) / durationDays;
    } else {
      // Default fallback
      dailyRoiRate = 0.0175; // 1.75% default
    }
    
    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);
    const expiresOn = endDate; // Legacy field

    // Create investment record (PackageInstance)
    console.log(`[Investment Service] Creating investment record...`);
    const investment = await Investment.create({
      user: userId,
      sponsor: user.referrer || undefined,
      packageId,
      investedAmount: Types.Decimal128.fromString(amount.toString()),
      principal: Types.Decimal128.fromString(amount.toString()), // Starts equal to investedAmount
      depositAmount: Types.Decimal128.fromString(amount.toString()),
      type: isFreeAccount ? "free" : "self",
      isBinaryUpdated: false,
      referralPaid: false,
      voucherId: voucherId || paymentId, // Store voucherId if provided, otherwise paymentId
      startDate,
      endDate,
      durationDays,
      totalOutputPct,
      dailyRoiRate,
      daysElapsed: 0,
      daysRemaining: durationDays,
      expiresOn, // Legacy field
      lastRoiDate: null, // Will be set on first ROI calculation
      totalRoiEarned: Types.Decimal128.fromString("0"),
      totalReinvested: Types.Decimal128.fromString("0"),
      isActive: true,
    });

    console.log(`[Investment Service] ✅ Investment record created successfully!`);
    console.log(`[Investment Service] Investment ID: ${investment._id}`);
    console.log(`[Investment Service] Investment Details:`);
    console.log(`[Investment Service]   - User: ${user.userId} (${user.name})`);
    console.log(`[Investment Service]   - Package: ${pkg.packageName}`);
    console.log(`[Investment Service]   - Amount: $${amount}`);
    console.log(`[Investment Service]   - Duration: ${durationDays} days`);
    console.log(`[Investment Service]   - Daily ROI Rate: ${(dailyRoiRate * 100).toFixed(2)}%`);
    console.log(`[Investment Service]   - Start Date: ${startDate.toISOString()}`);
    console.log(`[Investment Service]   - End Date: ${endDate.toISOString()}`);
    console.log(`[Investment Service]   - Payment ID: ${paymentId || 'none'}`);
    console.log(`[Investment Service]   - Voucher ID: ${voucherId || 'none'}`);

    // Add investment amount to user's investment wallet
    console.log(`[Investment Service] Updating investment wallet...`);
    await updateWallet(userId, WalletType.INVESTMENT, amount, "add");
    console.log(`[Investment Service] ✅ Investment wallet updated`);
    
    // Create investment transaction
    console.log(`[Investment Service] Creating investment transaction...`);
    await createInvestmentTransaction(
      userId,
      amount,
      investment._id.toString()
    );
    console.log(`[Investment Service] ✅ Investment transaction created`);

    // Process referral bonus for direct sponsor (level 1) - one-time per USER (not per investment)
    // Referral bonus is paid IMMEDIATELY when investment is activated
    // SKIP for free/funded accounts: no referral income for uplines on funded activations.
    //
    // IMPORTANT RULES:
    // 1. Referral bonus should only be paid ONCE per user (on their first investment)
    // 2. Referral bonus goes to the direct referrer (sponsor), not the binary tree parent
    // 3. Free/funded accounts: do NOT pay referral bonus to upline
    //
    if (!isFreeAccount && user.referrer) {
      // Check if this is the user's FIRST investment (referral bonus should only be paid once per user)
      const existingInvestments = await Investment.find({ 
        user: userId,
        _id: { $ne: investment._id } // Exclude current investment
      }).countDocuments();
      
      // Only pay referral bonus if this is the user's FIRST investment
      if (existingInvestments === 0) {
        // This is the user's first investment, pay referral bonus to their direct referrer (sponsor)
        console.log(`[Investment Service] Processing referral bonus for first investment...`);
        console.log(`[Investment Service] Referrer ID: ${user.referrer}`);
        await processReferralBonus(user.referrer, amount, pkg, investment._id.toString(), userId);
        
        // Mark this investment as having referral bonus paid (for tracking)
        investment.referralPaid = true;
        await investment.save();
        console.log(`[Investment Service] ✅ Referral bonus processed successfully`);
      } else {
        // User has made investments before, referral bonus already paid - skip
        console.log(`[Investment Service] ℹ️ User ${userId} has existing investments, skipping referral bonus (already paid on first investment)`);
      }
    } else if (isFreeAccount) {
      console.log(`[Investment Service] ℹ️ Free/funded account: skipping referral bonus`);
    }

    // Add business volume up the tree (binary bonuses will be calculated daily via cron)
    // SKIP for free/funded accounts: funded amount must not count in binary tree business.
    // This only adds BV to parent's business volume, does NOT calculate bonuses immediately
    // Binary bonuses are calculated at end of day via cron job (just like ROI)
    if (!isFreeAccount) {
      console.log(`[Investment Service] Adding business volume up the tree...`);
      await addBusinessVolumeUpTree(
        userId, 
        amount, 
        position,
        false // Regular investment, not powerleg
      );
      console.log(`[Investment Service] ✅ Business volume added to parent tree`);
      investment.isBinaryUpdated = true;
    } else {
      console.log(`[Investment Service] ℹ️ Free/funded account: skipping business volume (no BV in binary tree)`);
    }
    await investment.save();

    console.log(`[Investment Service] ✅✅✅ Investment processing completed successfully! ✅✅✅`);
    console.log(`[Investment Service] Summary:`);
    console.log(`[Investment Service]   - Investment ID: ${investment._id}`);
    console.log(`[Investment Service]   - User: ${user.userId} (${user.name})`);
    console.log(`[Investment Service]   - Amount: $${amount}`);
    console.log(`[Investment Service]   - Status: Active`);
    console.log(`[Investment Service]   - User Status: ${user.status}`);
    console.log(`[Investment Service] ==========================================`);

    return investment;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to process investment", 500);
  }
}

/**
 * Add business volume up the tree when a user invests
 * OPTIMIZED: Batch loads ancestors and defers career level checks for better performance
 * Binary bonuses are NOT calculated here - they are calculated daily via cron job
 * Only referral bonuses are calculated immediately at investment time
 */
export async function addBusinessVolumeUpTree(
  userId: Types.ObjectId,
  amount: number,
  position: "left" | "right",
  isPowerleg: boolean = false
) {
  try {
    // OPTIMIZATION: Collect all ancestors first, then batch process
    const ancestorsToUpdate: Array<{ userId: Types.ObjectId; position: "left" | "right" }> = [];
    let currentUserId = userId;
    const visited = new Set<string>();

    // Step 1: Collect all ancestors that need BV updates (single traversal)
    while (currentUserId && !visited.has(currentUserId.toString())) {
      visited.add(currentUserId.toString());
      
      const currentTree = await BinaryTree.findOne({ user: currentUserId })
        .select("parent leftChild rightChild")
        .lean();
      
      if (!currentTree || !currentTree.parent) {
        break; // Reached root or no parent
      }

      const parentId = currentTree.parent as Types.ObjectId;
      const parentTree = await BinaryTree.findOne({ user: parentId })
        .select("leftChild rightChild")
        .lean();
      
      if (!parentTree) {
        break;
      }

      // Determine which side of parent this user is on
      const currentUserIdStr = currentUserId.toString();
      const isLeftChild = parentTree.leftChild?.toString() === currentUserIdStr;
      const isRightChild = parentTree.rightChild?.toString() === currentUserIdStr;
      
      if (isLeftChild || isRightChild) {
        // User is a direct binary child
        const parentPosition = isLeftChild ? "left" : "right";
        ancestorsToUpdate.push({ userId: parentId, position: parentPosition });
        currentUserId = parentId;
      } else {
        // Check if parent is admin (has unlimited children via parent relationship)
        const parentUser = await User.findById(parentId).select("userId").lean();
        if (parentUser && ((parentUser as any).userId === "CROWN-000000" || (parentUser as any).userId === "CNEOX-000000")) {
          // User is admin's child, add BV but don't calculate binary bonus
          ancestorsToUpdate.push({ userId: parentId, position: position });
          break;
        } else {
          break;
        }
      }
    }

    if (ancestorsToUpdate.length === 0) {
      return; // No ancestors to update
    }

    // OPTIMIZATION 2: Batch load all trees that need updating
    const ancestorIds = ancestorsToUpdate.map(a => a.userId);
    const treesToUpdate = await BinaryTree.find({ user: { $in: ancestorIds } });
    const treeMap = new Map<string, any>();
    treesToUpdate.forEach(tree => {
      treeMap.set(tree.user.toString(), tree);
    });

    // OPTIMIZATION 3: Batch update all business volumes (no career level checks during update)
    const updatePromises: Promise<any>[] = [];
    
    for (const { userId: ancestorId, position: ancestorPosition } of ancestorsToUpdate) {
      const tree = treeMap.get(ancestorId.toString());
      if (!tree) continue;

      // Update business volume directly (faster than calling addBusinessVolume)
      const currentBusiness = ancestorPosition === "left" 
        ? parseFloat(tree.leftBusiness.toString())
        : parseFloat(tree.rightBusiness.toString());
      
      const newBusiness = currentBusiness + amount;
      
      if (ancestorPosition === "left") {
        tree.leftBusiness = Types.Decimal128.fromString(newBusiness.toString());
        if (isPowerleg) {
          const currentPowerlegBV = parseFloat((tree.leftPowerlegBusiness || Types.Decimal128.fromString("0")).toString());
          tree.leftPowerlegBusiness = Types.Decimal128.fromString((currentPowerlegBV + amount).toString());
        }
      } else {
        tree.rightBusiness = Types.Decimal128.fromString(newBusiness.toString());
        if (isPowerleg) {
          const currentPowerlegBV = parseFloat((tree.rightPowerlegBusiness || Types.Decimal128.fromString("0")).toString());
          tree.rightPowerlegBusiness = Types.Decimal128.fromString((currentPowerlegBV + amount).toString());
        }
      }

      updatePromises.push(tree.save());
    }

    // OPTIMIZATION 4: Batch save all trees
    await Promise.all(updatePromises);

    // OPTIMIZATION 5: Defer career level and target checks (run in background, don't block)
    // These are expensive operations and don't need to block the investment creation
    const ancestorIdsForChecks = ancestorsToUpdate.map(a => a.userId);
    setImmediate(async () => {
      try {
        const { checkAndAwardCareerLevels } = await import("./career-level.service");
        const { updateTargetCompletionStatus } = await import("./target-completion.service");
        
        // Run checks in parallel for all ancestors
        await Promise.all(
          ancestorIdsForChecks.map(async (ancestorId) => {
            try {
              await Promise.all([
                checkAndAwardCareerLevels(ancestorId).catch(err => 
                  console.error(`[Career Level] Error for user ${ancestorId}:`, err)
                ),
                updateTargetCompletionStatus(ancestorId).catch(err => 
                  console.error(`[Target Completion] Error for user ${ancestorId}:`, err)
                )
              ]);
            } catch (error) {
              // Don't fail if checks fail
              console.error(`Error running checks for user ${ancestorId}:`, error);
            }
          })
        );
      } catch (error) {
        console.error("Error in deferred career level/target checks:", error);
      }
    });

  } catch (error) {
    console.error("Error adding business volume up tree:", error);
    // Don't throw, just log - we don't want to fail the investment if BV addition fails
  }
}

/**
 * Process referral bonus for direct sponsor (level 1) - one-time at activation
 * Uses referralPct (default 7%) from package
 */
async function processReferralBonus(
  sponsorId: Types.ObjectId,
  amount: number,
  pkg: any,
  investmentId?: string,
  fromUserId?: Types.ObjectId
) {
  try {
    // Get package referral bonus percentage (use new referralPct, fallback to legacy levelOneReferral)
    const referralPercentage = pkg.referralPct || pkg.levelOneReferral || 7;
    
    // Calculate referral bonus: referral_pct * invested_amount
    const referralBonus = amount * (referralPercentage / 100);
    
    if (referralBonus > 0) {
      // Add referral bonus to sponsor's referral wallet
      await updateWallet(
        sponsorId,
        WalletType.REFERRAL,
        referralBonus,
        "add"
      );
      
      // Create referral transaction with source user information
      await createReferralTransaction(
        sponsorId,
        referralBonus,
        fromUserId?.toString(),
        investmentId
      );
    }
  } catch (error) {
    console.error("Error processing referral bonus:", error);
    // Don't throw, just log
  }
}

