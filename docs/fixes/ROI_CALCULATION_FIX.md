# ROI Calculation Fix - Package-Specific Daily ROI Percentage

## Issue

User CROWN-000221 had a $5000 investment with 1.75% daily ROI expected, but was only receiving $0.09 instead of $87.50.

**Root Cause:**
- System was calculating ROI using `totalOutputPct / duration` instead of using the package's `roi` field directly
- The `roi` field in packages represents the **DAILY ROI percentage** (e.g., 1.75% per day)
- Old calculation: `dailyRoiRate = (totalOutputPct / 100) / durationDays` 
  - This gave incorrect rates like 0.000018 (0.0018%) instead of 0.0175 (1.75%)

## Fix Applied

### 1. Updated ROI Calculation Logic

**Priority Order:**
1. **Package.roi** (source of truth) - Daily ROI percentage from package
2. Package.totalOutputPct / duration (fallback calculation)
3. Stored investment.dailyRoiRate (last resort, may be incorrect for old investments)

**New Formula:**
```typescript
// Get daily ROI percentage from package
dailyRoiPct = pkg.roi / 100  // 1.75% = 0.0175

// Calculate daily ROI amount
dailyRoiAmount = principal × dailyRoiPct
// Example: $5000 × 0.0175 = $87.50 ✓
```

### 2. Files Modified

1. **`server/src/services/roi-cron.service.ts`**
   - Updated `calculateDailyROI()` to use `package.roi` as daily percentage
   - Always prioritizes package value over stored investment value

2. **`server/src/services/calculation-job.service.ts`**
   - Updated `calculateDailyROIResumable()` with same fix
   - Ensures background job calculations use correct ROI

3. **`server/src/services/investment.service.ts`**
   - Fixed investment creation to store correct `dailyRoiRate` from `package.roi`
   - New investments will have correct daily ROI rate stored

## Expected Results

**For User CROWN-000221:**
- Investment: $5,000
- Package ROI: 1.75% (daily)
- **Expected Daily ROI:** $5,000 × 1.75% = **$87.50** ✓

**Calculation Breakdown:**
1. Get `package.roi = 1.75`
2. Convert to decimal: `dailyRoiPct = 1.75 / 100 = 0.0175`
3. Calculate: `$5000 × 0.0175 = $87.50`
4. Split: Cashable (50%) = $43.75, Renewable (50%) = $43.75

## Important Notes

1. **Package.roi is Daily Percentage**
   - `roi: 1.75` means 1.75% per day
   - NOT total output over duration

2. **Package is Source of Truth**
   - ROI calculation always checks package first
   - Even if investment has stored `dailyRoiRate`, package value takes priority
   - This ensures correct ROI even if package was updated after investment creation

3. **Backward Compatibility**
   - Falls back to `totalOutputPct / duration` if `roi` not available
   - Falls back to stored `dailyRoiRate` as last resort

## Testing

After deploying, verify:
1. ROI calculations use package-specific daily ROI percentage
2. $5000 investment with 1.75% ROI gives $87.50 daily
3. Different packages with different ROI percentages calculate correctly
4. Existing investments use their package's current ROI value
