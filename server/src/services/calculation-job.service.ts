import { Types } from "mongoose";
import { CalculationJob, ICalculationJob } from "../models/CalculationJob";
import { Investment } from "../models/Investment";
import { BinaryTree } from "../models/BinaryTree";
import { Wallet } from "../models/Wallet";
import { WalletTransaction } from "../models/WalletTransaction";
import { Package } from "../models/Package";
import { deactivateExpiredInvestments } from "./roi-cron.service";
import { updateWallet, calculateBinaryBonus } from "./investment.service";
import { createROITransaction, createBinaryTransaction } from "./transaction.service";
import { WalletType } from "../models/types";
import { sendCalculationFailureEmail } from "../lib/mail-service/email.service";

const BATCH_SIZE = 50; // Process 50 items at a time to avoid timeout

/**
 * Start a new calculation job in the background
 */
export async function startCalculationJob(
  includeROI: boolean = true,
  includeBinary: boolean = true,
  includeReferral: boolean = true,
  triggeredBy?: Types.ObjectId
): Promise<ICalculationJob> {
  const job = await CalculationJob.create({
    jobType: "daily_calculations",
    status: "pending",
    includeROI,
    includeBinary,
    includeReferral,
    triggeredBy,
    processedUserIds: [],
    processedInvestmentIds: [],
  });

  // Start processing in background (don't await)
  processCalculationJob(job._id.toString()).catch((error) => {
    console.error(`[Calculation Job] Fatal error processing job ${job._id}:`, error);
  });

  return job;
}

/**
 * Resume a failed or paused calculation job
 */
export async function resumeCalculationJob(jobId: string): Promise<ICalculationJob> {
  const job = await CalculationJob.findById(jobId);
  if (!job) {
    throw new Error("Calculation job not found");
  }

  if (job.status === "completed") {
    throw new Error("Job is already completed");
  }

  job.status = "processing";
  job.startedAt = new Date();
  await job.save();

  // Resume processing in background
  processCalculationJob(jobId).catch((error) => {
    console.error(`[Calculation Job] Fatal error resuming job ${jobId}:`, error);
  });

  return job;
}

/**
 * Process calculation job in background with resumable logic
 */
