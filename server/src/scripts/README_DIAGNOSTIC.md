# Diagnostic Script: User Payment and Investment Analysis

## Overview

This script analyzes NOWPayments payment records and investments for a specific user to diagnose duplicate payment/investment issues.

## Prerequisites

1. Ensure dependencies are installed:
   ```bash
   cd /Users/mayanksahu/Desktop/binary_system/server
   npm install
   ```

2. Ensure MongoDB is accessible and `.env` file is configured with `MONGODB_URL_DEVELOPMENT`

## Usage

### Run the diagnostic script:

```bash
cd /Users/mayanksahu/Desktop/binary_system/server
npx ts-node -r dotenv/config src/scripts/diagnoseUserPayments.ts 000282
```

Or if you have npm scripts configured:

```bash
npm run diagnose:payments 000282
```

(Note: You may need to add this script to package.json)

### Alternative: Direct execution

If `npx` doesn't work, try:

```bash
cd /Users/mayanksahu/Desktop/binary_system/server
node_modules/.bin/ts-node -r dotenv/config src/scripts/diagnoseUserPayments.ts 000282
```

## What the Script Does

1. **Connects to MongoDB** using connection string from `.env`
2. **Finds user** by userId (e.g., "000282")
3. **Retrieves all Payment records** for that user
4. **Retrieves all Investment records** for that user
5. **Analyzes relationships** between payments and investments
6. **Identifies issues**:
   - Duplicate paymentIds
   - Duplicate investment voucherIds
   - Payments without linked investments
   - Investments without linked payments
   - Amount discrepancies
7. **Generates reports**:
   - Text report: `diagnostic-reports/diagnostic-{userId}-{timestamp}.txt`
   - JSON data: `diagnostic-reports/diagnostic-{userId}-{timestamp}.json`

## Output

The script generates:

1. **Console output** - Summary and key findings
2. **Text report** - Detailed analysis in readable format
3. **JSON file** - Machine-readable data for further analysis

## Example Output

```
================================================================================
NOWPAYMENTS DIAGNOSTIC REPORT
================================================================================
Generated: 2026-02-01T12:00:00.000Z
User ID: 000282
User Name: John Doe
User Email: john@example.com

────────────────────────────────────────────────────────────────────────────────
SUMMARY
────────────────────────────────────────────────────────────────────────────────
Total Payment Records: 5
Total Investment Records: 2
Completed Payments: 1
Pending Payments: 3
Failed Payments: 1
Payments With Investments: 1
Payments Without Investments: 0
Investments With Payments: 2
Investments Without Payments: 0
Duplicate Payment IDs: 1
Duplicate Investment voucherIds: 1
Total Amount Paid: $100.00
Total Amount Invested: $200.00

⚠️ DISCREPANCIES:
  - Amount mismatch: Paid $100.00 but invested $200.00
  - Payment count mismatch: 1 completed payments but 2 investments
```

## Troubleshooting

### Error: Cannot find module 'dotenv/config'
- Ensure `dotenv` is installed: `npm install dotenv`
- Or run without the `-r dotenv/config` flag if you've configured dotenv.config() in the script

### Error: Cannot connect to MongoDB
- Check `.env` file has `MONGODB_URL_DEVELOPMENT` set correctly
- Verify MongoDB is running and accessible
- Check network/firewall settings

### Error: User not found
- Verify the userId exists in the database
- Check userId format (e.g., "000282" vs "CROWN-000282")

## Files Created

Reports are saved in: `server/diagnostic-reports/`

- `diagnostic-{userId}-{timestamp}.txt` - Human-readable report
- `diagnostic-{userId}-{timestamp}.json` - JSON data for programmatic analysis
