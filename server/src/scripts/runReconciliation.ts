/**
 * Run Reconciliation Service
 * 
 * Daily reconciliation script that can be run via cron job
 * Checks all system components and generates comprehensive reports
 * 
 * Usage:
 *   - Check all users: npx ts-node -r dotenv/config src/scripts/runReconciliation.ts
 *   - Check specific user: npx ts-node -r dotenv/config src/scripts/runReconciliation.ts BIGBULL-000282
 *   - Limit users: npx ts-node -r dotenv/config src/scripts/runReconciliation.ts --max-users 1000
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import * as path from "path";
import { generateReconciliationReport } from "../services/reconciliation.service";

// Load environment variables
try {
  dotenv.config({ path: path.join(__dirname, '../../../.env') });
} catch (e) {}
try {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
} catch (e) {}
dotenv.config();

// Prioritize production database
const MONGODB_URI = process.env.MONGODB_URL_PRODUCTION || process.env.MONGODB_URL_DEVELOPMENT || process.env.MONGODB_URI || "mongodb://localhost:27017/crown-bankers";

async function connectDB() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/.*@/, "//***@")}\n`);
    
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");
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

async function main() {
  const userId = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : undefined;
  const maxUsersArg = process.argv.find(arg => arg.startsWith('--max-users'));
  const maxUsers = maxUsersArg ? parseInt(maxUsersArg.split('=')[1]) : undefined;
  
  try {
    await connectDB();
    
    console.log(`\n${'='.repeat(100)}`);
    console.log(`🔍 STARTING RECONCILIATION SERVICE`);
    console.log(`${'='.repeat(100)}\n`);
    
    if (userId) {
      console.log(`📊 Mode: Check specific user and downlines`);
      console.log(`   User ID: ${userId}\n`);
    } else if (maxUsers) {
      console.log(`📊 Mode: Check all users (limited to ${maxUsers})\n`);
    } else {
      console.log(`📊 Mode: Check all users\n`);
    }
    
    const reportPath = await generateReconciliationReport(userId, maxUsers);
    
    console.log(`\n✅ Reconciliation completed successfully!`);
    console.log(`📄 Report saved to: ${reportPath}\n`);
    
    await disconnectDB();
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    await disconnectDB();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main };