async function processCalculationJob(jobId: string): Promise<void> {
  const job = await CalculationJob.findById(jobId);
  if (!job) {
    console.error(`[Calculation Job] Job ${jobId} not found`);
    return;
  }

  try {
    job.status = "processing";
    await job.save();

    const results: any = {
      roi: null,
      binary: null,
      referral: null,
    };

    // Initialize totals
    let totalROIItems = 0;
    let totalBinaryItems = 0;
    let processedROIItems = 0;
    let processedBinaryItems = 0;

    // 1. Process ROI calculations
    if (job.includeROI) {
      try {
        await deactivateExpiredInvestments();
        const roiResult = await calculateDailyROIResumable(job);
        results.roi = {
          success: true,
          processed: roiResult.processed,
          errors: roiResult.errors,
          total: roiResult.total,
        };
        totalROIItems = roiResult.total;
        processedROIItems = roiResult.processed;
        job.processedItems = processedROIItems + processedBinaryItems;
        job.failedItems += roiResult.errors;
      } catch (error: any) {
        console.error(`[Calculation Job] ROI calculation failed:`, error);
        results.roi = {
          success: false,
          processed: 0,
          errors: 0,
          total: 0,
          error: error.message || "ROI calculation failed",
        };
        job.lastError = `ROI calculation failed: ${error.message}`;
        job.errorDetails = error;
      }
    }

    // 2. Process Binary calculations
    if (job.includeBinary) {
      try {
        // Reload job to get latest processedItems from ROI
        const jobBeforeBinary = await CalculationJob.findById(job._id);
        const roiProcessedBeforeBinary = jobBeforeBinary?.processedItems || 0;
        
        const binaryResult = await calculateDailyBinaryBonusesResumable(job);
        results.binary = {
          success: true,
          processed: binaryResult.processed,
          errors: binaryResult.errors,
          totalBinaryPaid: binaryResult.totalBinaryPaid,
          total: binaryResult.total,
        };
        totalBinaryItems = binaryResult.total;
        processedBinaryItems = binaryResult.processed;
        // Add binary processed to existing ROI processed
        job.processedItems = roiProcessedBeforeBinary + processedBinaryItems;
        job.failedItems += binaryResult.errors;
      } catch (error: any) {
        console.error(`[Calculation Job] Binary calculation failed:`, error);
        results.binary = {
          success: false,
          processed: 0,
          errors: 0,
          totalBinaryPaid: 0,
          total: 0,
          error: error.message || "Binary calculation failed",
        };
        job.lastError = `Binary calculation failed: ${error.message}`;
        job.errorDetails = error;
      }
    }

    // Reload job to get latest state before final update
    const finalJob = await CalculationJob.findById(job._id);
    if (!finalJob) {
      throw new Error("Job not found during final update");
    }
    
    // Update total items and final processed count
    finalJob.totalItems = totalROIItems + totalBinaryItems;
    // Use the actual processed counts from results
    finalJob.processedItems = processedROIItems + processedBinaryItems;
    finalJob.results = results;
    
    // Save final progress before marking as completed
    await finalJob.save();
    
    // Update job reference
    Object.assign(job, finalJob);

    // 3. Referral bonuses (info only)
    if (job.includeReferral) {
      results.referral = {
        success: true,
        message: "Referral bonuses are paid immediately at investment activation, not in daily cron",
        processed: 0,
        errors: 0,
        total: 0,
      };
    }

    // Mark job as completed (job already has latest state from above)
    job.status = "completed";
    job.completedAt = new Date();
    await job.save();

    console.log(`[Calculation Job] Job ${jobId} completed successfully`);
  } catch (error: any) {
    console.error(`[Calculation Job] Job ${jobId} failed:`, error);
    
    // Mark job as failed
    job.status = "failed";
    job.failedAt = new Date();
    job.lastError = error.message || "Unknown error";
    job.errorDetails = error;
    await job.save();

    // Send failure notification email
    try {
      await sendCalculationFailureEmail({
        to: "mayanksahu0024@gmail.com",
        jobId: jobId,
        jobType: job.jobType,
        error: error.message || "Unknown error",
        processedItems: job.processedItems,
        totalItems: job.totalItems,
      });
    } catch (emailError) {
      console.error(`[Calculation Job] Failed to send failure email:`, emailError);
    }
  }
}

/**
 * Resumable ROI calculation - skips already processed investments
 */
