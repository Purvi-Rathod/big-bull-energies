/**
 * Reset Admin Password Script
 * 
 * This script resets the admin user (BIGBULL-000000) password to "admin@123"
 * 
 * Usage: npm run reset:admin-password
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/User";
import connectdb from "../db/index";

// Load environment variables
dotenv.config({ path: "./.env" });

async function resetAdminPassword() {
  try {
    console.log("🔐 Resetting admin password...");
    
    // Connect to database
    await connectdb();
    console.log("✅ Connected to database");
    
    // Find admin user
    const admin = await User.findOne({ userId: "BIGBULL-000000" });
    
    if (!admin) {
      console.error("❌ Admin user (BIGBULL-000000) not found!");
      process.exit(1);
    }
    
    // Reset password (will be hashed by pre-save hook)
    admin.password = "admin@123";
    await admin.save();
    
    console.log("✅ Admin password reset successfully!");
    console.log(`   User ID: ${admin.userId}`);
    console.log(`   Name: ${admin.name || "N/A"}`);
    console.log(`   Email: ${admin.email || "N/A"}`);
    console.log(`   New Password: admin@123`);
    
    // Close database connection
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting admin password:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
resetAdminPassword();

