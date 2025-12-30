/**
 * Migration Script: Update User IDs from CROWN-XXXXXX to CNEOX-XXXXXX
 * 
 * This script migrates all existing user IDs in the database from the old format
 * (CROWN-XXXXXX) to the new format (CNEOX-XXXXXX).
 * 
 * Usage:
 *   npx ts-node -r dotenv/config src/scripts/migrateUserIdCrownToCneox.ts
 * 
 * IMPORTANT: 
 * - Backup your database before running this script
 * - This script updates the User collection
 * - It also updates any references in other collections if needed
 */

import mongoose from "mongoose";
import { User } from "../models/User";
import { BinaryTree } from "../models/BinaryTree";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "./.env" });

/**
 * Main migration function
 */
async function migrateUserIds() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URL_DEVELOPMENT || process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URL_DEVELOPMENT, MONGODB_URI, or MONGO_URI environment variable is required");
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Find all users with CROWN- prefix
    console.log("📋 Finding all users with CROWN- prefix...");
    const usersToMigrate = await User.find({ userId: { $regex: /^CROWN-/ } });
    console.log(`✅ Found ${usersToMigrate.length} users to migrate\n`);

    if (usersToMigrate.length === 0) {
      console.log("ℹ️  No users found with CROWN- prefix. Migration not needed.");
      await mongoose.disconnect();
      return;
    }

    // Show preview of users to be migrated
    console.log("📊 Preview of users to be migrated:");
    usersToMigrate.slice(0, 10).forEach((user) => {
      console.log(`   - ${user.userId} (${user.name})`);
    });
    if (usersToMigrate.length > 10) {
      console.log(`   ... and ${usersToMigrate.length - 10} more users`);
    }
    console.log();

    // Migrate each user
    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ userId: string; error: string }> = [];

    console.log("🔄 Starting migration...\n");

    for (const user of usersToMigrate) {
      try {
        const oldUserId = user.userId;
        const newUserId = oldUserId.replace(/^CROWN-/, "CNEOX-");

        // Check if new userId already exists
        const existingUser = await User.findOne({ userId: newUserId });
        if (existingUser) {
          const error = `User ID ${newUserId} already exists. Skipping ${oldUserId}`;
          console.log(`⚠️  ${error}`);
          errors.push({ userId: oldUserId, error });
          errorCount++;
          continue;
        }

        // Update user document
        user.userId = newUserId;
        await user.save();

        console.log(`✅ Migrated: ${oldUserId} → ${newUserId}`);
        successCount++;

        // Update BinaryTree references if needed
        // Note: BinaryTree stores user as ObjectId, so no direct update needed
        // But we should verify the tree structure is intact
      } catch (error: any) {
        const errorMsg = error.message || "Unknown error";
        console.log(`❌ Error migrating ${user.userId}: ${errorMsg}`);
        errors.push({ userId: user.userId, error: errorMsg });
        errorCount++;
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary:");
    console.log("=".repeat(60));
    console.log(`✅ Successfully migrated: ${successCount} users`);
    console.log(`❌ Failed to migrate: ${errorCount} users`);
    console.log(`📝 Total users processed: ${usersToMigrate.length}`);

    if (errors.length > 0) {
      console.log("\n⚠️  Errors encountered:");
      errors.forEach(({ userId, error }) => {
        console.log(`   - ${userId}: ${error}`);
      });
    }

    // Verify migration
    console.log("\n🔍 Verifying migration...");
    const remainingCrownUsers = await User.find({ userId: { $regex: /^CROWN-/ } });
    const cneoxUsers = await User.find({ userId: { $regex: /^CNEOX-/ } });

    console.log(`   Remaining CROWN- users: ${remainingCrownUsers.length}`);
    console.log(`   Total CNEOX- users: ${cneoxUsers.length}`);

    if (remainingCrownUsers.length === 0) {
      console.log("\n✅ Migration completed successfully! All users have been migrated.");
    } else {
      console.log(`\n⚠️  Warning: ${remainingCrownUsers.length} users still have CROWN- prefix.`);
      console.log("   Please review the errors above and run the migration again if needed.");
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  } catch (error: any) {
    console.error("\n❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  migrateUserIds()
    .then(() => {
      console.log("\n✅ Migration script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Migration script failed:", error);
      process.exit(1);
    });
}

export { migrateUserIds };

