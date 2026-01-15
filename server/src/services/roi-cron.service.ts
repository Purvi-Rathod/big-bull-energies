import { Investment } from "../models/Investment";
import { Package } from "../models/Package";
import { Wallet } from "../models/Wallet";
import { WalletType } from "../models/types";
import { Types } from "mongoose";
import { AppError } from "../utils/AppError";
import { createROITransaction } from "./transaction.service";

/**
 * Update wallet balance (helper function)
 * Creates wallet if it doesn't exist
 */
async function updateWallet(
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
        renewablePrincipal: Types.Decimal128.fromString("0"),
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

    return wallet;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to update wallet", 500);
  }
}

/**
 * Update renewable principal (non-withdrawable)
 * Creates wallet if it doesn't exist
 */
async function updateRenewablePrincipal(
  userId: Types.ObjectId,
  amount: number,
  operation: "add" | "subtract" = "add"
) {
  try {
    // Use ROI wallet for renewable principal tracking
    let wallet = await Wallet.findOne({ user: userId, type: WalletType.ROI });
    
    // If wallet doesn't exist, create it
    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        type: WalletType.ROI,
        balance: Types.Decimal128.fromString("0"),
        renewablePrincipal: Types.Decimal128.fromString("0"),
        reserved: Types.Decimal128.fromString("0"),
        currency: "USD",
      });
    }

    const currentRenewable = parseFloat(wallet.renewablePrincipal?.toString() || "0");
    const newRenewable = operation === "add" 
      ? currentRenewable + amount 
      : currentRenewable - amount;

    if (newRenewable < 0) {
      throw new AppError("Insufficient renewable principal", 400);
    }

    wallet.renewablePrincipal = Types.Decimal128.fromString(newRenewable.toString());
    await wallet.save();

    return wallet;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to update renewable principal", 500);
  }
}

/**
 * Calculate and distribute daily ROI for all active investments
 * This implements the renewable principle model:
 * - daily_roi_amount = principal * daily_roi_rate
 * - reinvest = daily_roi_amount * renewable_principle_pct/100
 * - payout = daily_roi_amount - reinvest
 * - principal += reinvest (effective next day)
 */
