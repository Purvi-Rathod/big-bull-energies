import cron from "node-cron";
import { calculateDailyROI, deactivateExpiredInvestments, deactivateUsersWithAllExpiredInvestments } from "../services/roi-cron.service";
import { calculateDailyBinaryBonuses } from "../services/investment.service";
import { processExpiredVouchers } from "../services/voucher-expiry.service";
import { Settings } from "../models/Settings";

/**
 * Setup daily cron jobs
 * Per rule book order of operations:
 * 1. Deactivate expired investments
 * 2. Compute binary matching (BINARY_BONUS) and update carries
 * 3. Compute ROI for each active investment (ROI_PAYOUT) and credit wallet (split renewable/cashable)
 * 4. Record ledger entries for all transactions
 * 
 * NOTE: Referral bonuses are NOT calculated in cron jobs.
 * They are paid immediately when investments are activated (one-time payment via processInvestment).
 */
export function setupROICron() {
  // Run daily at midnight (00:00)
  cron.schedule("0 0 * * *", async () => {
    console.log("[Cron] Starting daily calculation job");
    try {
      // Step 0: Process expired vouchers (mark expired, send emails)
      const voucherResult = await processExpiredVouchers();
      if (voucherResult.processed > 0) {
        console.log(`[Cron] Processed ${voucherResult.processed} expired voucher(s), sent ${voucherResult.emailsSent} email(s)`);
      }
      // Step 1: Deactivate expired investments
      await deactivateExpiredInvestments();
      
      // Step 1.5: Mark users as inactive if all their investments are expired
      await deactivateUsersWithAllExpiredInvestments();
      
      // Step 2: Calculate binary bonuses FIRST (per rule book: binary before ROI)
      // This aggregates daily business volumes from active principals and calculates binary matching
      await calculateDailyBinaryBonuses();
      
      // Step 3: Calculate ROI only if today is an enabled day (admin-configured ROI cron schedule)
      const roiSchedule = await Settings.findOne({ key: "roi_cron_schedule" }).lean();
      const enabledDays: number[] = roiSchedule?.value?.enabledDays ?? [0, 1, 2, 3, 4, 5, 6];
      const todayDay = new Date().getDay(); // 0 = Sunday, 6 = Saturday
      if (enabledDays.length > 0 && enabledDays.includes(todayDay)) {
        await calculateDailyROI();
      } else if (enabledDays.length === 0) {
        console.log("[Cron] ROI skipped: no days enabled in ROI cron schedule.");
      } else {
        console.log(`[Cron] ROI skipped: today (day ${todayDay}) is not in enabled days [${enabledDays.join(", ")}].`);
      }
      
      console.log("[Cron] Daily calculation job completed (Binary → ROI)");
    } catch (error) {
      console.error("[Cron] Error in daily calculation job:", error);
    }
  });

  console.log("[Cron] Daily cron job scheduled to run daily at 00:00 (Binary → ROI per rule book)");
}

/**
 * Manual trigger for testing (can be called from API endpoint)
 * Triggers ROI calculation only
 */
export async function triggerROICalculation() {
  try {
    await deactivateExpiredInvestments();
    const result = await calculateDailyROI();
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Manual trigger for daily calculations (Binary + ROI per rule book order)
 * Can be called from API endpoint for testing
 * Order: Binary → ROI (per rule book section 7)
 */
export async function triggerDailyCalculations() {
  try {
    // Step 1: Deactivate expired investments
    await deactivateExpiredInvestments();
    
    // Step 1.5: Mark users as inactive if all their investments are expired
    const userDeactivationResult = await deactivateUsersWithAllExpiredInvestments();
    
    // Step 2: Calculate binary bonuses FIRST (aggregates daily business from active principals)
    const binaryResult = await calculateDailyBinaryBonuses();
    
    // Step 3: Calculate ROI (splits into cashable and renewable)
    const roiResult = await calculateDailyROI();
    
    return {
      usersDeactivated: userDeactivationResult,
      binary: binaryResult,
      roi: roiResult,
    };
  } catch (error) {
    throw error;
  }
}

