/**
 * Test script to measure signup performance
 * Run with: npx ts-node src/scripts/testSignupPerformance.ts
 */

import mongoose from "mongoose";
import { User } from "../models/User";
import { userSignup } from "../controllers/auth.controller";
import { findUserByUserId } from "../services/userId.service";

// Use the same MongoDB URI as the server
const MONGODB_URI = process.env.MONGODB_URL_DEVELOPMENT || process.env.MONGODB_URI || process.env.MONGODB_URL_PRODUCTION || "mongodb://localhost:27017/crown-bankers";

async function testSignupPerformance() {
  try {
    if (!MONGODB_URI || MONGODB_URI === "mongodb://localhost:27017/crown-bankers") {
      console.log("⚠️  Using default MongoDB URI. Make sure MongoDB is running locally.");
      console.log("   Or set MONGODB_URL_DEVELOPMENT in your .env file\n");
    }
    
    console.log("🔌 Connecting to MongoDB...");
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/.*@/, "//***@")}\n`);
    
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("✅ Connected to MongoDB\n");
    } catch (error: any) {
      console.error("❌ Failed to connect to MongoDB!");
      console.error(`   Error: ${error.message}`);
      console.error("\n💡 Solutions:");
      console.error("   1. Make sure MongoDB is running:");
      console.error("      - Local: brew services start mongodb-community");
      console.error("      - Docker: docker-compose up -d mongodb");
      console.error("   2. Check your .env file has MONGODB_URL_DEVELOPMENT set");
      console.error("   3. Verify MongoDB connection string is correct");
      console.error(`\n   Current URI: ${MONGODB_URI.replace(/\/\/.*@/, "//***@")}`);
      throw error;
    }

    // Find a test referrer
    const referrer = await findUserByUserId("CROWN-000071");
    if (!referrer) {
      console.error("❌ Referrer CROWN-000071 not found. Please ensure test data exists.");
      process.exit(1);
    }

    console.log(`📊 Testing signup with referrer: ${referrer.userId}`);
    console.log("⏱️  Starting performance test...\n");

    const testData = {
      name: `Test User ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      phone: `123456789${Date.now().toString().slice(-4)}`,
      password: "Test@123456",
      country: "US",
      referrerUserId: "CROWN-000071",
      position: "left" as const,
    };

    // Mock request/response objects
    let responseStatus = 0;
    let responseData: any = null;
    let responseSent = false;

    const mockReq = {
      body: testData,
    } as any;

    // Wrap in Promise to handle async middleware execution
    const signupPromise = new Promise<void>((resolve, reject) => {
      const mockRes = {
        status: (code: number) => {
          responseStatus = code;
          return {
            json: (data: any) => {
              responseData = data;
              responseSent = true;
              console.log(`✅ Response status: ${code}`);
              resolve(); // Resolve when response is sent
              return mockRes;
            },
          };
        },
        cookie: () => mockRes,
      } as any;

      // Mock next function (required by asyncHandler)
      // asyncHandler catches errors and calls next(error)
      const mockNext = (error?: any) => {
        if (error) {
          reject(error); // Reject on error
        }
        // Note: If no error, middleware might not call next() at all
        // So we rely on res.json() to resolve the promise
      };

      // Call the middleware function (userSignup is wrapped with asyncHandler)
      const middleware = userSignup as any;
      middleware(mockReq, mockRes, mockNext);
    });

    // Measure time
    const startTime = Date.now();
    
    try {
      await signupPromise;
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`\n⏱️  Total signup time: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
      
      if (duration > 5000) {
        console.log("⚠️  WARNING: Signup took more than 5 seconds!");
      } else if (duration > 3000) {
        console.log("⚠️  WARNING: Signup took more than 3 seconds!");
      } else {
        console.log("✅ Signup performance is acceptable");
      }
    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.error(`\n❌ Error after ${duration}ms:`, error.message);
      throw error;
    }

    // Cleanup - delete test user
    const testUser = await User.findOne({ email: testData.email });
    if (testUser) {
      await User.findByIdAndDelete(testUser._id);
      console.log("🧹 Cleaned up test user");
    }

    await mongoose.disconnect();
    console.log("\n✅ Test completed");
  } catch (error) {
    console.error("❌ Test failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testSignupPerformance();