async function calculateDailyROIResumable(job: ICalculationJob) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all active investments, excluding already processed ones
  const activeInvestments = await Investment.find({
    isActive: true,
    _id: { $nin: job.processedInvestmentIds },
    $or: [
      { endDate: { $gte: today } },
      { expiresOn: { $gte: today } },
    ],
  })
    .populate("packageId")
    .lean();

  // Set totalItems for ROI (will be added to binary total later)
  const roiTotalItems = activeInvestments.length;

  let processedCount = 0;
  let errorCount = 0;

  // Process in batches
  for (let i = 0; i < activeInvestments.length; i += BATCH_SIZE) {
    const batch = activeInvestments.slice(i, i + BATCH_SIZE);
    
    for (const investment of batch) {
      try {
        // Check if ROI was already calculated today
        const lastRoiDate = investment.lastRoiDate
          ? new Date(investment.lastRoiDate)
          : null;

        if (lastRoiDate) {
          lastRoiDate.setHours(0, 0, 0, 0);
          if (lastRoiDate.getTime() === today.getTime()) {
            // Already processed today, mark as processed and skip
            job.processedInvestmentIds.push(investment._id as Types.ObjectId);
            // Count as processed for progress tracking (even though we skipped it)
            processedCount++;
            // Save progress periodically
            if (processedCount % 10 === 0) {
              // Reload job to get latest state
              const updatedJob = await CalculationJob.findById(job._id);
              if (updatedJob) {
                updatedJob.processedItems = processedCount;
                updatedJob.processedInvestmentIds = job.processedInvestmentIds;
                await updatedJob.save();
              }
            }
            continue;
          }
        }

        // Process ROI calculation (simplified - you'll need to adapt your existing logic)
        const pkg = investment.packageId as any;
        if (!pkg) {
          job.processedInvestmentIds.push(investment._id as Types.ObjectId);
          continue;
        }

        const renewablePrinciplePct = pkg.renewablePrinciplePct || pkg.principleReturn || 50;
        const currentPrincipal = parseFloat(investment.principal?.toString() || investment.investedAmount.toString());
        
        let dailyRoiRate: number;
        if (investment.dailyRoiRate) {
          dailyRoiRate = investment.dailyRoiRate;
        } else {
          const durationDays = investment.durationDays || pkg.duration || 150;
          const totalOutputPct = investment.totalOutputPct || pkg.totalOutputPct || pkg.roi || 225;
          dailyRoiRate = (totalOutputPct / 100) / durationDays;
        }

        const dailyRoiAmount = currentPrincipal * dailyRoiRate;
        const renewablePart = dailyRoiAmount * (renewablePrinciplePct / 100);
        const cashablePart = dailyRoiAmount - renewablePart;

        // Use imported functions

        if (cashablePart > 0) {
          await updateWallet(
            investment.user as Types.ObjectId,
            WalletType.ROI,
            cashablePart,
            "add"
          );
        }

        if (renewablePart > 0) {
          // Update renewable principal - get ROI wallet and update renewablePrincipal field
          let wallet = await Wallet.findOne({ 
            user: investment.user as Types.ObjectId, 
            type: WalletType.ROI 
          });
          
          if (!wallet) {
            wallet = await Wallet.create({
              user: investment.user as Types.ObjectId,
              type: WalletType.ROI,
              balance: Types.Decimal128.fromString("0"),
              renewablePrincipal: Types.Decimal128.fromString("0"),
              reserved: Types.Decimal128.fromString("0"),
              currency: "USD",
            });
          }

          const currentRenewable = parseFloat(wallet.renewablePrincipal?.toString() || "0");
          const newRenewable = currentRenewable + renewablePart;
          wallet.renewablePrincipal = Types.Decimal128.fromString(newRenewable.toString());
          await wallet.save();
        }

        await createROITransaction(
          investment.user as Types.ObjectId,
          dailyRoiAmount,
          cashablePart,
          renewablePart,
          investment._id.toString()
        );

        // Update investment
        const totalRoiEarned = parseFloat(investment.totalRoiEarned?.toString() || "0");
        const totalReinvested = parseFloat(investment.totalReinvested?.toString() || "0");
        const daysElapsed = investment.daysElapsed || 0;
        const durationDays = investment.durationDays || pkg.duration || 150;

        const newTotalRoi = totalRoiEarned + cashablePart;
        const newTotalReinvested = totalReinvested + renewablePart;
        const newDaysElapsed = daysElapsed + 1;
        const newDaysRemaining = Math.max(0, durationDays - newDaysElapsed);
        const isExpired = newDaysElapsed >= durationDays;

        await Investment.findByIdAndUpdate(investment._id, {
          lastRoiDate: today,
          principal: Types.Decimal128.fromString(currentPrincipal.toString()),
          totalRoiEarned: Types.Decimal128.fromString(newTotalRoi.toString()),
          totalReinvested: Types.Decimal128.fromString(newTotalReinvested.toString()),
          daysElapsed: newDaysElapsed,
          daysRemaining: newDaysRemaining,
          isActive: !isExpired,
        });

        // Mark as processed
        job.processedInvestmentIds.push(investment._id as Types.ObjectId);
        processedCount++;

        // Save progress periodically
        if (processedCount % 10 === 0) {
          // Reload job to get latest state and update
          const updatedJob = await CalculationJob.findById(job._id);
          if (updatedJob) {
            updatedJob.processedItems = processedCount;
            updatedJob.processedInvestmentIds = job.processedInvestmentIds;
            await updatedJob.save();
          }
        }
      } catch (error: any) {
        console.error(`[Calculation Job] Error processing investment ${investment._id}:`, error);
        errorCount++;
        // Still mark as processed to avoid infinite retries
        job.processedInvestmentIds.push(investment._id as Types.ObjectId);
      }
    }

    // Save progress after each batch
    const updatedJob = await CalculationJob.findById(job._id);
    if (updatedJob) {
      updatedJob.processedItems = processedCount;
      updatedJob.failedItems = errorCount;
      updatedJob.processedInvestmentIds = job.processedInvestmentIds;
      await updatedJob.save();
    }
  }

  return {
    processed: processedCount,
    errors: errorCount,
    total: roiTotalItems,
  };
}

/**
 * Resumable Binary calculation - skips already processed users
 */
