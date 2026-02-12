/**
 * Daily Reconciliation Cron Job
 * 
 * Runs comprehensive reconciliation service daily at 2:00 AM
 * Generates reports with warnings and actionable items
 * 
 * This cron job should be scheduled to run daily:
 * 0 2 * * * cd /path/to/server && npx ts-node -r dotenv/config src/scripts/runReconciliation.ts
 */

import cron from "node-cron";
import { generateReconciliationReport } from "../services/reconciliation.service";
import mongoose from "mongoose";
import dotenv from "dotenv";
import * as path from "path";

// Load environment variables
try {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
} catch (e) {}
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URL_PRODUCTION || process.env.MONGODB_URL_DEVELOPMENT || process.env.MONGODB_URI || "mongodb://localhost:27017/crown-bankers";

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB for reconciliation cron");
  } catch (error: any) {
    console.error("❌ Failed to connect to MongoDB:", error.message);
    throw error;
  }
}

/**
 * Daily reconciliation job
 * Runs at 2:00 AM every day
 */
async function runDailyReconciliation() {
  try {
    console.log(`\n${'='.repeat(100)}`);
    console.log(`🕐 DAILY RECONCILIATION CRON JOB`);
    console.log(`Started at: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(100)}\n`);
    
    await connectDB();
    
    // Run reconciliation for all users
    const reportPath = await generateReconciliationReport();
    
    console.log(`\n✅ Daily reconciliation completed!`);
    console.log(`📄 Report saved to: ${reportPath}\n`);
    
    // Optionally: Send email notification if there are critical errors
    // await sendEmailNotification(report);
    
  } catch (error: any) {
    console.error("❌ Error in daily reconciliation:", error.message);
    console.error(error.stack);
    
    // Optionally: Send alert email on failure
    // await sendErrorAlert(error);
  } finally {
    // Don't disconnect - keep connection alive for cron
  }
}

// Schedule cron job: Run daily at 2:00 AM
// Format: minute hour day month dayOfWeek
// 0 2 * * * = Every day at 2:00 AM
const reconciliationCron = cron.schedule("0 2 * * *", async () => {
  await runDailyReconciliation();
}, {
  scheduled: false, // Don't start automatically
  timezone: "UTC"
});

// Export for manual triggering
export { runDailyReconciliation, reconciliationCron };

// If running directly, execute immediately (for testing)
if (require.main === module) {
  runDailyReconciliation()
    .then(() => {
      console.log("✅ Reconciliation completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Reconciliation failed:", error);
      process.exit(1);
    });
}
