# Performance Test Scripts

## Heavy Tree Performance Test

Comprehensive performance testing for signup operations with heavy binary tree structures.

### Quick Start

```bash
cd server
npx ts-node src/scripts/heavyTreePerformanceTest.ts
```

### What It Tests

1. **Heavy Tree Structure**: Builds a tree with root user having 10 left and 10 right children
2. **Single Signup Performance**: Tests signups at different tree depths (0, 1, 2)
3. **Concurrent Signup Performance**: Tests with varying concurrency levels (1, 5, 10, 20)
4. **System Metrics**: Monitors CPU, memory, and response times
5. **Peak Performance Analysis**: Identifies breaking points and optimal concurrency

### Expected Duration

- Tree Building: ~30-60 seconds (20 users)
- Single Signup Tests: ~10-30 seconds (3 tests)
- Concurrent Tests: ~2-5 minutes (4 test batches)
- **Total: ~3-7 minutes**

### Output

The test provides detailed metrics including:
- Response time statistics (avg, min, max, p50, p95, p99)
- Throughput (requests per second)
- Error rates
- System resource usage
- Peak performance recommendations

### Prerequisites

- MongoDB connection (local or Atlas)
- Node.js v18+ installed
- All server dependencies installed (`npm install`)

### Environment Variables

Set `MONGODB_URL_DEVELOPMENT` in your `.env` file or pass it directly:

```bash
MONGODB_URL_DEVELOPMENT="your-mongodb-uri" npx ts-node src/scripts/heavyTreePerformanceTest.ts
```

### Notes

- Test users are created but **not deleted** by default (for inspection)
- The test uses `CROWN-000071` as root user (creates if doesn't exist)
- All tests run locally against your MongoDB instance
