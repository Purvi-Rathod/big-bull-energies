# Comprehensive Reconciliation Service

## Overview

The Reconciliation Service is a comprehensive daily diagnostic tool that checks all system components for inconsistencies, errors, and data integrity issues. It generates detailed reports with warnings and actionable items.

## Features

### What It Checks

1. **Wallets**
   - Balance consistency (stored vs calculated from transactions)
   - Negative balances
   - Reserved amounts exceeding balance
   - Transaction integrity

2. **Binary Tree**
   - Business volume accuracy (leftBusiness, rightBusiness)
   - Downline count accuracy (leftDownlines, rightDownlines)
   - Carry forward consistency (leftCarry, rightCarry)
   - Matched amounts validation (leftMatched, rightMatched)
   - Detects when matched exceeds business volume

3. **Investments**
   - Active/inactive status consistency
   - Investment amounts validation
   - Principal vs invested amount consistency
   - Days remaining calculation
   - Expired investments still marked as active

4. **Career Rewards**
   - Eligibility checking (both left and right business volume thresholds)
   - Completed levels validation
   - Total rewards earned consistency
   - Missing rewards detection

5. **Transactions**
   - Duplicate transaction detection (idempotencyKey, txRef)
   - Balance consistency in transaction records
   - Transaction integrity validation

## Usage

### Manual Execution

#### Check All Users
```bash
cd server
npx ts-node -r dotenv/config src/scripts/runReconciliation.ts
```

#### Check Specific User and Their Downlines
```bash
npx ts-node -r dotenv/config src/scripts/runReconciliation.ts CROWN-000282
```

#### Check Limited Number of Users
```bash
npx ts-node -r dotenv/config src/scripts/runReconciliation.ts --max-users 1000
```

### Daily Cron Job

The reconciliation service can be scheduled to run daily at 2:00 AM UTC.

#### Enable Daily Reconciliation

Edit `server/src/index.ts` and uncomment the reconciliation cron:

```typescript
// Setup reconciliation cron (runs daily at 2:00 AM)
reconciliationCron.start(); // Uncomment to enable daily reconciliation
```

#### Manual Cron Trigger

You can also trigger the reconciliation manually:

```bash
cd server
npx ts-node -r dotenv/config src/cron/reconciliation-cron.ts
```

## Report Output

Reports are saved to: `server/reconciliation-reports/`

Format: `reconciliation-{userId|all}-{timestamp}.txt`

### Report Structure

1. **Summary**
   - Total users checked
   - Total issues found
   - Breakdown by severity (errors, warnings, info)
   - Issues by category

2. **Issues by Severity**
   - **Errors**: Critical issues requiring immediate attention
   - **Warnings**: Issues that should be reviewed
   - **Info**: Informational items for review

3. **Action Summary**
   - List of all unique actions needed to fix issues

## Issue Severity Levels

### Error (Critical)
- Wallet balance mismatches
- Binary tree business volume mismatches
- Matched amounts exceeding business volume
- Negative carry forward
- Expired investments still active
- Missing career rewards for eligible users
- Duplicate transactions

### Warning
- Downline count mismatches
- Reserved amount exceeding balance
- Principal vs invested amount differences
- Days remaining calculation issues
- Total rewards earned mismatches

### Info
- Principal differences (may be intentional due to renewable principal)
- Other informational items

## Example Report

```
COMPREHENSIVE RECONCILIATION REPORT
Generated: 2026-02-06T10:00:00.000Z
====================================================================================================

SUMMARY
====================================================================================================
Total Users Checked: 34
Total Issues Found: 12
  - Errors: 4
  - Warnings: 6
  - Info: 2

ISSUES BY CATEGORY
====================================================================================================
Wallets: 2
Binary Tree: 4
Investments: 3
Career Rewards: 2
Transactions: 1

❌ ERRORS (4)
====================================================================================================

1. [BINARYTREE] CROWN-000282
   Right Matched (5200.00) exceeds Right Business (200.00)
   Action: Recalculate rightMatched and rightCarry

2. [WALLETS] CROWN-000483
   Wallet balance mismatch for binary: Stored 520.00 vs Calculated 20.00 (Difference: 500.00)
   Action: Recalculate wallet balance for binary wallet

...

⚠️  WARNINGS (6)
...

ℹ️  INFO (2)
...

ACTION SUMMARY
====================================================================================================

1. Recalculate rightMatched and rightCarry
2. Recalculate wallet balance for binary wallet
...
```

## Integration with Diagnostic Scripts

The reconciliation service uses the same logic as the diagnostic scripts:
- `diagnoseBinaryTree.ts` - Binary tree diagnostics
- `fixBinaryTreeIssues.ts` - Automated fixes

## Best Practices

1. **Run Daily**: Schedule the reconciliation to run daily at a low-traffic time (e.g., 2:00 AM)
2. **Review Reports**: Check reports daily for critical errors
3. **Fix Issues Promptly**: Address errors immediately, review warnings regularly
4. **Monitor Trends**: Track issue counts over time to identify systemic problems
5. **Test Fixes**: After applying fixes, run reconciliation again to verify

## Troubleshooting

### High Number of Issues
- Check if there was a recent system change
- Verify database integrity
- Review recent transactions

### Performance Issues
- Use `--max-users` to limit scope during testing
- Run for specific users during peak hours
- Consider running during off-peak hours

### Missing Reports
- Check `reconciliation-reports/` directory exists
- Verify write permissions
- Check disk space

## Related Scripts

- `src/scripts/diagnoseBinaryTree.ts` - Detailed binary tree diagnostics
- `src/scripts/fixBinaryTreeIssues.ts` - Automated fix script
- `src/scripts/fixUserCROWN000282.ts` - User-specific fixes

## API Integration

The reconciliation service can be integrated into admin APIs for on-demand reconciliation:

```typescript
import { generateReconciliationReport } from '../services/reconciliation.service';

// In admin controller
export const runReconciliation = asyncHandler(async (req, res) => {
  const { userId, maxUsers } = req.query;
  const reportPath = await generateReconciliationReport(
    userId as string,
    maxUsers ? parseInt(maxUsers as string) : undefined
  );
  res.json({ success: true, reportPath });
});
```
