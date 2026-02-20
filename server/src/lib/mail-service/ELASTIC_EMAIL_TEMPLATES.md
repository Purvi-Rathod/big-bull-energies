# Elastic Email Pre-built Templates

Create these **transactional templates** in your Elastic Email dashboard. Use the exact **template name** and **merge fields** (single braces `{name}`) so the API can send with merge data.

---

## 1. SignupWelcome

**Subject (can be overridden by API):** Welcome to CROWN - Your Account is Ready!

| Merge field | Description        | Use in template |
|-------------|--------------------|-----------------|
| `{name}`    | User's name        | e.g. "Thank you, {name}!" |
| `{userId}`  | e.g. CROWN-000123  | Display as text only (User ID) |
| `{loginLink}` | Full login/verify URL | **Use for links** (e.g. Verify Email button) |

**Important:** The "Verify Email" or "Login" link must use `href="{loginLink}"`, not `{userId}`. `userId` is a code like CROWN-000123; `loginLink` is the actual URL.

Example header/link in your HTML:
```html
<h1>Thank you for registering, {name}!</h1>
<p>We're excited to have you on board.</p>
<a href="{loginLink}" target="_blank">Verify Email</a>
<p>Your User ID: {userId}</p>
```

---

## 2. InvestmentConfirmation

**Subject:** Investment Confirmation - {packageName}

| Merge field | Description        |
|-------------|--------------------|
| `{userId}`  | User ID (e.g. CROWN-000123) |
| `{amount}`  | Package amount (investment amount) |
| `{package}` | Package name       |
| `{date}`    | Date of purchase   |
| `{name}`    | User's name        |
| `{packageName}` | Package name   |
| `{investmentAmount}` | Number    |
| `{duration}` | Days              |
| `{totalOutputPct}` | e.g. 225        |
| `{startDate}` | Date string     |
| `{endDate}` | Date string       |
| `{dashboardLink}` | URL to dashboard |

---

## 3. WithdrawalCreated

**Subject:** Withdrawal Request Submitted - $X.XX

| Merge field | Description        |
|-------------|--------------------|
| `{name}`    | User's name        |
| `{amount}`  | Requested amount   |
| `{charges}` | Fee amount        |
| `{finalAmount}` | After charges  |
| `{walletType}` | e.g. roi, referral |
| `{withdrawalId}` | ID              |
| `{dashboardLink}` | URL             |

---

## 4. WithdrawalApproved

**Subject:** Withdrawal Approved - $X.XX

| Merge field | Description        |
|-------------|--------------------|
| `{name}`    | User's name        |
| `{amount}`  | Amount             |
| `{charges}` | Fee                |
| `{finalAmount}` | Net amount     |
| `{walletType}` | Wallet type     |
| `{withdrawalId}` | ID              |
| `{transactionId}` | Transaction ID |
| `{dashboardLink}` | URL             |

---

## 5. WithdrawalRejected

**Subject:** Withdrawal Request Rejected - $X.XX

| Merge field | Description        |
|-------------|--------------------|
| `{name}`    | User's name        |
| `{amount}`  | Amount             |
| `{charges}` | Fee                |
| `{finalAmount}` | Net amount     |
| `{walletType}` | Wallet type     |
| `{withdrawalId}` | ID              |
| `{reason}`  | Rejection reason (may be empty) |
| `{dashboardLink}` | URL             |

---

## 6. PasswordReset

**Subject:** Reset Your Password - CROWN

| Merge field | Description        |
|-------------|--------------------|
| `{name}`    | User's name        |
| `{resetLink}` | Password reset URL |

---

## 7. TicketCreated

**Subject:** Support Ticket Created - {subject}

| Merge field | Description        |
|-------------|--------------------|
| `{name}`    | User's name        |
| `{ticketId}` | Ticket ID        |
| `{subject}` | Ticket subject     |
| `{department}` | Department      |

---

## 8. TicketStatusUpdate

**Subject:** Ticket Status Updated - {subject}

| Merge field | Description        |
|-------------|--------------------|
| `{name}`    | User's name        |
| `{ticketId}` | Ticket ID        |
| `{subject}` | Ticket subject     |
| `{oldStatus}` | Previous status  |
| `{newStatus}` | New status       |
| `{reply}`   | Admin reply (may be empty) |

---

## 9. VoucherCreated

**Subject:** Voucher Created - {voucherId}

| Merge field | Description        |
|-------------|--------------------|
| `{name}`    | User's name        |
| `{voucherId}` | Voucher ID      |
| `{amount}`  | Amount             |
| `{investmentValue}` | Value for investment |
| `{expiryDate}` | Expiry date    |
| `{dashboardLink}` | URL             |
| `{source}`  | wallet or payment  |

---

## 10. VoucherUsed

**Subject:** Voucher Used - {voucherId}

| Merge field | Description        |
|-------------|--------------------|
| `{name}`    | User's name        |
| `{voucherId}` | Voucher ID      |
| `{amount}`  | Amount             |
| `{investmentValue}` | Value          |
| `{usedBy}`  | Who used it        |
| `{dashboardLink}` | URL             |

---

## 11. VoucherExpired

**Subject:** Voucher Expired - {voucherId}

| Merge field | Description        |
|-------------|--------------------|
| `{name}`    | User's name        |
| `{voucherId}` | Voucher ID      |
| `{amount}`  | Amount             |
| `{investmentValue}` | Value          |
| `{expiryDate}` | Expiry date    |
| `{dashboardLink}` | URL             |

---

## 12. CalculationFailure

**Subject:** ⚠️ Calculation Job Failed - {jobType}

| Merge field | Description        |
|-------------|--------------------|
| `{jobId}`   | Job ID             |
| `{jobType}` | Type of job        |
| `{error}`   | Error message      |
| `{processedItems}` | Count        |
| `{totalItems}` | Total count     |
| `{progressPct}` | Progress %      |
| `{adminLink}` | Admin panel URL  |

---

## Creating templates in Elastic Email

1. Go to **Transactional Emails** (or **Email Templates**) in Elastic Email.
2. Create a new template for each name above (e.g. **SignupWelcome**, **InvestmentConfirmation**).
3. In the template body, use **single braces** for merge fields: `{name}`, `{loginLink}`, etc.
4. Save and ensure the **template name** matches exactly (case-sensitive).

The API sends merge values as `merge_name`, `merge_loginLink`, etc.; Elastic Email replaces `{name}`, `{loginLink}` in the template with those values.
