/**
 * Verification Script: Parent vs Referrer Mismatch
 * 
 * This script verifies the bug where:
 * - User BIGBULL-000014 was created with referrer BIGBULL-000001
 * - But the BinaryTree parent shows BIGBULL-000012
 * 
 * Usage: npx ts-node -r dotenv/config src/scripts/verifyParentReferrerMismatch.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User";
import { BinaryTree } from "../models/BinaryTree";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URL_DEVELOPMENT || process.env.MONGODB_URI || "mongodb://localhost:27017/binary_system";

async function verifyParentReferrerMismatch() {
  try {
    console.log("🔍 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find user BIGBULL-000014
    const user = await User.findOne({ userId: "BIGBULL-000014" })
      .populate("referrer", "userId name")
      .lean();

    if (!user) {
      console.log("❌ User BIGBULL-000014 not found");
      await mongoose.disconnect();
      return;
    }

    console.log("📋 User Information:");
    console.log(`   User ID: ${user.userId}`);
    console.log(`   Name: ${user.name || "N/A"}`);
    console.log(`   Referrer (from User model): ${(user.referrer as any)?.userId || "None"} (${(user.referrer as any)?.name || "N/A"})`);
    console.log();

    // Find binary tree entry
    const binaryTree = await BinaryTree.findOne({ user: user._id })
      .populate("parent", "userId name")
      .lean();

    if (!binaryTree) {
      console.log("❌ Binary tree entry not found for BIGBULL-000014");
      await mongoose.disconnect();
      return;
    }

    console.log("🌳 Binary Tree Information:");
    console.log(`   Parent (from BinaryTree model): ${(binaryTree.parent as any)?.userId || "None"} (${(binaryTree.parent as any)?.name || "N/A"})`);
    console.log(`   Left Child: ${binaryTree.leftChild || "None"}`);
    console.log(`   Right Child: ${binaryTree.rightChild || "None"}`);
    console.log();

    // Check for mismatch
    const referrerId = (user.referrer as any)?._id?.toString();
    const parentId = (binaryTree.parent as any)?._id?.toString();

    console.log("🔎 Verification Results:");
    if (referrerId && parentId && referrerId !== parentId) {
      console.log("❌ MISMATCH DETECTED!");
      console.log(`   Referrer ID: ${referrerId} (${(user.referrer as any)?.userId})`);
      console.log(`   Parent ID: ${parentId} (${(binaryTree.parent as any)?.userId})`);
      console.log();
      console.log("💡 Issue: The BinaryTree parent does not match the User referrer.");
      console.log("   This happens when the referrer's left/right positions are full,");
      console.log("   and the system places the user under a different parent in the tree.");
    } else if (referrerId && parentId && referrerId === parentId) {
      console.log("✅ MATCH: Referrer and Parent are the same");
    } else if (!referrerId && !parentId) {
      console.log("⚠️  No referrer or parent set");
    } else {
      console.log("⚠️  Partial data: One is missing");
    }

    // Also check the path from BIGBULL-000001 to BIGBULL-000014
    console.log();
    console.log("🔗 Tracing path from BIGBULL-000001 to BIGBULL-000014:");
    const rootUser = await User.findOne({ userId: "BIGBULL-000001" }).lean();
    if (rootUser) {
      let currentUserId = rootUser._id;
      const path: string[] = ["BIGBULL-000001"];
      
      // Traverse down to find BIGBULL-000014
      let found = false;
      let depth = 0;
      const maxDepth = 10;
      
      while (currentUserId && depth < maxDepth) {
        const currentTree = await BinaryTree.findOne({ user: currentUserId })
          .populate("leftChild", "userId")
          .populate("rightChild", "userId")
          .lean();
        
        if (!currentTree) break;
        
        // Check left child
        if (currentTree.leftChild) {
          const leftChildUser = await User.findById((currentTree.leftChild as any)._id || currentTree.leftChild)
            .select("userId")
            .lean();
          if (leftChildUser?.userId === "BIGBULL-000014") {
            path.push("BIGBULL-000014 (via left)");
            found = true;
            break;
          }
        }
        
        // Check right child
        if (currentTree.rightChild) {
          const rightChildUser = await User.findById((currentTree.rightChild as any)._id || currentTree.rightChild)
            .select("userId")
            .lean();
          if (rightChildUser?.userId === "BIGBULL-000014") {
            path.push("BIGBULL-000014 (via right)");
            found = true;
            break;
          }
        }
        
        // Go to next level (for simplicity, check left first)
        if (currentTree.leftChild) {
          currentUserId = (currentTree.leftChild as any)._id || currentTree.leftChild;
          const nextUser = await User.findById(currentUserId).select("userId").lean();
          if (nextUser) path.push(nextUser.userId || "Unknown");
        } else if (currentTree.rightChild) {
          currentUserId = (currentTree.rightChild as any)._id || currentTree.rightChild;
          const nextUser = await User.findById(currentUserId).select("userId").lean();
          if (nextUser) path.push(nextUser.userId || "Unknown");
        } else {
          break;
        }
        
        depth++;
      }
      
      if (found) {
        console.log(`   Path: ${path.join(" -> ")}`);
      } else {
        console.log("   Could not find direct path (user may be deeper in tree)");
      }
    }

    await mongoose.disconnect();
    console.log("\n✅ Verification complete");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

verifyParentReferrerMismatch();
