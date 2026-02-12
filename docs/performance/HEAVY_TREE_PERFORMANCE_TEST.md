# Heavy Tree Performance Test Guide

## Overview

This comprehensive performance test suite evaluates signup performance with a heavy binary tree structure. It tests:
- Single signups at different tree depths
- Concurrent signups with varying concurrency levels
- API response times and throughput
- System resource usage
- Peak performance constraints

## Test Structure

The test builds a heavy tree where:
- **Root User (User A)** has **10 left children** and **10 right children**
- Tests signups at different depths in this tree
- Tests concurrent signups to find peak performance limits

## Prerequisites

1. **MongoDB Connection**: Ensure MongoDB is running and accessible
   - Local MongoDB: `mongodb://localhost:27017/crown-bankers`
   - MongoDB Atlas: Set `MONGODB_URL_DEVELOPMENT` in `.env`

2. **Environment Setup**: 
   ```bash
   cd server
   npm install  # Ensure all dependencies are installed
   ```

3. **Root User**: The test uses `CROWN-000071` as the root user. If it doesn't exist, the test will create one.

## Running the Test

### Basic Execution

```bash
cd server
npx ts-node src/scripts/heavyTreePerformanceTest.ts
```

### With Custom MongoDB URI

```bash
cd server
MONGODB_URL_DEVELOPMENT="your-mongodb-uri" npx ts-node src/scripts/heavyTreePerformanceTest.ts
```

## Test Suites

### Test Suite 1: Single Signup Performance

Tests signup performance at different tree depths:
- **Depth 0**: Signup directly under root user
- **Depth 1**: Signup one level deep
- **Depth 2**: Signup two levels deep

**Metrics Collected:**
- Response time (average, min, max)
- Percentiles (p50, p95, p99)
- Success/failure rate

### Test Suite 2: Concurrent Signup Performance

Tests concurrent signups with different concurrency levels:
- **Concurrency 1**: 5 users sequentially
- **Concurrency 5**: 20 users (4 batches of 5)
- **Concurrency 10**: 50 users (5 batches of 10)
- **Concurrency 20**: 100 users (5 batches of 20)

**Metrics Collected:**
- Throughput (requests per second)
- Response time statistics
- Error rate
- System resource usage

## Output Metrics

### Performance Metrics

- **Total Requests**: Number of signup requests made
- **Successful/Failed**: Success and failure counts
- **Error Rate**: Percentage of failed requests
- **Response Time Statistics**:
  - Average response time
  - Minimum response time
  - Maximum response time
  - Median (p50)
  - 95th percentile (p95)
  - 99th percentile (p99)
- **Throughput**: Requests per second

### System Metrics

- **Platform Information**: OS, architecture, CPU count
- **Memory Usage**: Total, free, and process memory
- **Memory Changes**: Heap usage changes during test

### Peak Performance Analysis

- **Best Throughput**: Concurrency level with highest req/s
- **Worst Latency**: Concurrency level with highest p95 response time
- **Breaking Point**: Concurrency level where error rate exceeds 5%

## Understanding Results

### Good Performance Indicators

✅ **Response Times:**
- Average < 2 seconds
- p95 < 5 seconds
- p99 < 10 seconds

✅ **Throughput:**
- > 5 req/s for single signups
- > 2 req/s for concurrent signups (concurrency 10+)

✅ **Error Rate:**
- < 1% for all concurrency levels

### Warning Signs

⚠️ **Performance Issues:**
- Average response time > 5 seconds
- p95 > 10 seconds
- Error rate > 5% at any concurrency level
- Memory usage increasing significantly

⚠️ **System Constraints:**
- Throughput plateaus or decreases with higher concurrency
- Error rate spikes at specific concurrency levels
- Memory usage approaching system limits

## Troubleshooting

### MongoDB Connection Errors

```
❌ Failed to connect to MongoDB!
```

**Solutions:**
1. Ensure MongoDB is running:
   ```bash
   # Local MongoDB
   brew services start mongodb-community
   
   # Docker
   docker-compose up -d mongodb
   ```

2. Check your `.env` file has `MONGODB_URL_DEVELOPMENT` set correctly

3. Verify MongoDB connection string format

### Slow Performance

If signup times are consistently high (> 5 seconds):

1. **Check Database Indexes**: Ensure proper indexes on:
   - `BinaryTree.user`
   - `BinaryTree.parent`
   - `User.userId`
   - `User.referrer`

2. **Check Tree Depth**: Very deep trees (> 10 levels) may be slower

3. **Database Connection**: Check MongoDB connection pool settings

4. **System Resources**: Ensure adequate CPU and memory

### High Error Rates

If error rate > 5%:

1. **Check Concurrent Requests**: Reduce concurrency level
2. **Database Locks**: MongoDB may be experiencing write conflicts
3. **Memory Issues**: Check if system is running out of memory
4. **Network Issues**: Check MongoDB connection stability

## Test Data Cleanup

By default, the test **does NOT** delete created users to allow for inspection. To enable cleanup, uncomment the cleanup section in the script:

```typescript
// Optional cleanup
await this.cleanup();
```

**Note**: Cleanup will only delete users created during the test, not the tree structure users.

## Customizing Tests

### Modify Tree Structure

To test with different tree sizes, modify the `buildHeavyTree()` method:

```typescript
// Change from 10 to 20 children per side
for (let i = 0; i < 20; i++) {
  // ...
}
```

### Modify Concurrency Tests

To test different concurrency levels, modify the `concurrencyTests` array:

```typescript
const concurrencyTests = [
  { concurrency: 1, totalUsers: 10 },
  { concurrency: 50, totalUsers: 200 },  // Add more aggressive test
  // ...
];
```

### Modify Depth Tests

To test different tree depths:

```typescript
const depthTests = [
  { depth: 0, position: "left" as const },
  { depth: 5, position: "left" as const },  // Test deeper
  // ...
];
```

## Best Practices

1. **Run Tests Locally First**: Test on local development environment before production
2. **Monitor System Resources**: Watch CPU and memory during tests
3. **Start Small**: Begin with lower concurrency and gradually increase
4. **Document Results**: Save test results for comparison over time
5. **Clean Up**: Remove test data after testing (if not needed)

## Example Output

```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB

💻 System Information:
   Platform: darwin (x64)
   CPUs: 8
   Total Memory: 16.00 GB
   Free Memory: 8.50 GB

🌳 Building Heavy Tree Structure...
✅ Using existing root user: CROWN-000071

🧪 Test: Concurrent Signups
   Concurrency: 10 simultaneous requests
   Total Users: 50

📦 Batch 1: Creating 10 users concurrently...
   Progress: 50/50 (100.0%)

📊 Test Results:
   Total Time: 15234ms (15.23s)
   Completed: 50/50

📈 Results for Concurrency 10
   Average: 2845.32ms
   p95: 5234.12ms
   Throughput: 3.28 req/s
   Error Rate: 0.00%

🎯 PEAK PERFORMANCE ANALYSIS
   🚀 Best Throughput:
      Concurrency: 10
      Throughput: 3.28 req/s
      Avg Response: 2845.32ms
```

## Next Steps

After running the test:

1. **Analyze Results**: Identify bottlenecks and constraints
2. **Optimize Code**: Address slow operations (database queries, tree traversal)
3. **Adjust Configuration**: Tune MongoDB connection pool, indexes
4. **Set Production Limits**: Use breaking point to set max concurrency
5. **Monitor Production**: Set up monitoring based on test findings