export async function calculateDailyROI() {
  try {
    console.log(`[ROI Cron] Starting daily ROI calculation at ${new Date().toISOString()}`);

    // Get all active investments that haven't expired
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeInvestments = await Investment.find({
      isActive: true,
      $or: [
        { endDate: { $gte: today } },
        { expiresOn: { $gte: today } }, // Legacy field
      ],
    })
      .populate("packageId")
      .lean();

    console.log(`[ROI Cron] Found ${activeInvestments.length} active investments`);

    let processedCount = 0;
    let errorCount = 0;

    for (const investment of activeInvestments) {
      try {
        const pkg = investment.packageId as any;
        if (!pkg) {
          console.warn(`[ROI Cron] Investment ${investment._id} has no package, skipping`);
          continue;
        }

        // Check if ROI was already calculated today
        const lastRoiDate = investment.lastRoiDate
          ? new Date(investment.lastRoiDate)
          : null;

        if (lastRoiDate) {
          lastRoiDate.setHours(0, 0, 0, 0);
          if (lastRoiDate.getTime() === today.getTime()) {
            // ROI already calculated today, skip
            continue;
          }
        }

        // Get package configuration (use new fields, fallback to legacy)
        const renewablePrinciplePct = pkg.renewablePrinciplePct || pkg.principleReturn || 50;
        
        // Use principal (current principal, changes with reinvest)
        const currentPrincipal = parseFloat(investment.principal?.toString() || investment.investedAmount.toString());
        
        // FIXED: Get daily ROI percentage directly from package
        // The package.roi field is the DAILY ROI percentage (e.g., 1.75% = 0.0175)
        // Package is the source of truth - always use package.roi if available
        let dailyRoiPct: number;
        
        // Priority 1: Get from package.roi (daily percentage) - this is the source of truth
        if (pkg.roi && pkg.roi > 0) {
          // Package.roi is the DAILY percentage (e.g., 1.75 means 1.75% per day)
          dailyRoiPct = pkg.roi / 100; // Convert percentage to decimal (1.75% = 0.0175)
        } else if (pkg.totalOutputPct && pkg.totalOutputPct > 0) {
          // Fallback: calculate from totalOutputPct if roi not available
          const durationDays = investment.durationDays || pkg.duration || 150;
          dailyRoiPct = (pkg.totalOutputPct / 100) / durationDays;
        } else if (investment.dailyRoiRate && investment.dailyRoiRate > 0) {
          // Last resort: use stored value (might be incorrect for old investments)
          // If dailyRoiRate is stored as a decimal (0.0175), use it directly
          // If it's stored as percentage (1.75), convert to decimal
          dailyRoiPct = investment.dailyRoiRate > 1 ? investment.dailyRoiRate / 100 : investment.dailyRoiRate;
        } else {
          // Default fallback
          dailyRoiPct = 0.0175; // 1.75% default
        }

        // Calculate daily ROI amount: principal * daily_roi_percentage
        // Formula: dailyROI = Principal × (Daily ROI % / 100)
        // Example: $5000 × 1.75% = $5000 × 0.0175 = $87.50
        const dailyRoiAmount = currentPrincipal * dailyRoiPct;

        // Split into renewable and cashable portions (per rule book)
        // renewablePart = daily_roi_amount * renewable_principle_pct/100
        const renewablePart = dailyRoiAmount * (renewablePrinciplePct / 100);
        
        // cashablePart = daily_roi_amount - renewablePart
        const cashablePart = dailyRoiAmount - renewablePart;

        // Add cashable part to user's ROI wallet (cashable balance)
        if (cashablePart > 0) {
          try {
            const updatedWallet = await updateWallet(
              investment.user as Types.ObjectId,
              WalletType.ROI,
              cashablePart,
              "add"
            );
            console.log(`[ROI Cron] Updated ROI wallet for user ${investment.user}: added $${cashablePart.toFixed(2)}, new balance: $${parseFloat(updatedWallet.balance.toString()).toFixed(2)}`);
          } catch (walletError: any) {
            console.error(`[ROI Cron] Failed to update ROI wallet for user ${investment.user}:`, walletError);
            throw walletError; // Re-throw to be caught by outer catch block
          }
        }

        // Add renewable part to user's renewable principal (non-withdrawable)
        if (renewablePart > 0) {
          await updateRenewablePrincipal(
            investment.user as Types.ObjectId,
            renewablePart,
            "add"
          );
        }

        // Create ROI transaction record
        // NOTE: Wallet balance is already updated by updateWallet() above
        // This creates the transaction record for reporting/audit purposes
        await createROITransaction(
          investment.user as Types.ObjectId,
          dailyRoiAmount,
          cashablePart,
          renewablePart,
          investment._id.toString()
        );

        // Update investment record
        const totalRoiEarned = parseFloat(investment.totalRoiEarned?.toString() || "0");
        const totalReinvested = parseFloat(investment.totalReinvested?.toString() || "0");
        const daysElapsed = investment.daysElapsed || 0;
        const durationDays = investment.durationDays || pkg.duration || 150;

        const newTotalRoi = totalRoiEarned + cashablePart;
        const newTotalReinvested = totalReinvested + renewablePart; // Track renewable separately
        const newDaysElapsed = daysElapsed + 1;
        const newDaysRemaining = Math.max(0, durationDays - newDaysElapsed);

        // Note: Per rule book, renewable principal does NOT increase the principal
        // Principal remains constant (original invested amount)
        // Renewable principal is tracked separately in wallet.renewablePrincipal
        const newPrincipal = currentPrincipal; // Keep principal constant

        // Check if investment has expired
        const isExpired = newDaysElapsed >= durationDays;

        await Investment.findByIdAndUpdate(investment._id, {
          lastRoiDate: today,
          principal: Types.Decimal128.fromString(newPrincipal.toString()),
          totalRoiEarned: Types.Decimal128.fromString(newTotalRoi.toString()),
          totalReinvested: Types.Decimal128.fromString(newTotalReinvested.toString()),
          daysElapsed: newDaysElapsed,
          daysRemaining: newDaysRemaining,
          isActive: !isExpired, // Deactivate if expired
        });

        processedCount++;
      } catch (error) {
        console.error(`[ROI Cron] Error processing investment ${investment._id}:`, error);
        errorCount++;
      }
    }

    console.log(
      `[ROI Cron] Completed: ${processedCount} processed, ${errorCount} errors`
    );

    return {
      processed: processedCount,
      errors: errorCount,
      total: activeInvestments.length,
    };
  } catch (error) {
    console.error("[ROI Cron] Fatal error:", error);
    throw error;
  }
}

/**
 * Deactivate expired investments
 * Checks both endDate (new) and expiresOn (legacy)
 */
export async function deactivateExpiredInvestments() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await Investment.updateMany(
      {
        isActive: true,
        $or: [
          { endDate: { $lt: today } },
          { expiresOn: { $lt: today } }, // Legacy field
          { daysRemaining: { $lte: 0 } },
        ],
      },
      {
        isActive: false,
      }
    );

    console.log(`[ROI Cron] Deactivated ${result.modifiedCount} expired investments`);
    return result.modifiedCount;
  } catch (error) {
    console.error("[ROI Cron] Error deactivating expired investments:", error);
    throw error;
  }
}

