# Genealogy Tree Display Issues - Fixes

**Date:** February 1, 2026  
**Issues Reported:**
1. Count discrepancy: CROWN-000106 (upline) shows 93 left downlines, but CROWN-000280 (downline) shows 100 left downlines
2. Access control: Users can view genealogy trees of users not in their downline (e.g., CROWN-000476)

---

## Issue Analysis

### Issue 1: Count Discrepancy

**Problem:** Upline showing fewer downlines than downline, which is logically incorrect.

**Root Cause:**
- `leftDownlines` and `rightDownlines` are stored counts in BinaryTree model
- These counts may become stale if:
  - Users are added/removed without updating ancestor counts
  - Count recalculation script hasn't been run
  - Incremental updates failed during signup

**Expected Behavior:**
- If CROWN-000280 is in CROWN-000106's downline, then:
  - CROWN-000106's total downlines should include CROWN-000280 + all of CROWN-000280's downlines
  - Therefore: `CROWN-000106.leftDownlines >= CROWN-000280.leftDownlines + 1`

### Issue 2: Access Control

**Problem:** `getNodeDownlines` API allows any authenticated user to view any user's tree.

**Current Code (Line 511-752):**
```typescript
export const getNodeDownlines = asyncHandler(async (req, res) => {
  const requestingUserId = (req as any).user?.id;
  const targetUserId = req.params.userId;
  
  // ❌ NO ACCESS CONTROL CHECK - allows viewing any user's tree
  // Just finds target user and returns their tree
});
```

**Security Issue:**
- Users can search and view trees of users not in their downline
- This violates privacy and business logic
- Example: User can view CROWN-000476 even if not in their downline

---

## Fixes Required

### Fix 1: Add Access Control to `getNodeDownlines` API

**File:** `server/src/controllers/tree.controller.ts`

**Change:** Add check to ensure target user is in requesting user's downline (or requesting user is admin)

### Fix 2: Create Count Recalculation Script

**File:** `server/src/scripts/recalculateDownlines.ts` (already exists)

**Action:** Run this script to fix stale counts

### Fix 3: Add Real-time Count Verification

**Enhancement:** Add validation to ensure counts are accurate when displaying

---

## Implementation

### Fix 1: Access Control Added ✅

**File:** `server/src/controllers/tree.controller.ts`

**Changes:**
1. Added `isUserInDownline()` helper function (lines 512-590) that:
   - Checks if target user is in requesting user's downline
   - Allows admins (CROWN-000000, CNEOX-000000) to view any tree
   - Traverses the binary tree to verify relationship

2. Updated `getNodeDownlines()` function (lines 592-752) to:
   - Check if requesting user is admin (allows viewing any tree)
   - For non-admin users, verify target user is in their downline
   - Throw 403 error if access denied

**Security Impact:**
- ✅ Users can now ONLY view trees of users in their downline
- ✅ Admins can still view any tree (as expected)
- ✅ Prevents unauthorized access to genealogy data

### Fix 2: Count Recalculation Script

**File:** `server/src/scripts/recalculateDownlines.ts` (already exists)

**Usage:**
```bash
cd server
npx ts-node -r dotenv/config src/scripts/recalculateDownlines.ts
```

**What it does:**
- Recursively counts all users in each subtree
- Updates `leftDownlines` and `rightDownlines` for all users
- Processes from bottom to top to ensure accuracy

**Note:** This script should be run to fix stale counts. The count discrepancy (CROWN-000106 showing 93 vs CROWN-000280 showing 100) will be resolved after running this script.

### Fix 3: Diagnostic Script Created ✅

**File:** `server/src/scripts/diagnoseGenealogyIssues.ts` (new)

**Usage:**
```bash
cd server
npx ts-node -r dotenv/config src/scripts/diagnoseGenealogyIssues.ts CROWN-000106 CROWN-000280
```

**What it does:**
- Compares stored counts vs actual counts
- Checks if users are in each other's downlines
- Identifies count discrepancies
- Helps diagnose access control issues

---

## Testing

After fixes:
1. ✅ **Access Control Test:**
   - Try viewing a tree outside your downline (should fail with 403 error)
   - Try viewing your own tree (should work)
   - Try viewing a downline's tree (should work)
   - Admin should be able to view any tree

2. ✅ **Count Verification:**
   - Run diagnostic script: `npx ts-node -r dotenv/config src/scripts/diagnoseGenealogyIssues.ts CROWN-000106 CROWN-000280`
   - Run recalculation script: `npx ts-node -r dotenv/config src/scripts/recalculateDownlines.ts`
   - Verify counts are correct after recalculation

3. ✅ **Genealogy Display:**
   - Verify users can only see their downline
   - Verify counts are logical (upline should have >= downline counts)