async function calculateDailyBinaryBonusesResumable(job: ICalculationJob) {
  // Get all binary trees, excluding already processed users
  const allTrees = await BinaryTree.find({
    user: { $nin: job.processedUserIds },
  })
    .populate("user")
    .lean();

  const binaryTotalItems = allTrees.length;

  let processedCount = 0;
  let errorCount = 0;
  let totalBinaryPaid = 0;

  const defaultPackage = await Package.findOne({ status: "Active" }).lean();
  const defaultBinaryPct = defaultPackage?.binaryPct || defaultPackage?.binaryBonus || 10;
  const defaultPowerCapacity = parseFloat(
    defaultPackage?.powerCapacity?.toString() || 
    defaultPackage?.cappingLimit?.toString() || 
    "1000"
  );

  // Process in batches
  for (let i = 0; i < allTrees.length; i += BATCH_SIZE) {
    const batch = allTrees.slice(i, i + BATCH_SIZE);
    
    for (const tree of batch) {
      try {
        const userId = tree.user as any;
        if (!userId || !userId._id) {
          job.processedUserIds.push(tree.user as Types.ObjectId);
          processedCount++; // Count as processed even if skipped
          continue;
        }

        const userIdObj = new Types.ObjectId(userId._id.toString());
        const updatedTree = await BinaryTree.findOne({ user: userIdObj });
        if (!updatedTree) {
          job.processedUserIds.push(userIdObj);
          processedCount++; // Count as processed even if skipped
          continue;
        }

        const leftBusiness = parseFloat(updatedTree.leftBusiness?.toString() || "0");
        const rightBusiness = parseFloat(updatedTree.rightBusiness?.toString() || "0");
        const leftCarry = parseFloat(updatedTree.leftCarry?.toString() || "0");
        const rightCarry = parseFloat(updatedTree.rightCarry?.toString() || "0");

        const leftAvailable = leftCarry + (leftBusiness - parseFloat(updatedTree.leftMatched?.toString() || "0"));
        const rightAvailable = rightCarry + (rightBusiness - parseFloat(updatedTree.rightMatched?.toString() || "0"));

        if (leftAvailable <= 0 && rightAvailable <= 0) {
          job.processedUserIds.push(userIdObj);
          // Count as processed even if skipped (no volume to match)
          processedCount++;
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
            console.log(`[Calculation Job] Binary bonus already calculated today for user ${userIdObj}, skipping`);
            job.processedUserIds.push(userIdObj);
            processedCount++; // Count as processed
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

        if (binaryResult.binaryBonus > 0) {
          await updateWallet(
            userIdObj,
            WalletType.BINARY,
            binaryResult.binaryBonus,
            "add"
          );

          await createBinaryTransaction(
            userIdObj,
            binaryResult.binaryBonus,
            undefined,
            undefined
          );

          totalBinaryPaid += binaryResult.binaryBonus;
          processedCount++;
        }

        job.processedUserIds.push(userIdObj);

        // Save progress periodically
        if (processedCount % 10 === 0) {
          job.processedItems = processedCount;
          await job.save();
        }
      } catch (error: any) {
        console.error(`[Calculation Job] Error processing user ${tree.user}:`, error);
        errorCount++;
        job.processedUserIds.push(tree.user as Types.ObjectId);
      }
    }

    // Save progress after each batch
    const updatedJob = await CalculationJob.findById(job._id);
    if (updatedJob) {
      // Get ROI processed count (if any) - this is the base
      const roiProcessed = updatedJob.processedItems || 0;
      // Binary processed is cumulative within this function
      updatedJob.processedItems = roiProcessed + processedCount;
      updatedJob.failedItems = (updatedJob.failedItems || 0) + errorCount;
      updatedJob.processedUserIds = job.processedUserIds;
      await updatedJob.save();
    }
  }

  return {
    processed: processedCount,
    errors: errorCount,
    totalBinaryPaid,
    total: binaryTotalItems,
  };
}

/**
 * Get job status
 */
export async function getCalculationJobStatus(jobId: string): Promise<ICalculationJob | null> {
  return await CalculationJob.findById(jobId);
}

/**
 * Get latest job
 */
export async function getLatestCalculationJob(): Promise<ICalculationJob | null> {
  return await CalculationJob.findOne()
    .sort({ createdAt: -1 })
    .limit(1);
}
