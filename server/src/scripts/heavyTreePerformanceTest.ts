/**
 * Comprehensive Performance Test for Heavy Tree Signup
 * 
 * This script tests signup performance with a heavy tree structure:
 * - Root user (User A) with 10 left and 10 right children
 * - Tests signups at different depths
 * - Tests concurrent signups to find peak performance
 * - Measures API response times and system constraints
 * 
 * Run with: npx ts-node src/scripts/heavyTreePerformanceTest.ts
 */

import mongoose from "mongoose";
import { User } from "../models/User";
import { BinaryTree } from "../models/BinaryTree";
import { userSignup } from "../controllers/auth.controller";
import { findUserByUserId } from "../services/userId.service";
import os from "os";

// Use the same MongoDB URI as the server
const MONGODB_URI = process.env.MONGODB_URL_DEVELOPMENT || process.env.MONGODB_URI || process.env.MONGODB_URL_PRODUCTION || "mongodb://localhost:27017/crown-bankers";

interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p50: number; // Median
  p95: number; // 95th percentile
  p99: number; // 99th percentile
  requestsPerSecond: number;
  errorRate: number;
  responseTimes: number[];
}

interface SystemMetrics {
  cpuUsage: NodeJS.CpuUsage;
  memoryUsage: NodeJS.MemoryUsage;
  timestamp: number;
}

class PerformanceTestSuite {
  private rootUserId: string = "";
  private createdUserIds: string[] = [];
  private systemMetrics: SystemMetrics[] = [];

