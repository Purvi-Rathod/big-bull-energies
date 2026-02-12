# Testing Signup Performance

This guide explains how to test the signup performance optimizations.

## 🎯 What We're Testing

We're measuring how long it takes to sign up a new user with a referrer ID. The optimizations should reduce signup time from **10-30+ seconds** to **<1 second**.

## 📋 Prerequisites

1. **MongoDB running** - Make sure your MongoDB instance is running
2. **Environment variables** - Ensure `.env` file is configured in `server/` directory
3. **Test referrer exists** - User with `userId: CROWN-000071` should exist in database

## 🧪 Testing Methods

### Method 1: Automated Test Script (Recommended)

This is the fastest way to test performance:

```bash
# Navigate to server directory
cd server

# Run the performance test
npm run test:signup-performance
```

**What it does:**
- Connects to MongoDB
- Creates a test user with referrer ID `CROWN-000071`
- Measures the exact signup time
- Cleans up the test user
- Shows performance metrics

**Expected Output:**
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB

📊 Testing signup with referrer: CROWN-000071
⏱️  Starting performance test...

✅ Response status: 201

⏱️  Total signup time: 450ms (0.45s)
✅ Signup performance is acceptable
🧹 Cleaned up test user

✅ Test completed
```

### Method 2: Manual Testing via Frontend

1. **Start the development servers:**

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

2. **Open the signup page:**
   - Navigate to `http://localhost:3000/signup`
   - Or use: `http://localhost:3000/signup?referrer=CROWN-000071`

3. **Fill in the form:**
   - Full Name: `Test User`
   - Email: `test@example.com` (use unique email each time)
   - Phone: `1234567890`
   - Password: `Test@123456`
   - Country: Select any country
   - Referrer ID: `CROWN-000071`
   - Position: `left` or `right`

4. **Measure the time:**
   - Click "Create account"
   - Use browser DevTools Network tab to see request duration
   - Or use browser console to measure time

**Expected Result:**
- Request should complete in **<1 second**
- No timeout errors
- User should be created successfully

### Method 3: API Testing with curl

Test directly via API:

```bash
# Test signup API
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$(date +%s)'@example.com",
    "phone": "1234567890",
    "password": "Test@123456",
    "country": "US",
    "referrerUserId": "CROWN-000071",
    "position": "left"
  }' \
  -w "\n⏱️  Time: %{time_total}s\n"
```

**Expected Output:**
- Response time should be **<1 second**
- Status code: `201 Created`
- JSON response with user data

### Method 4: Browser DevTools Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by **XHR** or **Fetch**
4. Navigate to signup page and submit form
5. Check the `/api/v1/auth/signup` request:
   - **Time**: Should be <1000ms
   - **Status**: 201 Created
   - **Response**: Should contain user data

## 📊 Performance Benchmarks

### Before Optimization
- ⚠️ **10-30+ seconds** for users deep in the tree
- ⚠️ Timeout errors common
- ⚠️ Poor user experience

### After Optimization
- ✅ **<1 second** for all signups
- ✅ No timeout errors
- ✅ Smooth user experience

## 🔍 Troubleshooting

### Issue: "Referrer CROWN-000071 not found"

**Solution:**
```bash
# Check if referrer exists
cd server
npm run test:users

# Or create a test user manually
# The script will create users with referrer IDs
```

### Issue: MongoDB Connection Error

**Solution:**
```bash
# Check MongoDB is running
mongosh

# Or check connection string in .env
cat server/.env | grep MONGODB
```

### Issue: Still Slow (>5 seconds)

**Check:**
1. Database indexes are created (should be automatic)
2. No network latency issues
3. MongoDB is not overloaded
4. Check server logs for errors

### Issue: Test Script Fails

**Solution:**
```bash
# Make sure you're in server directory
cd server

# Check dependencies
npm install

# Check TypeScript compilation
npm run build
```

## 📈 Comparing Performance

To compare before/after:

1. **Before:** Comment out the optimizations in `userInit.service.ts`
2. **After:** Uncomment the optimizations
3. Run the test script both times
4. Compare the results

## ✅ Success Criteria

The optimization is successful if:
- ✅ Signup completes in **<1 second**
- ✅ No timeout errors
- ✅ User is created correctly
- ✅ Binary tree is initialized properly
- ✅ Downline counts are accurate

## 🚀 Next Steps

After confirming performance improvements:
1. Test with different referrer IDs
2. Test with users at different tree depths
3. Test with admin referrer (CROWN-000000)
4. Deploy to production
5. Monitor production performance

---

**Need Help?** Check the server logs for detailed error messages:
```bash
cd server
npm run dev
# Watch the console for any errors
```
