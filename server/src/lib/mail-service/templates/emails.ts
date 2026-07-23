/**
 * Big Bull Energies — transactional email HTML builders
 */

import {
  clientBaseUrl,
  renderBrandedEmail,
  supportEmail,
} from "./layout";

export function signupWelcomeHtml(p: {
  name: string;
  userId: string;
  loginLink: string;
}): string {
  return renderBrandedEmail({
    preview: "Welcome to Big Bull Energies — verify and open your portal",
    title: "Welcome aboard",
    greetingName: p.name,
    intro:
      "Your Big Bull Energies member account has been created. Verify your email and open the portal with the secure button below.",
    details: [{ label: "Member ID", value: p.userId }],
    highlight: { label: "Your Member ID", value: p.userId },
    cta: { label: "Verify email & open portal", url: p.loginLink },
    note: "This secure link expires in 24 hours. If you did not create this account, you can ignore this email.",
  });
}

export function emailVerificationHtml(p: {
  name: string;
  userId: string;
  verifyLink: string;
}): string {
  return renderBrandedEmail({
    preview: "Verify your Big Bull Energies email address",
    title: "Verify your email",
    greetingName: p.name,
    intro:
      "Please confirm your email address to activate full access to your Big Bull Energies portal.",
    details: [{ label: "Member ID", value: p.userId }],
    cta: { label: "Verify email", url: p.verifyLink },
    note: "If you did not register, no action is needed.",
  });
}

export function passwordResetHtml(p: {
  name: string;
  resetLink: string;
}): string {
  return renderBrandedEmail({
    preview: "Reset your Big Bull Energies password",
    title: "Password reset request",
    greetingName: p.name,
    intro:
      "We received a request to reset your password. Click below to choose a new one. If you did not request this, you can safely ignore this message.",
    cta: { label: "Reset password", url: p.resetLink },
    note: "For security, this link expires soon and can only be used once.",
  });
}

