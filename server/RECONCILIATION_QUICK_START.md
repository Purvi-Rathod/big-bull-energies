# Reconciliation Service - Quick Start Guide

## What It Does

The Reconciliation Service is a comprehensive daily diagnostic tool that automatically checks:
- ✅ **Wallets** - Balance consistency, transaction integrity
- ✅ **Binary Tree** - Business volume, downlines, carry forward
- ✅ **Investments** - Active/inactive status, amounts, dates
- ✅ **Career Rewards** - Eligibility, payments, consistency
- ✅ **Transactions** - Duplicates, integrity, balance consistency

## Quick Commands

### Run Reconciliation for All Users
```bash
npm run reconcile
```

### Run Reconciliation for Specific User
```bash
npm run reconcile:user CROWN-000282
```

### Diagnose Binary Tree (Detailed)
```bash
npm run diagnose:binary-tree CROWN-000282
```

### Fix Binary Tree Issues (Automated)
```bash
npm run fix:binary-tree
```

## Daily Automation

### Enable Daily Reconciliation (2:00 AM UTC)

Edit `server/src/index.ts`:

```typescript
// Uncomment this line:
reconciliationCron.start();
```

### Manual Daily Run

```bash
npx ts-node -r dotenv/config src/cron/reconciliation-cron.ts
```

## Report Location

All reports are saved to: `server/reconciliation-reports/`

Format: `reconciliation-{userId|all}-{timestamp}.txt`

## Understanding Reports

### Severity Levels

- **❌ ERROR**: Critical issues requiring immediate attention
- **⚠️ WARNING**: Issues that should be reviewed
- **ℹ️ INFO**: Informational items

### Common Issues & Fixes

1. **Wallet Balance Mismatch**
   - Issue: Stored balance doesn't match calculated from transactions
   - Fix: Recalculate wallet balance

2. **Binary Volume Mismatch**
   - Issue: Stored business volume doesn't match expected from investments
   - Fix: Run `npm run fix:binary-tree` or update manually

3. **Matched Exceeds Business**
   - Issue: leftMatched/rightMatched > leftBusiness/rightBusiness
   - Fix: Recalculate matched and carry forward

4. **Expired Investment Still Active**
   - Issue: Investment past endDate but isActive = true
   - Fix: Deactivate investment

5. **Missing Career Reward**
   - Issue: User eligible but reward not awarded
   - Fix: Award career level reward

## Example Workflow

```bash
# 1. Run daily reconciliation
npm run reconcile

# 2. Review report
cat reconciliation-reports/reconciliation-all-*.txt

# 3. If issues found, diagnose specific user
npm run diagnose:binary-tree CROWN-000282

# 4. Fix issues automatically (if fix script available)
npm run fix:binary-tree

# 5. Verify fixes
npm run reconcile:user CROWN-000282
```

## Integration with Existing Scripts

The reconciliation service integrates with:
- `diagnoseBinaryTree.ts` - Uses same calculation logic
- `fixBinaryTreeIssues.ts` - Can auto-fix detected issues
- `recalculateDownlines.ts` - Can fix downline count issues

## Best Practices

1. **Run Daily**: Schedule at 2:00 AM (low traffic)
2. **Review Errors First**: Address critical errors immediately
3. **Track Trends**: Monitor issue counts over time
4. **Test Fixes**: Always verify fixes with another reconciliation run
5. **Document Actions**: Keep track of manual fixes applied

## Support

For detailed documentation, see: `RECONCILIATION_SERVICE.md`
