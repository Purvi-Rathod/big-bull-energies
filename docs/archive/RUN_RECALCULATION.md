# How to Fix Genealogy Count Issues

## Problem
The API is showing incorrect downline counts because the stored values in the database are stale. All users at different levels are showing the same count (94), which is incorrect.

## Solution
Run the recalculation script to update all stored counts in the database.

## Steps

### 1. Navigate to Server Directory
```bash
cd /Users/mayanksahu/Desktop/binary_system/server
```

### 2. Run the Recalculation Script
```bash
npx ts-node -r dotenv/config src/scripts/recalculateDownlines.ts
```

**Expected Output:**
```
🌱 Starting downline recalculation...
✅ Database connected
📊 Found X binary tree entries
🔄 Recalculating downline counts (processing from deepest to shallowest)...
Updated CROWN-000106: Left 94 -> 93, Right 0 -> 0
Updated CROWN-000242: Left 94 -> 92, Right 0 -> 0
Updated CROWN-000243: Left 94 -> 91, Right 0 -> 0
...
✨ Recalculation completed! Updated X users.
```

### 3. Verify the Fix
After running the script, refresh your genealogy page or call the API again:
```
http://localhost:8000/api/v1/tree/node/CROWN-000106/downlines?maxDepth=3
```

**Expected Result:**
- CROWN-000106 should show the highest count (includes all downlines)
- CROWN-000242 should show a lower count (only its downlines)
- CROWN-000243 should show an even lower count (only its downlines)
- Counts should decrease as you go deeper in the tree

## Troubleshooting

### If script fails with connection error:
- Check your `.env` file has correct `MONGODB_URL_PRODUCTION` or `MONGODB_URL_DEVELOPMENT`
- Ensure MongoDB is accessible from your IP

### If counts are still wrong after running:
- Check the script output for any errors
- Run the diagnostic script to compare stored vs actual:
  ```bash
  npx ts-node -r dotenv/config src/scripts/diagnoseGenealogyIssues.ts CROWN-000106 CROWN-000280
  ```

## Note
The recalculation script processes from bottom to top to ensure accurate counts. It may take a few minutes if you have many users.
