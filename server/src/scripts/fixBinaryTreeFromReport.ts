/**
 * Fix Binary Tree Issues from Diagnostic Report
 * 
 * Reads a diagnostic report file and automatically applies all fixes
 * 
 * Usage: npx ts-node -r dotenv/config src/scripts/fixBinaryTreeFromReport.ts <report-file-path>
 * Example: npx ts-node -r dotenv/config src/scripts/fixBinaryTreeFromReport.ts diagnostic-reports/binary-tree-diagnostic-BIGBULL-000106-2026-02-06T12-34-47-575Z.txt
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Types } from "mongoose";
import * as path from "path";
import * as fs from "fs";
import { User } from "../models/User";
import { BinaryTree } from "../models/BinaryTree";

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

interface FixAction {
  userId: string;
  field: "leftBusiness" | "rightBusiness" | "leftDownlines" | "rightDownlines";
  value: number;
  description: string;
}

/**
 * Parse diagnostic report and extract all actions
 */
function parseReportFile(reportPath: string): FixAction[] {
  const reportContent = fs.readFileSync(reportPath, 'utf8');
  const fixes: FixAction[] = [];
  
  // Extract actions from ACTION SUMMARY section
  const actionSummaryMatch = reportContent.match(/ACTION SUMMARY[\s\S]*/);
  if (!actionSummaryMatch) {
    throw new Error("Could not find ACTION SUMMARY section in report");
  }
  
  const actionSection = actionSummaryMatch[0];
  const lines = actionSection.split('\n');
  
  // Find the line that starts with "Total Unique Actions" to know where actions start
  let startIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("Total Unique Actions")) {
      startIndex = i + 2; // Skip the "Total Unique Actions" line and empty line
      break;
    }
  }
  
  if (startIndex === -1) {
    throw new Error("Could not find action list in report");
  }
  
  // Parse action lines
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Skip if line doesn't start with a number followed by a dot
    if (!/^\d+\./.test(line)) continue;
    
    // Parse: "1. Update leftBusiness to 95050.00 for user BIGBULL-000106"
    // or: "119. Update leftBusiness to 95050.00 for user BIGBULL-000106"
    const match = line.match(/^\d+\.\s+Update\s+(\w+)\s+to\s+([\d.]+)\s+for\s+user\s+(\S+)/);
    if (match) {
      const [, field, valueStr, userId] = match;
      const value = parseFloat(valueStr);
      
      if (field === "leftBusiness" || field === "rightBusiness" || field === "leftDownlines" || field === "rightDownlines") {
        fixes.push({
          userId,
          field: field as FixAction["field"],
          value,
          description: line
        });
      } else {
        console.log(`⚠️  Skipping unknown field: ${field} in line: ${line}`);
      }
    } else {
      // Debug: log lines that don't match
      if (line.includes("Update")) {
        console.log(`⚠️  Could not parse line: ${line}`);
      }
    }
  }
  
  return fixes;
}

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

