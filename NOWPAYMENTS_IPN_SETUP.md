# NOWPayments IPN Configuration Guide

## Step-by-Step Configuration

### 1. **Your IPN Secret Key**

**Action:** Copy the IPN secret key shown (e.g., `9rZh...NDp2`)

**What to do:**
- Copy the full IPN secret key from the NOWPayments dashboard
- Add it to your `.env` file as:
  ```
  NOWPAYMENTS_IPN_SECRET=your_full_secret_key_here
  ```
- **DO NOT** regenerate the key unless you update your `.env` file accordingly
- This key is used to verify that webhooks are actually coming from NOWPayments (security)

**Important:** Keep this secret key secure and never commit it to version control!

---

### 2. **Webhook URL**

**Current URL in dashboard:** `https://api.crownbankers.com/api/v1/payment`

**Action:** Update it to:
```
https://api.crownbankers.com/api/v1/payment/callback
```

**Why:** The callback route in our system is `/api/v1/payment/callback`, not just `/api/v1/payment`

**Steps:**
1. Replace the URL in the "Webhook URL" field with: `https://api.crownbankers.com/api/v1/payment/callback`
2. Click the **"Save"** button
3. Verify the URL is saved correctly

---

### 3. **Set up Recurring Notifications**

**Recommended Settings:**
- **Number of notifications:** `3`
- **Minute intervals:** `5`

**What this does:**
- If the initial webhook fails to reach your server, NOWPayments will retry
- It will send 3 additional notifications at 5-minute intervals
- This ensures you don't miss payment confirmations even if there's a temporary network issue

**Configuration:**
- Click the `+` button to set notifications to `3`
- Click the `+` button to set intervals to `5` minutes
- This is optional but recommended for reliability

---

### 4. **Choose Webhook Format**

**Select:** **"All-Strings"** ✅

**Why:**
- Our code handles all data as strings/numbers flexibly
- "All-Strings" format is simpler and more consistent
- Easier to parse and handle in JavaScript/TypeScript
- Prevents type conversion issues

**Action:** Select the radio button for **"All-Strings"**

---

## Summary Checklist

- [ ] Copy IPN secret key and add to `.env` as `NOWPAYMENTS_IPN_SECRET`
- [ ] Update Webhook URL to: `https://api.crownbankers.com/api/v1/payment/callback`
- [ ] Click "Save" button
- [ ] Set recurring notifications to 3 notifications at 5-minute intervals (optional)
- [ ] Select "All-Strings" webhook format
- [ ] Restart your server after adding `NOWPAYMENTS_IPN_SECRET` to `.env`

---

## Environment Variables Required

Add these to your `.env` file:

```env
NOWPAYMENTS_API_KEY=your_api_key_here
NOWPAYMENTS_IPN_SECRET=your_ipn_secret_key_here
NOWPAYMENTS_CALLBACK_URL=https://api.crownbankers.com/api/v1/payment/callback
API_URL=https://api.crownbankers.com
```

---

## Testing

After configuration:

1. **Test Payment:** Create a test payment through your system
2. **Check Logs:** Look for these log messages:
   ```
   [NOWPayments Callback] Received callback at ...
   [NOWPayments] Webhook signature verified successfully
   [NOWPayments Callback] Callback verified. Payment ID: ...
   ```
3. **Verify Investment:** Check that the investment is automatically created

---

## Troubleshooting

**If callbacks aren't received:**
1. Verify the Webhook URL is exactly: `https://api.crownbankers.com/api/v1/payment/callback`
2. Check that your server is accessible from the internet (not just localhost)
3. Check server logs for CORS errors
4. Verify `NOWPAYMENTS_IPN_SECRET` is set correctly in `.env`

**If signature verification fails:**
1. Ensure `NOWPAYMENTS_IPN_SECRET` matches the one in NOWPayments dashboard
2. Check that you copied the full secret key (not truncated)
3. Restart your server after adding the secret to `.env`
