# Diagnostic Report: User CROWN-000282

**Date:** February 1, 2026  
**User:** Fatma Toktemur (35ayfa35@gmail.com)  
**User ID:** CROWN-000282

---

## Executive Summary

**Issue Confirmed:** User created 15 payment requests, completed only 1 payment ($100), but system created 2 investments ($100 each = $200 total).

**Root Cause:** NOWPayments callback contains both `invoice_id` and `payment_id`. The system inconsistently uses these IDs, causing Investment #2 to be created with a `payment_id` that doesn't match any Payment record's `paymentId` field.

---

## Key Findings

### Payment Records Summary
- **Total Payment Records:** 15
- **Completed Payments:** 1
- **Pending/Processing Payments:** 14
- **Failed Payments:** 0
- **Total Amount Paid:** $100.00

### Investment Records Summary
- **Total Investments:** 2
- **Total Amount Invested:** $200.00
- **Investments With Linked Payments:** 1
- **Investments Without Linked Payments:** 1 ⚠️

---

## Detailed Analysis

### Payment #1 (COMPLETED) ✅
- **Order ID:** `INV_696a6aa43016bc95ba09f358_1769796700919_tnvxcno8a`
- **Payment ID (invoice_id):** `5205381421`
- **Status:** `completed`
- **Amount:** $100.00
- **Actually Paid:** $100.00
- **Created:** 2026-01-30T18:11:41.694Z
- **Completed:** 2026-01-30T18:22:14.029Z
- **Linked Investment:** Investment #1 ✅
- **Investment voucherId:** `5205381421` (matches invoice_id)

**Callback Data:**
```json
{
  "invoice_id": 5205381421,      // Used as paymentId in Payment record
  "payment_id": 5491768647,      // Different ID!
  "payment_status": "finished",
  "actually_paid": 100,
  "order_id": "INV_696a6aa43016bc95ba09f358_1769796700919_tnvxcno8a"
}
```

### Investment #1 ✅ (CORRECT)
- **Investment ID:** `697cf5a682fe7a7b2fe41bf9`
- **Amount:** $100.00
- **voucherId:** `5205381421` (matches Payment #1's invoice_id)
- **Created:** 2026-01-30T18:17:10.082Z
- **Linked Payment:** Payment #1 ✅
- **Status:** Active

**Issue:** Payment #1's `investmentId` field is set, but the match was found by `voucherId` instead of `investmentId`. This suggests the investment was created via callback handler, but the payment record wasn't updated with `investmentId` immediately.

### Investment #2 ⚠️ (ORPHANED - THE PROBLEM)
- **Investment ID:** `697cf58d82fe7a7b2fe41b8d`
- **Amount:** $100.00
- **voucherId:** `5491768647` ⚠️ **This is the payment_id from callback, NOT invoice_id!**
- **Created:** 2026-01-30T18:16:45.808Z (BEFORE Investment #1!)
- **Linked Payment:** NONE ❌
- **Status:** Active

**Critical Issue:** Investment #2 has `voucherId: 5491768647`, which is the `payment_id` from Payment #1's callback. However, Payment #1 stores `paymentId: 5205381421` (the `invoice_id`). This mismatch means Investment #2 cannot be linked to any Payment record.

---

## Root Cause Analysis

### The Problem Flow:

1. **User creates Payment #1** → System creates Payment record with:
   - `paymentId: 5205381421` (invoice_id from NOWPayments)

2. **User pays $100** → NOWPayments sends callback with:
   - `invoice_id: 5205381421`
   - `payment_id: 5491768647` ⚠️ **Different ID!**

3. **Callback Handler processes Payment #1:**
   - Finds Payment record by `order_id`
   - Creates Investment #1 with `voucherId: 5205381421` (invoice_id) ✅
   - Links Investment #1 to Payment #1

4. **BUT THEN:** Investment #2 is created with `voucherId: 5491768647` (payment_id)
   - This happens because the callback handler or success page uses `payment_id` instead of `invoice_id`
   - Investment #2 cannot be linked to Payment #1 because Payment #1's `paymentId` is `5205381421`, not `5491768647`

### Why Investment #2 Was Created:

Looking at the timestamps:
- **Investment #2 created:** 2026-01-30T18:16:45.808Z
- **Investment #1 created:** 2026-01-30T18:17:10.082Z
- **Payment #1 completed:** 2026-01-30T18:22:14.029Z

Investment #2 was created **BEFORE** Investment #1, which suggests:
1. The success page might have created Investment #2 using `payment_id` from callback data
2. OR the callback handler processed the callback twice (once with invoice_id, once with payment_id)
3. OR there was a race condition where both paths created investments

---

## Code Issue Location

**File:** `server/src/controllers/payment.controller.ts`

**Line 794-843:** The callback handler uses:
```typescript
const txnId = callback.payment_id || invoiceId || payment.paymentId;
```

This prioritizes `payment_id` over `invoice_id`, but the Payment record stores `invoice_id` as `paymentId`. This causes a mismatch.

**Line 618 (investment.service.ts):** Investment stores:
```typescript
voucherId: voucherId || paymentId, // Store voucherId if provided, otherwise paymentId
```

So if `paymentId` is `5491768647` (payment_id) but Payment record has `paymentId: 5205381421` (invoice_id), they won't match.

---

## Impact Assessment

### Financial Impact:
- **User paid:** $100.00
- **User received investments:** $200.00
- **Discrepancy:** $100.00 (one extra investment)

### System Impact:
- Investment #2 is "orphaned" - no Payment record links to it
- User sees 2 investments in UI, but only 1 payment was made
- Database integrity issue: Payment records don't match Investment records

---

## Recommendations

### Immediate Actions:

1. **Fix Investment #2:**
   - Option A: Delete Investment #2 (if it was created incorrectly)
   - Option B: Link Investment #2 to Payment #1 by updating its `voucherId` to `5205381421`
   - Option C: Create a Payment record for Investment #2 if it represents a valid payment

2. **Investigate why Investment #2 was created:**
   - Check logs around 2026-01-30T18:16:45 to see what triggered Investment #2 creation
   - Verify if success page or callback handler created it

### Code Fixes (Future):

1. **Standardize ID Usage:**
   - Always use `invoice_id` as the primary identifier (stored in Payment.paymentId)
   - Use `payment_id` only for tracking, not for linking investments

2. **Fix Callback Handler:**
   ```typescript
   // Use invoice_id consistently, not payment_id
   const txnId = callback.invoice_id || payment.paymentId;
   ```

3. **Add Duplicate Prevention:**
   - Check for existing investments by BOTH invoice_id AND payment_id before creating
   - Ensure atomic operations when creating investments

4. **Update Success Page:**
   - Use `invoice_id` from payment record, not `payment_id` from callback data

---

## Conclusion

The issue is caused by NOWPayments sending two different IDs (`invoice_id` and `payment_id`) in callbacks, and the system inconsistently using them. Investment #2 was created with `payment_id` (5491768647) but cannot be linked to Payment #1 which stores `invoice_id` (5205381421) as its `paymentId`.

**System Status:** ⚠️ **Needs Fix** - One orphaned investment exists that doesn't match any payment record.

---

## Files Generated

- **Text Report:** `server/diagnostic-reports/diagnostic-CROWN-000282-1769944111615.txt`
- **JSON Data:** `server/diagnostic-reports/diagnostic-CROWN-000282-1769944111616.json`

---

**Report Generated:** February 1, 2026  
**Diagnostic Script:** `server/src/scripts/diagnoseUserPayments.ts`