async function applyFixesFromReport(reportPath: string) {
  console.log(`\n${'='.repeat(100)}`);
  console.log(`🔧 FIXING BINARY TREE ISSUES FROM REPORT`);
  console.log(`${'='.repeat(100)}\n`);
  
  console.log(`📄 Reading report: ${reportPath}\n`);
  
  // Parse report
  const fixes = parseReportFile(reportPath);
  console.log(`✅ Parsed ${fixes.length} fixes from report\n`);
  
  if (fixes.length === 0) {
    console.log("⚠️  No fixes found in report. Exiting.\n");
    return;
  }
  
  // Group fixes by user
  const fixesByUser = new Map<string, FixAction[]>();
  fixes.forEach((fix) => {
    if (!fixesByUser.has(fix.userId)) {
      fixesByUser.set(fix.userId, []);
    }
    fixesByUser.get(fix.userId)!.push(fix);
  });
  
  console.log(`📊 Fixes grouped by user (${fixesByUser.size} users):\n`);
  fixesByUser.forEach((userFixes, userId) => {
    console.log(`   ${userId}: ${userFixes.length} fix(es)`);
  });
  console.log();
  
  const results: Array<{ userId: string; success: boolean; message: string; fixesApplied: number }> = [];
  let successCount = 0;
  let failureCount = 0;
  let totalFixesApplied = 0;
  
  // Apply fixes
  for (const [userId, userFixes] of fixesByUser.entries()) {
    console.log(`\n${'─'.repeat(100)}`);
    console.log(`🔍 Processing fixes for ${userId}...`);
    
    try {
      // Find user
      const user = await User.findOne({ userId }).select("_id userId name").lean();
      if (!user) {
        const errorMsg = `User ${userId} not found`;
        console.error(`   ❌ ${errorMsg}`);
        results.push({ userId, success: false, message: errorMsg, fixesApplied: 0 });
        failureCount++;
        continue;
      }
      
      const userObjId = new Types.ObjectId(user._id.toString());
      console.log(`   ✅ User found: ${(user as any).userId} (${(user as any).name || 'N/A'})`);
      
      // Find binary tree
      const tree = await BinaryTree.findOne({ user: userObjId });
      if (!tree) {
        const errorMsg = `Binary tree not found for user ${userId}`;
        console.error(`   ❌ ${errorMsg}`);
        results.push({ userId, success: false, message: errorMsg, fixesApplied: 0 });
        failureCount++;
        continue;
      }
      
      console.log(`   ✅ Binary tree found`);
      
      // Get current values for comparison
      const currentValues: any = {
        leftBusiness: parseFloat(tree.leftBusiness?.toString() || "0"),
        rightBusiness: parseFloat(tree.rightBusiness?.toString() || "0"),
        leftDownlines: tree.leftDownlines || 0,
        rightDownlines: tree.rightDownlines || 0,
      };
      
      console.log(`   📊 Current values:`);
      console.log(`      Left Business: $${currentValues.leftBusiness.toFixed(2)}`);
      console.log(`      Right Business: $${currentValues.rightBusiness.toFixed(2)}`);
      console.log(`      Left Downlines: ${currentValues.leftDownlines}`);
      console.log(`      Right Downlines: ${currentValues.rightDownlines}`);
      
      // Apply all fixes for this user
      let fixesApplied = 0;
      for (const fix of userFixes) {
        const currentValue = currentValues[fix.field];
        const newValue = fix.value;
        
        if (Math.abs(currentValue - newValue) < 0.01) {
          console.log(`   ⏭️  Skipping ${fix.field}: Already correct (${currentValue})`);
          continue;
        }
        
        fixesApplied++;
        console.log(`   🔄 Updating ${fix.field}: ${currentValue} → ${newValue}`);
        
        if (fix.field === "leftBusiness" || fix.field === "rightBusiness") {
          // Update business volume (Decimal128)
          (tree as any)[fix.field] = Types.Decimal128.fromString(newValue.toString());
        } else {
          // Update downline count (number)
          (tree as any)[fix.field] = newValue;
        }
      }
      
      if (fixesApplied > 0) {
        // Save changes
        await tree.save();
        console.log(`   ✅ Successfully applied ${fixesApplied} fix(es) for ${userId}`);
        
        // Show new values
        const updatedTree = await BinaryTree.findOne({ user: userObjId }).lean();
        if (updatedTree) {
          console.log(`   📊 Updated values:`);
          console.log(`      Left Business: $${parseFloat(updatedTree.leftBusiness?.toString() || "0").toFixed(2)}`);
          console.log(`      Right Business: $${parseFloat(updatedTree.rightBusiness?.toString() || "0").toFixed(2)}`);
          console.log(`      Left Downlines: ${updatedTree.leftDownlines || 0}`);
          console.log(`      Right Downlines: ${updatedTree.rightDownlines || 0}`);
        }
        
        totalFixesApplied += fixesApplied;
        results.push({ userId, success: true, message: `Successfully applied ${fixesApplied} fix(es)`, fixesApplied });
        successCount++;
      } else {
        console.log(`   ℹ️  No changes needed for ${userId} (all values already correct)`);
        results.push({ userId, success: true, message: "No changes needed (already correct)", fixesApplied: 0 });
        successCount++;
      }
    } catch (error: any) {
      const errorMsg = `Error fixing ${userId}: ${error.message}`;
      console.error(`   ❌ ${errorMsg}`);
      console.error(`   Stack: ${error.stack}`);
      results.push({ userId, success: false, message: errorMsg, fixesApplied: 0 });
      failureCount++;
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(100)}`);
  console.log(`📊 FIX SUMMARY`);
  console.log(`${'='.repeat(100)}\n`);
  
  console.log(`Total fixes in report: ${fixes.length}`);
  console.log(`Users processed: ${fixesByUser.size}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`🔧 Total fixes applied: ${totalFixesApplied}\n`);
  
  if (failureCount > 0) {
    console.log(`❌ Failed fixes:`);
    results.filter(r => !r.success).forEach((result) => {
      console.log(`   - ${result.userId}: ${result.message}`);
    });
    console.log();
  }
  
  if (successCount > 0) {
    console.log(`✅ Successfully fixed:`);
    const successful = results.filter(r => r.success && r.fixesApplied > 0);
    successful.forEach((result) => {
      console.log(`   - ${result.userId}: ${result.message}`);
    });
    console.log();
  }
  
  console.log(`\n${'='.repeat(100)}\n`);
  
  return { successCount, failureCount, totalFixesApplied, results };
}

async function main() {
  const reportPath = process.argv[2];
  
  if (!reportPath) {
    console.error("❌ Error: Report file path required");
    console.error("Usage: npx ts-node -r dotenv/config src/scripts/fixBinaryTreeFromReport.ts <report-file-path>");
    console.error("Example: npx ts-node -r dotenv/config src/scripts/fixBinaryTreeFromReport.ts diagnostic-reports/binary-tree-diagnostic-BIGBULL-000106-2026-02-06T12-34-47-575Z.txt");
    process.exit(1);
  }
  
  // Resolve path (can be relative or absolute)
  const fullReportPath = path.isAbsolute(reportPath) 
    ? reportPath 
    : path.join(__dirname, '../../', reportPath);
  
  if (!fs.existsSync(fullReportPath)) {
    console.error(`❌ Error: Report file not found: ${fullReportPath}`);
    process.exit(1);
  }
  
  try {
    await connectDB();
    
    console.log(`\n⚠️  WARNING: This script will modify binary tree data in the database!`);
    console.log(`   Report file: ${fullReportPath}\n`);
    
    const result = await applyFixesFromReport(fullReportPath);
    
    await disconnectDB();
    
    if (!result) {
      console.log(`⚠️  No fixes were applied.\n`);
      process.exit(0);
    }
    
    if (result.failureCount > 0) {
      console.log(`⚠️  Some fixes failed. Please review the errors above.\n`);
      process.exit(1);
    } else {
      console.log(`✅ All fixes applied successfully!\n`);
    }
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

export { applyFixesFromReport, parseReportFile };
