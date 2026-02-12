# Binary Bonus Daily Capping Fix

## Issues Fixed

### Issue 1: Daily Capping Not Applied Correctly
**Problem:** System was capping the **matched volume** instead of the **bonus amount**
- Old logic: `cappedMatched = min(matched, powerCapacity)` then `bonus = cappedMatched × 10%`
- This incorrectly limited the business volume that could be matched

**Fix:** Now caps the **bonus amount** after calculation
- New logic: `bonus = matched × 10%` then `creditedBonus = min(bonus, dailyCap)`
- Remaining bonus above cap is ignored (not stored)

### Issue 2: Incorrect Carry Forward Calculation
**Problem:** Carry forward was using `cappedMatched` instead of actual `matched` business volume
- Old logic: `newLeftCarry = leftAvailable - cappedMatched`
- This caused incorrect carry values when capping was applied

**Fix:** Carry forward now uses actual matched business volume
- New logic: `newLeftCarry = leftAvailable - matched` (where `matched` is actual business volume)
- Carry is calculated from BUSINESS VOLUME, not affected by bonus capping

### Issue 3: Not Using User-Specific Package Capping Limit
**Problem:** System was using a default package's capping limit for all users

**Fix:** Now retrieves each user's active investment package to get their specific `powerCapacity` (daily cap)

## Corrected Formula

```
1. Matching Business = MIN(Left Available, Right Available)
   Where:
   - Left Available = Left Carry + (Left Business - Left Matched)
   - Right Available = Right Carry + (Right Business - Right Matched)

2. Full Binary Bonus = Matching Business × 10%

3. Daily Capping:
   - If Full Bonus > Daily Cap:
     → Credited Bonus = Daily Cap
     → Remaining Bonus = Ignored (not stored)
   - If Full Bonus ≤ Daily Cap:
     → Credited Bonus = Full Bonus

4. Carry Forward (from BUSINESS VOLUME, not bonus):
   - Left Carry = Left Available - Matching Business
   - Right Carry = Right Available - Matching Business
   
   ⚠️ IMPORTANT: Capping does NOT affect carry forward.
   Carry is pure volume difference, not earnings.
```

## Example Calculation

**Input:**
- Left Business: $162,700
- Right Business: $160,599
- Left Carry: $0 (first calculation)
- Right Carry: $0 (first calculation)
- Left Matched: $0
- Right Matched: $0
- Daily Cap: $5,000

**Calculation:**
1. Left Available = $0 + ($162,700 - $0) = $162,700
2. Right Available = $0 + ($160,599 - $0) = $160,599
3. Matching Business = MIN($162,700, $160,599) = $160,599
4. Full Binary Bonus = $160,599 × 10% = $16,059.90
5. Credited Bonus = MIN($16,059.90, $5,000) = **$5,000** ✓
6. Left Carry = $162,700 - $160,599 = **$2,101** ✓
7. Right Carry = $160,599 - $160,599 = **$0** ✓

## Daily Cap Behavior

- **Daily cap resets every day** - user can earn up to their cap limit each day
- **Cap is package-specific** - retrieved from user's active investment package
- **Remaining bonus above cap is ignored** - not stored or carried forward
- **Carry forward is NOT affected by cap** - calculated from business volume only

## Files Modified

1. `server/src/services/investment.service.ts`
   - Fixed `calculateBinaryBonus()` function
   - Updated `calculateDailyBinaryBonuses()` to get user-specific package cap

2. `server/src/services/calculation-job.service.ts`
   - Updated `calculateDailyBinaryBonusesResumable()` with same fixes

## Testing

After deploying, verify:
1. Binary bonus is capped at user's daily limit
2. Carry forward shows correct excess business volume
3. Daily cap resets each day (user can earn up to cap every day)
4. Users with different packages have different daily caps