  async connectDB() {
    try {
      if (!MONGODB_URI || MONGODB_URI === "mongodb://localhost:27017/crown-bankers") {
        console.log("⚠️  Using default MongoDB URI. Make sure MongoDB is running locally.");
        console.log("   Or set MONGODB_URL_DEVELOPMENT in your .env file\n");
      }
      
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

  async disconnectDB() {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }

  recordSystemMetrics() {
    const cpuUsage = process.cpuUsage();
    const memoryUsage = process.memoryUsage();
    this.systemMetrics.push({
      cpuUsage,
      memoryUsage,
      timestamp: Date.now(),
    });
  }

  getSystemInfo() {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    
    return {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
      freeMemory: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
      processMemory: {
        rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`,
      },
    };
  }

  calculatePercentile(sortedArray: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }

  calculateMetrics(responseTimes: number[], totalTime: number): PerformanceMetrics {
    const sorted = [...responseTimes].sort((a, b) => a - b);
    const successful = responseTimes.length;
    const failed = 0; // We'll track this separately
    
    return {
      totalRequests: responseTimes.length,
      successfulRequests: successful,
      failedRequests: failed,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      p50: this.calculatePercentile(sorted, 50),
      p95: this.calculatePercentile(sorted, 95),
      p99: this.calculatePercentile(sorted, 99),
      requestsPerSecond: (responseTimes.length / (totalTime / 1000)),
      errorRate: 0,
      responseTimes: sorted,
    };
  }

  async createTestUser(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    referrerUserId?: string;
    position?: "left" | "right";
  }): Promise<{ duration: number; success: boolean; error?: string }> {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;

    try {
      const mockReq = {
        body: userData,
      } as any;

      await new Promise<void>((resolve, reject) => {
        const mockRes = {
          status: (code: number) => {
            return {
              json: (data: any) => {
                if (code >= 200 && code < 300) {
                  success = true;
                  if (data.data?.user?.userId) {
                    this.createdUserIds.push(data.data.user.userId);
                  }
                } else {
                  error = data.message || `HTTP ${code}`;
                }
                resolve();
                return mockRes;
              },
            };
          },
          cookie: () => mockRes,
        } as any;

        const mockNext = (err?: any) => {
          if (err) {
            error = err.message || String(err);
            reject(err);
          }
        };

        const middleware = userSignup as any;
        middleware(mockReq, mockRes, mockNext);
      });

      const duration = Date.now() - startTime;
      return { duration, success, error };
    } catch (err: any) {
      const duration = Date.now() - startTime;
      error = err.message || String(err);
      return { duration, success: false, error };
    }
  }

  async buildHeavyTree() {
    console.log("🌳 Building Heavy Tree Structure...");
    console.log("   Root user will have 10 left and 10 right children\n");

    // Find or create root user (User A)
    let rootUser = await findUserByUserId("BIGBULL-000071");
    if (!rootUser) {
      console.log("⚠️  Root user BIGBULL-000071 not found. Creating test root user...");
      
      // Create root user
      const rootData = {
        name: "Root User A",
        email: `root${Date.now()}@test.com`,
        phone: `1000000000`,
        password: "Test@123456",
      };

      const result = await this.createTestUser(rootData);
      if (!result.success) {
        throw new Error(`Failed to create root user: ${result.error}`);
      }

      // Find the created user
      rootUser = await User.findOne({ email: rootData.email });
      if (!rootUser) {
        throw new Error("Root user was created but not found");
      }
      
      this.rootUserId = rootUser.userId;
      console.log(`✅ Created root user: ${this.rootUserId}\n`);
    } else {
      this.rootUserId = rootUser.userId;
      console.log(`✅ Using existing root user: ${this.rootUserId}\n`);
    }

    // Check existing tree structure
    const rootTree = await BinaryTree.findOne({ user: rootUser._id });
    if (rootTree) {
      const leftCount = rootTree.leftDownlines || 0;
      const rightCount = rootTree.rightDownlines || 0;
      console.log(`📊 Current tree structure:`);
      console.log(`   Left children: ${leftCount}`);
      console.log(`   Right children: ${rightCount}\n`);

      if (leftCount >= 10 && rightCount >= 10) {
        console.log("✅ Tree already has 10+ left and 10+ right children\n");
        return;
      }
    }

    // Build left side (10 users)
    console.log("📝 Creating 10 left children...");
    const leftPromises: Promise<any>[] = [];
    for (let i = 0; i < 10; i++) {
      const userData = {
        name: `Left Child ${i + 1}`,
        email: `left${i + 1}_${Date.now()}@test.com`,
        phone: `200000000${i}`,
        password: "Test@123456",
        referrerUserId: this.rootUserId,
        position: "left" as const,
      };
      leftPromises.push(this.createTestUser(userData));
    }

    const leftResults = await Promise.all(leftPromises);
    const leftSuccess = leftResults.filter(r => r.success).length;
    console.log(`   ✅ Created ${leftSuccess}/10 left children\n`);

    // Build right side (10 users)
    console.log("📝 Creating 10 right children...");
    const rightPromises: Promise<any>[] = [];
    for (let i = 0; i < 10; i++) {
      const userData = {
        name: `Right Child ${i + 1}`,
        email: `right${i + 1}_${Date.now()}@test.com`,
        phone: `300000000${i}`,
        password: "Test@123456",
        referrerUserId: this.rootUserId,
        position: "right" as const,
      };
      rightPromises.push(this.createTestUser(userData));
    }

    const rightResults = await Promise.all(rightPromises);
    const rightSuccess = rightResults.filter(r => r.success).length;
    console.log(`   ✅ Created ${rightSuccess}/10 right children\n`);

    // Verify tree structure
    const updatedTree = await BinaryTree.findOne({ user: rootUser._id });
    if (updatedTree) {
      console.log(`📊 Final tree structure:`);
      console.log(`   Left children: ${updatedTree.leftDownlines || 0}`);
      console.log(`   Right children: ${updatedTree.rightDownlines || 0}\n`);
    }
  }

  async testSingleSignup(depth: number, position: "left" | "right"): Promise<PerformanceMetrics> {
    console.log(`\n🧪 Test: Single Signup at Depth ${depth}, Position: ${position}`);
    console.log("=" .repeat(60));

    // Find a referrer at the specified depth
    let referrer = await findUserByUserId(this.rootUserId);
    let currentDepth = 0;

    while (currentDepth < depth && referrer) {
      const tree = await BinaryTree.findOne({ user: referrer._id });
      if (!tree) break;

      const childId = position === "left" ? tree.leftChild : tree.rightChild;
      if (!childId) break;

      referrer = await User.findById(childId);
      if (!referrer) break;
      currentDepth++;
    }

    if (!referrer || currentDepth < depth) {
      throw new Error(`Could not find referrer at depth ${depth}`);
    }

    const userData = {
      name: `Test User Depth ${depth}`,
      email: `test_depth_${depth}_${Date.now()}@test.com`,
      phone: `400000000${depth}`,
      password: "Test@123456",
      referrerUserId: referrer.userId,
      position: position,
    };

    this.recordSystemMetrics();
    const startTime = Date.now();
    const result = await this.createTestUser(userData);
    const endTime = Date.now();
    this.recordSystemMetrics();

    const metrics: PerformanceMetrics = {
      totalRequests: 1,
      successfulRequests: result.success ? 1 : 0,
      failedRequests: result.success ? 0 : 1,
      averageResponseTime: result.duration,
      minResponseTime: result.duration,
      maxResponseTime: result.duration,
      p50: result.duration,
      p95: result.duration,
      p99: result.duration,
      requestsPerSecond: 1 / (result.duration / 1000),
      errorRate: result.success ? 0 : 100,
      responseTimes: [result.duration],
    };

    console.log(`⏱️  Response Time: ${result.duration}ms (${(result.duration / 1000).toFixed(2)}s)`);
    console.log(`📊 Status: ${result.success ? "✅ Success" : "❌ Failed"}`);
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    }

    return metrics;
  }

  async testConcurrentSignups(concurrency: number, totalUsers: number): Promise<PerformanceMetrics> {
    console.log(`\n🧪 Test: Concurrent Signups`);
    console.log(`   Concurrency: ${concurrency} simultaneous requests`);
    console.log(`   Total Users: ${totalUsers}`);
    console.log("=" .repeat(60));

    // Get root user for referrer
    const rootUser = await findUserByUserId(this.rootUserId);
    if (!rootUser) {
      throw new Error("Root user not found");
    }

    const responseTimes: number[] = [];
    const errors: string[] = [];
    let completed = 0;

    this.recordSystemMetrics();
    const testStartTime = Date.now();

    // Create batches of concurrent requests
    for (let batch = 0; batch < Math.ceil(totalUsers / concurrency); batch++) {
      const batchStart = batch * concurrency;
      const batchEnd = Math.min(batchStart + concurrency, totalUsers);
      const batchSize = batchEnd - batchStart;

      console.log(`\n📦 Batch ${batch + 1}: Creating ${batchSize} users concurrently...`);

      const batchPromises: Promise<{ duration: number; success: boolean; error?: string }>[] = [];

      for (let i = batchStart; i < batchEnd; i++) {
        const userData = {
          name: `Concurrent User ${i + 1}`,
          email: `concurrent_${i + 1}_${Date.now()}_${Math.random()}@test.com`,
          phone: `500000000${i}`,
          password: "Test@123456",
          referrerUserId: this.rootUserId,
          position: (i % 2 === 0 ? "left" : "right") as "left" | "right",
        };

        batchPromises.push(this.createTestUser(userData));
      }

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach((result, idx) => {
        responseTimes.push(result.duration);
        completed++;
        
        if (!result.success) {
          errors.push(`User ${batchStart + idx + 1}: ${result.error || "Unknown error"}`);
        }

        if (completed % 10 === 0 || completed === totalUsers) {
          process.stdout.write(`\r   Progress: ${completed}/${totalUsers} (${((completed / totalUsers) * 100).toFixed(1)}%)`);
        }
      });

      // Small delay between batches to avoid overwhelming the system
      if (batch < Math.ceil(totalUsers / concurrency) - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const testEndTime = Date.now();
    const totalTime = testEndTime - testStartTime;
    this.recordSystemMetrics();

    console.log(`\n\n📊 Test Results:`);
    console.log(`   Total Time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
    console.log(`   Completed: ${completed}/${totalUsers}`);

    const metrics = this.calculateMetrics(responseTimes, totalTime);
    metrics.failedRequests = errors.length;
    metrics.errorRate = (errors.length / totalUsers) * 100;

    if (errors.length > 0) {
      console.log(`\n❌ Errors (showing first 10):`);
      errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
      if (errors.length > 10) {
        console.log(`   ... and ${errors.length - 10} more errors`);
      }
    }

    return metrics;
  }

  printMetrics(metrics: PerformanceMetrics, title: string) {
    console.log(`\n${title}`);
    console.log("=" .repeat(60));
    console.log(`📊 Request Statistics:`);
    console.log(`   Total Requests: ${metrics.totalRequests}`);
    console.log(`   Successful: ${metrics.successfulRequests}`);
    console.log(`   Failed: ${metrics.failedRequests}`);
    console.log(`   Error Rate: ${metrics.errorRate.toFixed(2)}%`);
    console.log(`\n⏱️  Response Time Statistics:`);
    console.log(`   Average: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`   Min: ${metrics.minResponseTime}ms`);
    console.log(`   Max: ${metrics.maxResponseTime}ms`);
    console.log(`   Median (p50): ${metrics.p50.toFixed(2)}ms`);
    console.log(`   95th Percentile (p95): ${metrics.p95.toFixed(2)}ms`);
    console.log(`   99th Percentile (p99): ${metrics.p99.toFixed(2)}ms`);
    console.log(`\n🚀 Throughput:`);
    console.log(`   Requests/Second: ${metrics.requestsPerSecond.toFixed(2)}`);
  }

  printSystemInfo() {
    const systemInfo = this.getSystemInfo();
    console.log(`\n💻 System Information:`);
    console.log("=" .repeat(60));
    console.log(`   Platform: ${systemInfo.platform} (${systemInfo.arch})`);
    console.log(`   CPUs: ${systemInfo.cpus}`);
    console.log(`   Total Memory: ${systemInfo.totalMemory}`);
    console.log(`   Free Memory: ${systemInfo.freeMemory}`);
    console.log(`\n📊 Process Memory:`);
    console.log(`   RSS: ${systemInfo.processMemory.rss}`);
    console.log(`   Heap Total: ${systemInfo.processMemory.heapTotal}`);
    console.log(`   Heap Used: ${systemInfo.processMemory.heapUsed}`);
    console.log(`   External: ${systemInfo.processMemory.external}`);
  }

  async cleanup() {
    console.log(`\n🧹 Cleaning up test users...`);
    console.log(`   Created ${this.createdUserIds.length} test users`);
    
    // Delete test users (optional - comment out if you want to keep them for inspection)
    let deleted = 0;
    for (const userId of this.createdUserIds) {
      try {
        const user = await findUserByUserId(userId);
        if (user) {
          await User.findByIdAndDelete(user._id);
          deleted++;
        }
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
    
    console.log(`   ✅ Deleted ${deleted} test users`);
    console.log(`   ⚠️  Note: Some users may remain if they're part of the tree structure`);
  }

  async runFullTestSuite() {
    try {
      await this.connectDB();
      
      this.printSystemInfo();

      // Build heavy tree structure
      await this.buildHeavyTree();

      // Test 1: Single signup at different depths
      console.log("\n\n" + "=".repeat(60));
      console.log("TEST SUITE 1: Single Signup Performance at Different Depths");
      console.log("=".repeat(60));

      const depthTests = [
        { depth: 0, position: "left" as const },
        { depth: 1, position: "left" as const },
        { depth: 2, position: "left" as const },
      ];

      const depthResults: { depth: number; metrics: PerformanceMetrics }[] = [];
      for (const test of depthTests) {
        try {
          const metrics = await this.testSingleSignup(test.depth, test.position);
          depthResults.push({ depth: test.depth, metrics });
          this.printMetrics(metrics, `\n📈 Results for Depth ${test.depth}`);
        } catch (error: any) {
          console.log(`❌ Failed to test depth ${test.depth}: ${error.message}`);
        }
      }

      // Test 2: Concurrent signups with different concurrency levels
      console.log("\n\n" + "=".repeat(60));
      console.log("TEST SUITE 2: Concurrent Signup Performance");
      console.log("=".repeat(60));

      const concurrencyTests = [
        { concurrency: 1, totalUsers: 5 },
        { concurrency: 5, totalUsers: 20 },
        { concurrency: 10, totalUsers: 50 },
        { concurrency: 20, totalUsers: 100 },
      ];

      const concurrencyResults: { concurrency: number; metrics: PerformanceMetrics }[] = [];
      for (const test of concurrencyTests) {
        try {
          const metrics = await this.testConcurrentSignups(test.concurrency, test.totalUsers);
          concurrencyResults.push({ concurrency: test.concurrency, metrics });
          this.printMetrics(metrics, `\n📈 Results for Concurrency ${test.concurrency}`);
          
          // Wait a bit between tests to let the system recover
          console.log("\n⏳ Waiting 2 seconds before next test...");
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error: any) {
          console.log(`❌ Failed concurrency test ${test.concurrency}: ${error.message}`);
        }
      }

      // Summary Report
      console.log("\n\n" + "=".repeat(60));
      console.log("📊 PERFORMANCE TEST SUMMARY");
      console.log("=".repeat(60));

      if (depthResults.length > 0) {
        console.log("\n📈 Single Signup Performance by Depth:");
        depthResults.forEach(({ depth, metrics }) => {
          console.log(`   Depth ${depth}: ${metrics.averageResponseTime.toFixed(2)}ms (p95: ${metrics.p95.toFixed(2)}ms)`);
        });
      }

      if (concurrencyResults.length > 0) {
        console.log("\n📈 Concurrent Signup Performance:");
        concurrencyResults.forEach(({ concurrency, metrics }) => {
          console.log(`   Concurrency ${concurrency}:`);
          console.log(`      Avg Response: ${metrics.averageResponseTime.toFixed(2)}ms`);
          console.log(`      p95 Response: ${metrics.p95.toFixed(2)}ms`);
          console.log(`      Throughput: ${metrics.requestsPerSecond.toFixed(2)} req/s`);
          console.log(`      Error Rate: ${metrics.errorRate.toFixed(2)}%`);
        });
      }

      // Find peak performance constraints
      console.log("\n\n" + "=".repeat(60));
      console.log("🎯 PEAK PERFORMANCE ANALYSIS");
      console.log("=".repeat(60));

      if (concurrencyResults.length > 0) {
        const bestThroughput = concurrencyResults.reduce((best, current) => 
          current.metrics.requestsPerSecond > best.metrics.requestsPerSecond ? current : best
        );
        
        const worstLatency = concurrencyResults.reduce((worst, current) => 
          current.metrics.p95 > worst.metrics.p95 ? current : worst
        );

        console.log(`\n🚀 Best Throughput:`);
        console.log(`   Concurrency: ${bestThroughput.concurrency}`);
        console.log(`   Throughput: ${bestThroughput.metrics.requestsPerSecond.toFixed(2)} req/s`);
        console.log(`   Avg Response: ${bestThroughput.metrics.averageResponseTime.toFixed(2)}ms`);

        console.log(`\n⏱️  Worst Latency:`);
        console.log(`   Concurrency: ${worstLatency.concurrency}`);
        console.log(`   p95 Response: ${worstLatency.metrics.p95.toFixed(2)}ms`);
        console.log(`   Error Rate: ${worstLatency.metrics.errorRate.toFixed(2)}%`);

        // Find breaking point (where error rate > 5%)
        const breakingPoint = concurrencyResults.find(r => r.metrics.errorRate > 5);
        if (breakingPoint) {
          console.log(`\n⚠️  Breaking Point Detected:`);
          console.log(`   Concurrency: ${breakingPoint.concurrency}`);
          console.log(`   Error Rate: ${breakingPoint.metrics.errorRate.toFixed(2)}%`);
          console.log(`   Recommendation: Keep concurrency below ${breakingPoint.concurrency} for production`);
        } else {
          console.log(`\n✅ No breaking point detected in tested range`);
          console.log(`   All concurrency levels maintained < 5% error rate`);
        }
      }

      // System metrics comparison
      if (this.systemMetrics.length >= 2) {
        const startMetrics = this.systemMetrics[0];
        const endMetrics = this.systemMetrics[this.systemMetrics.length - 1];
        
        const memDiff = endMetrics.memoryUsage.heapUsed - startMetrics.memoryUsage.heapUsed;
        const timeDiff = endMetrics.timestamp - startMetrics.timestamp;
        
        console.log(`\n💾 Memory Usage Change:`);
        console.log(`   Heap Used: ${(memDiff / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Test Duration: ${(timeDiff / 1000).toFixed(2)}s`);
      }

      // Optional cleanup
      // await this.cleanup();

      console.log("\n✅ Performance test suite completed!");
      console.log("\n💡 Tips:");
      console.log("   - Review the metrics above to identify bottlenecks");
      console.log("   - Consider database indexing if response times are high");
      console.log("   - Monitor memory usage for potential leaks");
      console.log("   - Test users were created but not deleted (for inspection)");

    } catch (error: any) {
      console.error("\n❌ Test suite failed:", error);
      throw error;
    } finally {
      await this.disconnectDB();
    }
  }
}

// Run the test suite
const testSuite = new PerformanceTestSuite();
testSuite.runFullTestSuite().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