export function packagePurchaseHtml(p: {
  name: string;
  userId?: string;
  packageName: string;
  investmentAmount: number;
  duration: number;
  totalOutputPct: number;
  startDate: string;
  endDate: string;
  dashboardLink: string;
}): string {
  return renderBrandedEmail({
    preview: `Package confirmed — ${p.packageName}`,
    title: "Package purchase confirmed",
    greetingName: p.name,
    intro:
      "Your wind-energy investment package is now active. Daily ROI and network eligibility follow your plan rules.",
    highlight: {
      label: "Invested amount",
      value: `$${p.investmentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    details: [
      ...(p.userId ? [{ label: "Member ID", value: p.userId }] : []),
      { label: "Package", value: p.packageName },
      { label: "Duration", value: `${p.duration} days` },
      { label: "Total output", value: `${p.totalOutputPct}%` },
      { label: "Start date", value: p.startDate },
      { label: "End date", value: p.endDate },
    ],
    cta: { label: "View investments", url: p.dashboardLink },
  });
}

export function depositConfirmationHtml(p: {
  name: string;
  amount: number;
  currency?: string;
  paymentId?: string;
  method?: string;
  dashboardLink: string;
}): string {
  return renderBrandedEmail({
    preview: `Deposit received — $${p.amount.toFixed(2)}`,
    title: "Deposit confirmed",
    greetingName: p.name,
    intro:
      "We have successfully received your payment. Funds are reflected according to your selected package or voucher flow.",
    highlight: {
      label: "Amount received",
      value: `$${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${p.currency || "USD"}`,
    },
    details: [
      ...(p.method ? [{ label: "Method", value: p.method }] : []),
      ...(p.paymentId ? [{ label: "Payment ID", value: p.paymentId }] : []),
    ],
    cta: { label: "Open dashboard", url: p.dashboardLink },
  });
}

export function withdrawalCreatedHtml(p: {
  name: string;
  amount: number;
  charges: number;
  finalAmount: number;
  walletType: string;
  withdrawalId: string;
  dashboardLink: string;
}): string {
  return renderBrandedEmail({
    preview: `Withdrawal request submitted — $${p.amount.toFixed(2)}`,
    title: "Withdrawal request submitted",
    greetingName: p.name,
    intro:
      "Your withdrawal request is under review. You will receive another email when it is approved or updated.",
    highlight: {
      label: "Requested amount",
      value: `$${p.amount.toFixed(2)}`,
    },
    details: [
      { label: "Wallet", value: p.walletType },
      { label: "Charges", value: `$${p.charges.toFixed(2)}` },
      { label: "You receive", value: `$${p.finalAmount.toFixed(2)}` },
      { label: "Request ID", value: p.withdrawalId },
    ],
    cta: { label: "Track withdrawal", url: p.dashboardLink },
  });
}

export function withdrawalApprovedHtml(p: {
  name: string;
  amount: number;
  charges: number;
  finalAmount: number;
  walletType: string;
  withdrawalId: string;
  transactionId: string;
  dashboardLink: string;
}): string {
  return renderBrandedEmail({
    preview: `Withdrawal approved — $${p.finalAmount.toFixed(2)}`,
    title: "Withdrawal approved",
    greetingName: p.name,
    intro:
      "Good news — your withdrawal has been approved and is being processed to your registered payout wallet.",
    highlight: {
      label: "Net payout",
      value: `$${p.finalAmount.toFixed(2)}`,
    },
    details: [
      { label: "Wallet", value: p.walletType },
      { label: "Gross amount", value: `$${p.amount.toFixed(2)}` },
      { label: "Charges", value: `$${p.charges.toFixed(2)}` },
      { label: "Request ID", value: p.withdrawalId },
      { label: "Transaction ID", value: p.transactionId },
    ],
    cta: { label: "View history", url: p.dashboardLink },
  });
}

export function withdrawalRejectedHtml(p: {
  name: string;
  amount: number;
  charges: number;
  finalAmount: number;
  walletType: string;
  withdrawalId: string;
  reason?: string;
  dashboardLink: string;
}): string {
  return renderBrandedEmail({
    preview: `Withdrawal update — request not approved`,
    title: "Withdrawal request not approved",
    greetingName: p.name,
    intro:
      "Your withdrawal request could not be approved at this time. Funds remain in your wallet unless otherwise noted.",
    details: [
      { label: "Amount", value: `$${p.amount.toFixed(2)}` },
      { label: "Wallet", value: p.walletType },
      { label: "Request ID", value: p.withdrawalId },
      { label: "Reason", value: p.reason || "Not specified — contact support for details" },
    ],
    cta: { label: "Open withdrawals", url: p.dashboardLink },
  });
}

export function referralIncomeHtml(p: {
  name: string;
  amount: number;
  fromUserName?: string;
  fromUserId?: string;
  packageName?: string;
  dashboardLink: string;
}): string {
  return renderBrandedEmail({
    preview: `Referral income credited — $${p.amount.toFixed(2)}`,
    title: "Referral income credited",
    greetingName: p.name,
    intro:
      "A referral bonus has been added to your Referral wallet after a package activation in your direct network.",
    highlight: {
      label: "Referral bonus",
      value: `$${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    details: [
      ...(p.fromUserName || p.fromUserId
        ? [
            {
              label: "From member",
              value: [p.fromUserName, p.fromUserId].filter(Boolean).join(" · "),
            },
          ]
        : []),
      ...(p.packageName ? [{ label: "Related package", value: p.packageName }] : []),
      { label: "Wallet", value: "Referral" },
    ],
    cta: { label: "View wallets", url: p.dashboardLink },
  });
}

export function binaryIncomeHtml(p: {
  name: string;
  amount: number;
  matchedVolume?: number;
  dashboardLink: string;
}): string {
  return renderBrandedEmail({
    preview: `Binary income credited — $${p.amount.toFixed(2)}`,
    title: "Binary income credited",
    greetingName: p.name,
    intro:
      "Your daily binary matching bonus has been credited to your Binary wallet.",
    highlight: {
      label: "Binary bonus",
      value: `$${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    details: [
      ...(p.matchedVolume !== undefined
        ? [{ label: "Matched volume", value: `$${p.matchedVolume.toFixed(2)}` }]
        : []),
      { label: "Wallet", value: "Binary" },
    ],
    cta: { label: "View binary report", url: p.dashboardLink },
  });
}

export function ticketCreatedHtml(p: {
  name: string;
  ticketId: string;
  subject: string;
  department: string;
}): string {
  const ticketsUrl = `${clientBaseUrl()}/tickets`;
  return renderBrandedEmail({
    preview: `Support ticket created — ${p.subject}`,
    title: "Support ticket received",
    greetingName: p.name,
    intro:
      "We have received your support request. Our team will respond as soon as possible.",
    details: [
      { label: "Ticket ID", value: p.ticketId },
      { label: "Subject", value: p.subject },
      { label: "Department", value: p.department },
    ],
    cta: { label: "View ticket", url: ticketsUrl },
  });
}

export function ticketStatusUpdateHtml(p: {
  name: string;
  ticketId: string;
  subject: string;
  oldStatus: string;
  newStatus: string;
  reply?: string;
}): string {
  const ticketsUrl = `${clientBaseUrl()}/tickets`;
  return renderBrandedEmail({
    preview: `Ticket update — ${p.subject}`,
    title: "Support ticket updated",
    greetingName: p.name,
    intro: "There is an update on your support ticket.",
    details: [
      { label: "Ticket ID", value: p.ticketId },
      { label: "Subject", value: p.subject },
      { label: "Previous status", value: p.oldStatus },
      { label: "New status", value: p.newStatus },
      ...(p.reply ? [{ label: "Reply", value: p.reply }] : []),
    ],
    cta: { label: "Open tickets", url: ticketsUrl },
  });
}

export function voucherCreatedHtml(p: {
  name: string;
  voucherId: string;
  amount: number;
  investmentValue: number;
  expiryDate: string;
  dashboardLink: string;
  source?: string;
}): string {
  return renderBrandedEmail({
    preview: `Voucher ready — ${p.voucherId}`,
    title: "Voucher created",
    greetingName: p.name,
    intro: "A new investment voucher is available in your account.",
    highlight: {
      label: "Voucher value",
      value: `$${p.investmentValue.toFixed(2)}`,
    },
    details: [
      { label: "Voucher ID", value: p.voucherId },
      { label: "Paid amount", value: `$${p.amount.toFixed(2)}` },
      { label: "Expires", value: p.expiryDate },
      { label: "Source", value: p.source || "wallet" },
    ],
    cta: { label: "View vouchers", url: p.dashboardLink },
  });
}

export function voucherUsedHtml(p: {
  name: string;
  voucherId: string;
  amount: number;
  investmentValue: number;
  usedBy: string;
  dashboardLink: string;
}): string {
  return renderBrandedEmail({
    preview: `Voucher used — ${p.voucherId}`,
    title: "Voucher used",
    greetingName: p.name,
    intro: "Your voucher has been applied to an investment package.",
    details: [
      { label: "Voucher ID", value: p.voucherId },
      { label: "Amount", value: `$${p.amount.toFixed(2)}` },
      { label: "Investment value", value: `$${p.investmentValue.toFixed(2)}` },
      { label: "Used by", value: p.usedBy },
    ],
    cta: { label: "View investments", url: p.dashboardLink },
  });
}

export function voucherExpiredHtml(p: {
  name: string;
  voucherId: string;
  amount: number;
  investmentValue: number;
  expiryDate: string;
  dashboardLink: string;
}): string {
  return renderBrandedEmail({
    preview: `Voucher expired — ${p.voucherId}`,
    title: "Voucher expired",
    greetingName: p.name,
    intro: "The following voucher has expired and can no longer be used.",
    details: [
      { label: "Voucher ID", value: p.voucherId },
      { label: "Amount", value: `$${p.amount.toFixed(2)}` },
      { label: "Investment value", value: `$${p.investmentValue.toFixed(2)}` },
      { label: "Expired on", value: p.expiryDate },
    ],
    cta: { label: "Browse plans", url: p.dashboardLink },
  });
}

export function announcementHtml(p: {
  name?: string;
  headline: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  return renderBrandedEmail({
    preview: p.headline,
    title: p.headline,
    greetingName: p.name,
    intro: p.body,
    cta:
      p.ctaLabel && p.ctaUrl
        ? { label: p.ctaLabel, url: p.ctaUrl }
        : undefined,
    footerNote: `You are receiving this announcement as a Big Bull Energies member. Contact ${supportEmail()} for help.`,
  });
}

export function calculationFailureHtml(p: {
  jobId: string;
  jobType: string;
  error: string;
  processedItems: number;
  totalItems: number;
  progressPct: number;
  adminLink: string;
}): string {
  return renderBrandedEmail({
    preview: `Calculation job failed — ${p.jobType}`,
    title: "Calculation job failed",
    intro: "A background calculation job reported a failure and needs attention.",
    details: [
      { label: "Job ID", value: p.jobId },
      { label: "Type", value: p.jobType },
      { label: "Progress", value: `${p.processedItems}/${p.totalItems} (${p.progressPct}%)` },
      { label: "Error", value: p.error },
    ],
    cta: { label: "Open admin settings", url: p.adminLink },
  });
}

/** Contact form notification to support inbox */
export function contactInquiryHtml(p: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): string {
  return renderBrandedEmail({
    preview: `Website inquiry — ${p.subject}`,
    title: "New website inquiry",
    intro: "A visitor submitted the contact form on Big Bull Energies.",
    details: [
      { label: "Name", value: p.name },
      { label: "Email", value: p.email },
      ...(p.phone ? [{ label: "Phone", value: p.phone }] : []),
      { label: "Subject", value: p.subject },
      { label: "Message", value: p.message },
    ],
  });
}
