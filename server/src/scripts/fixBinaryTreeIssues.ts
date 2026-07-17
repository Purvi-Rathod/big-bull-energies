/**
 * Fix Binary Tree Issues Script
 * 
 * Automatically fixes all issues found in the diagnostic report by updating
 * binary tree records with correct business volumes and downline counts.
 * 
 * Usage: npx ts-node -r dotenv/config src/scripts/fixBinaryTreeIssues.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Types } from "mongoose";
import * as path from "path";
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

// All fixes from the diagnostic report
const fixes: FixAction[] = [
  // BIGBULL-000282
  { userId: "BIGBULL-000282", field: "rightBusiness", value: 200.00, description: "Update rightBusiness to 200.00" },
  { userId: "BIGBULL-000282", field: "leftDownlines", value: 26, description: "Update leftDownlines to 26" },
  { userId: "BIGBULL-000282", field: "rightDownlines", value: 7, description: "Update rightDownlines to 7" },
  
  // BIGBULL-000483
  { userId: "BIGBULL-000483", field: "rightBusiness", value: 100.00, description: "Update rightBusiness to 100.00" },
  
  // BIGBULL-000288
  { userId: "BIGBULL-000288", field: "leftDownlines", value: 1, description: "Update leftDownlines to 1" },
  { userId: "BIGBULL-000288", field: "rightDownlines", value: 6, description: "Update rightDownlines to 6" },
  
  // BIGBULL-000549
  { userId: "BIGBULL-000549", field: "rightBusiness", value: 0.00, description: "Update rightBusiness to 0.00" },
  
  // BIGBULL-000414
  { userId: "BIGBULL-000414", field: "leftDownlines", value: 13, description: "Update leftDownlines to 13" },
  { userId: "BIGBULL-000414", field: "rightDownlines", value: 0, description: "Update rightDownlines to 0" },
  
  // BIGBULL-000550
  { userId: "BIGBULL-000550", field: "rightBusiness", value: 0.00, description: "Update rightBusiness to 0.00" },
  { userId: "BIGBULL-000550", field: "leftDownlines", value: 0, description: "Update leftDownlines to 0" },
  { userId: "BIGBULL-000550", field: "rightDownlines", value: 3, description: "Update rightDownlines to 3" },
];

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

async function applyFixes() {
  console.log(`\n${'='.repeat(100)}`);
  console.log(`🔧 FIXING BINARY TREE ISSUES`);
  console.log(`${'='.repeat(100)}\n`);
  
  console.log(`📋 Total fixes to apply: ${fixes.length}\n`);
  
  const results: Array<{ userId: string; success: boolean; message: string }> = [];
  let successCount = 0;
  let failureCount = 0;
  
  // Group fixes by user for better logging
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
    userFixes.forEach((fix) => {
      console.log(`      - ${fix.description}`);
    });
  });
  console.log();
  
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
        results.push({ userId, success: false, message: errorMsg });
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
        results.push({ userId, success: false, message: errorMsg });
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
      let hasChanges = false;
      for (const fix of userFixes) {
        const currentValue = currentValues[fix.field];
        const newValue = fix.value;
        
        if (Math.abs(currentValue - newValue) < 0.01) {
          console.log(`   ⏭️  Skipping ${fix.field}: Already correct (${currentValue})`);
          continue;
        }
        
        hasChanges = true;
        console.log(`   🔄 Updating ${fix.field}: ${currentValue} → ${newValue}`);
        
        if (fix.field === "leftBusiness" || fix.field === "rightBusiness") {
          // Update business volume (Decimal128)
          (tree as any)[fix.field] = Types.Decimal128.fromString(newValue.toString());
        } else {
          // Update downline count (number)
          (tree as any)[fix.field] = newValue;
        }
      }
      
      if (hasChanges) {
        // Save changes
        await tree.save();
        console.log(`   ✅ Successfully updated binary tree for ${userId}`);
        
        // Show new values
        const updatedTree = await BinaryTree.findOne({ user: userObjId }).lean();
        if (updatedTree) {
          console.log(`   📊 Updated values:`);
          console.log(`      Left Business: $${parseFloat(updatedTree.leftBusiness?.toString() || "0").toFixed(2)}`);
          console.log(`      Right Business: $${parseFloat(updatedTree.rightBusiness?.toString() || "0").toFixed(2)}`);
          console.log(`      Left Downlines: ${updatedTree.leftDownlines || 0}`);
          console.log(`      Right Downlines: ${updatedTree.rightDownlines || 0}`);
        }
        
        results.push({ userId, success: true, message: `Successfully applied ${userFixes.length} fix(es)` });
        successCount++;
      } else {
        console.log(`   ℹ️  No changes needed for ${userId}`);
        results.push({ userId, success: true, message: "No changes needed (already correct)" });
        successCount++;
      }
    } catch (error: any) {
      const errorMsg = `Error fixing ${userId}: ${error.message}`;
      console.error(`   ❌ ${errorMsg}`);
      console.error(`   Stack: ${error.stack}`);
      results.push({ userId, success: false, message: errorMsg });
      failureCount++;
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(100)}`);
  console.log(`📊 FIX SUMMARY`);
  console.log(`${'='.repeat(100)}\n`);
  
  console.log(`Total fixes attempted: ${fixes.length}`);
  console.log(`Users processed: ${fixesByUser.size}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}\n`);
  
  if (failureCount > 0) {
    console.log(`❌ Failed fixes:`);
    results.filter(r => !r.success).forEach((result) => {
      console.log(`   - ${result.userId}: ${result.message}`);
    });
    console.log();
  }
  
  if (successCount > 0) {
    console.log(`✅ Successfully fixed:`);
    results.filter(r => r.success).forEach((result) => {
      console.log(`   - ${result.userId}: ${result.message}`);
    });
    console.log();
  }
  
  console.log(`\n${'='.repeat(100)}\n`);
  
  return { successCount, failureCount, results };
}

async function main() {
  try {
    await connectDB();
    
    // Confirm before applying fixes
    console.log(`\n⚠️  WARNING: This script will modify binary tree data in the database!`);
    console.log(`   Total fixes to apply: ${fixes.length}`);
    console.log(`   Users affected: ${new Set(fixes.map(f => f.userId)).size}\n`);
    
    // In a real scenario, you might want to add a confirmation prompt
    // For now, we'll proceed automatically
    
    const result = await applyFixes();
    
    await disconnectDB();
    
    if (result.failureCount > 0) {
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

export { applyFixes, fixes };
