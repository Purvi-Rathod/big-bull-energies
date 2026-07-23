# Big Bull Energies — Email setup

Transactional emails are sent through the **Elastic Email REST API** using **in-repo branded HTML templates** (no Elastic Email dashboard templates required).

## Required environment variables

Add these to `server/.env`:

```env
# Elastic Email API key (Settings → API in Elastic Email)
ELASTICMAIL_API_KEY=your_api_key_here

# Must be an address on a DOMAIN VERIFIED in Elastic Email
# Free mailboxes (gmail.com, yahoo.com, etc.) are usually REJECTED as From
ELASTIC_FROM_EMAIL=noreply@your-verified-domain.com

EMAIL_FROM_NAME=Big Bull Energies
SUPPORT_EMAIL=support@your-verified-domain.com

# Used for links inside emails
CLIENT_URL=https://your-frontend-domain.com
# FRONTEND_URL=https://your-frontend-domain.com
```

Optional aliases still accepted: `ELASTIC_API_KEY`, `EMAIL_FROM`, `EMAIL_USER`.

## Why emails were failing

1. **Missing `ELASTICMAIL_API_KEY`** — send throws and is soft-logged.
2. **Unverified From domain** — Elastic Email rejects From addresses like `…@gmail.com` unless that domain is verified.
3. **Dashboard templates missing** — the old path used `sendWithTemplate("SignupWelcome", …)` which fails if those templates were never created in Elastic Email. The app now sends self-contained HTML instead.

## Templates (automatic)

| Action | Template / function |
|--------|---------------------|
| User registration | `sendSignupWelcomeEmail` |
| Email verification / magic login | `sendEmailVerificationEmail` (same link flow as signup) |
| Password reset | `sendPasswordResetEmail` |
| Package purchase | `sendInvestmentPurchaseEmail` |
| Deposit (NOWPayments) | `sendDepositConfirmationEmail` |
| Withdrawal request / approve / reject | `sendWithdrawalCreated|Approved|RejectedEmail` |
| Referral income | `sendReferralIncomeEmail` |
| Binary income | `sendBinaryIncomeEmail` |
| Support tickets | `sendTicketCreatedEmail`, `sendTicketStatusUpdateEmail` |
| Vouchers | create / used / expired |
| Announcements | `sendAnnouncementEmail` |
| Contact form → support | branded HTML to `SUPPORT_EMAIL` |

## Test an email (admin)

```http
POST /api/v1/admin/email-templates/test
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "template": "SignupWelcome",
  "to": "you@example.com",
  "merge": { "name": "Alex", "userId": "BIGBULL-000001" }
}
```

Other template names: `EmailVerification`, `PackagePurchase`, `DepositConfirmation`, `WithdrawalCreated`, `WithdrawalApproved`, `WithdrawalRejected`, `PasswordReset`, `ReferralIncome`, `BinaryIncome`, `Announcement`, `TicketCreated`, `TicketStatusUpdate`, `VoucherCreated`, `VoucherUsed`, `VoucherExpired`, `CalculationFailure`.

## Elastic Email checklist

1. Create / verify a sending domain (DNS: SPF, DKIM, tracking as required).
2. Create an API key with send permission.
3. Set `ELASTIC_FROM_EMAIL` to an address on that domain (e.g. `noreply@bigbullenergies.com`).
4. Restart the API server after updating `.env`.
5. Send a test via the admin endpoint and check Elastic Email → Activity / Logs.
