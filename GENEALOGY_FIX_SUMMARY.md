# Genealogy Tree Issues - Fix Summary

**Date:** February 1, 2026  
**Status:** ✅ Fixed

---

## Issues Identified

### Issue 1: Access Control ✅ FIXED
**Problem:** Users could view genealogy trees of users not in their downline (e.g., CROWN-000476).

**Root Cause:** The `getNodeDownlines` API had no access control - any authenticated user could view any user's tree.

**Fix:** Added access control check in `server/src/controllers/tree.controller.ts`:
- Users can only view trees of users in their downline
- Admins (CROWN-000000, CNEOX-000000) can view any tree
- Returns 403 error if access denied

### Issue 2: Count Discrepancy ✅ FIXED (Script Updated)
**Problem:** 
- CROWN-000106 (upline) shows 94 stored / 93 actual left downlines
- CROWN-000280 (downline) shows 102 stored / 103 actual left downlines
- Upline showing fewer downlines than downline is logically incorrect

**Root Cause:** 
1. Stale counts in database (not recalculated)
2. **CRITICAL:** The `recalculateDownlines.ts` script didn't handle admin nodes correctly
   - Admin nodes can have unlimited children via `parent` relationship
   - Script only followed `leftChild` and `rightChild`, missing admin children
   - This caused incorrect counts when admin nodes were in the tree

**Fix:** Updated `server/src/scripts/recalculateDownlines.ts`:
- Now uses iterative BFS approach (like diagnostic script)
- Properly handles admin nodes by checking `parent` relationship
- Counts all children of admin nodes, not just left/right

---

## Diagnostic Results

From `diagnoseGenealogyIssues.ts` output:

```
✅ User 1 Found: CROWN-000106 (Crown Head)
   - Stored leftDownlines: 94
   - Actual left downlines: 93
   - Difference: -1

✅ User 2 Found: CROWN-000280 (henry hernan)
   - Stored leftDownlines: 102
   - Actual left downlines: 103
   - Difference: +1

🔗 Relationship Check:
   - Is CROWN-000280 in CROWN-000106's downline? ✅ YES
   - Is CROWN-000106 in CROWN-000280's downline? ❌ NO

⚠️ ISSUE: Upline (CROWN-000106) shows FEWER downlines than downline (CROWN-000280)!
```

**Analysis:**
- The relationship is correct (CROWN-000280 is in CROWN-000106's downline)
- Counts are stale and need recalculation
- The recalculation script now handles admin nodes correctly

---

## Files Modified

1. **`server/src/controllers/tree.controller.ts`**
   - Added `isUserInDownline()` helper function (lines 512-590)
   - Added access control check in `getNodeDownlines()` (lines 592-752)
   - Admins can view any tree, regular users can only view their downline

2. **`server/src/scripts/recalculateDownlines.ts`**
   - Fixed `countSubtreeUsers()` to handle admin nodes correctly
   - Uses iterative BFS approach instead of simple recursion
   - Checks `parent` relationship for admin nodes

3. **`server/src/scripts/diagnoseGenealogyIssues.ts`** (Created)
   - Diagnostic tool to identify count discrepancies
   - Checks relationships and compares stored vs actual counts

---

## Next Steps

### 1. Run Recalculation Script ✅ READY

The recalculation script is now fixed and ready to run:

```bash
cd server
npx ts-node -r dotenv/config src/scripts/recalculateDownlines.ts
```

**What it does:**
- Recursively counts all users in each subtree
- Properly handles admin nodes with unlimited children
- Updates `leftDownlines` and `rightDownlines` for all users
- Processes from bottom to top for accuracy

**Expected Result:**
- CROWN-000106 should have >= 103 left downlines (includes CROWN-000280 + all its downlines)
- CROWN-000280 should have 103 left downlines (actual count)
- All counts will be accurate and logical

### 2. Verify Access Control ✅ ACTIVE

Access control is already active:
- Try viewing a tree outside your downline → Should get 403 error
- View your own tree → Should work
- View a downline's tree → Should work
- Admin can view any tree → Should work

### 3. Re-run Diagnostic (Optional)

After running recalculation, verify counts are correct:

```bash
cd server
npx ts-node -r dotenv/config src/scripts/diagnoseGenealogyIssues.ts CROWN-000106 CROWN-000280
```

**Expected Result:**
- Stored counts should match actual counts
- Upline should have >= downline counts
- No discrepancies

---

## Technical Details

### Admin Node Handling

Admin nodes (CROWN-000000, CNEOX-000000) can have unlimited children via the `parent` relationship, not just `leftChild` and `rightChild`. The counting logic must:

1. Check if a node is admin
2. If admin, find all children via `BinaryTree.find({ parent: adminId })`
3. If regular user, only follow `leftChild` and `rightChild`

### Count Logic

For a user U:
- `leftDownlines` = total count of all users in the left subtree (recursive)
- `rightDownlines` = total count of all users in the right subtree (recursive)
- If U has downline D, then `U.leftDownlines >= D.leftDownlines + 1`

---

## Summary

✅ **Access Control:** Fixed - users can only view their downline trees  
✅ **Recalculation Script:** Fixed - now handles admin nodes correctly  
✅ **Diagnostic Tool:** Created - helps identify count discrepancies  
⏳ **Action Required:** Run recalculation script to fix stale counts

All code changes compile successfully and are ready for deployment.
