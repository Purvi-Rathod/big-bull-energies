/**
 * Email Service — Big Bull Energies
 * Sends branded HTML emails via Elastic Email API (in-repo templates).
 *
 * Required env:
 *   ELASTICMAIL_API_KEY (or ELASTIC_API_KEY)
 *   ELASTIC_FROM_EMAIL  — address on a domain verified in Elastic Email
 * Optional:
 *   EMAIL_FROM_NAME, SUPPORT_EMAIL, CLIENT_URL / FRONTEND_URL
 */

import { sendEmail } from "./elastic-email";
import { clientBaseUrl } from "./templates/layout";
import * as T from "./templates/emails";

const FROM_NAME = () =>
  process.env.EMAIL_FROM_NAME || "Big Bull Energies";

/**
 * Prefer a verified sending domain. Do not default to Gmail — Elastic rejects it.
 */
export const defaultFrom = (): string => {
  const from =
    process.env.ELASTIC_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER ||
    process.env.SUPPORT_EMAIL;

  if (!from) {
    throw new Error(
      "No from-address configured. Set ELASTIC_FROM_EMAIL to an address on your Elastic Email verified domain.",
    );
  }
  return from.trim();
};

async function dispatch(options: {
  to: string;
  subject: string;
  html: string;
  label: string;
}): Promise<void> {
  try {
    await sendEmail({
      from: defaultFrom(),
      fromName: FROM_NAME(),
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`✅ ${options.label} email sent to ${options.to}`);
  } catch (error: any) {
    console.error(
      `❌ Failed to send ${options.label} email to ${options.to}:`,
      error?.message || error,
    );
  }
}

export const sendSignupWelcomeEmail = async (p: {
  to: string;
  name: string;
  userId: string;
  loginLink: string;
}): Promise<void> => {
  await dispatch({
    to: p.to,
    subject: "Welcome to Big Bull Energies — your account is ready",
    html: T.signupWelcomeHtml(p),
    label: "Signup welcome",
  });
};

/** Same secure link flow used at registration (acts as email verification / magic login). */
export const sendEmailVerificationEmail = async (p: {
  to: string;
  name: string;
  userId: string;
  verifyLink: string;
}): Promise<void> => {
  await dispatch({
    to: p.to,
    subject: "Verify your email — Big Bull Energies",
    html: T.emailVerificationHtml(p),
    label: "Email verification",
  });
};

export const sendInvestmentPurchaseEmail = async (p: {
  to: string;
  name: string;
  packageName: string;
  investmentAmount: number;
  duration: number;
  totalOutputPct: number;
  startDate: string;
  endDate: string;
  dashboardLink: string;
  userId?: string;
}): Promise<void> => {
  await dispatch({
    to: p.to,
    subject: `Package confirmed — ${p.packageName}`,
    html: T.packagePurchaseHtml(p),
    label: "Package purchase",
  });
};

export const sendDepositConfirmationEmail = async (p: {
  to: string;
  name: string;
  amount: number;
  currency?: string;
  paymentId?: string;
  method?: string;
  dashboardLink?: string;
}): Promise<void> => {
  await dispatch({
    to: p.to,
    subject: `Deposit confirmed — $${p.amount.toFixed(2)}`,
    html: T.depositConfirmationHtml({
      ...p,
      dashboardLink: p.dashboardLink || `${clientBaseUrl()}/dashboard`,
    }),
    label: "Deposit confirmation",
  });
};

export const sendWithdrawalCreatedEmail = async (p: {
  to: string;
  name: string;
  amount: number;
  charges: number;
  finalAmount: number;
  walletType: string;
  withdrawalId: string;
  dashboardLink: string;
}): Promise<void> => {
  await dispatch({
    to: p.to,
    subject: `Withdrawal request submitted — $${p.amount.toFixed(2)}`,
    html: T.withdrawalCreatedHtml(p),
    label: "Withdrawal created",
  });
};

export const sendWithdrawalApprovedEmail = async (p: {
  to: string;
  name: string;
  amount: number;
  charges: number;
  finalAmount: number;
  walletType: string;
  withdrawalId: string;
  transactionId: string;
  dashboardLink: string;
}): Promise<void> => {
  await dispatch({
    to: p.to,
    subject: `Withdrawal approved — $${p.finalAmount.toFixed(2)}`,
    html: T.withdrawalApprovedHtml(p),
    label: "Withdrawal approved",
  });
};

export const sendWithdrawalRejectedEmail = async (p: {
  to: string;
  name: string;
  amount: number;
  charges: number;
  finalAmount: number;
  walletType: string;
  withdrawalId: string;
  reason?: string;
  dashboardLink: string;
}): Promise<void> => {
  await dispatch({
    to: p.to,
    subject: `Withdrawal update — $${p.amount.toFixed(2)}`,
    html: T.withdrawalRejectedHtml(p),
    label: "Withdrawal rejected",
  });
};

export const sendPasswordResetEmail = async (p: {
  to: string;
  name: string;
  resetLink: string;
}): Promise<void> => {
  await dispatch({
    to: p.to,
    subject: "Reset your password — Big Bull Energies",
    html: T.passwordResetHtml(p),
    label: "Password reset",
  });
};

export const sendReferralIncomeEmail = async (p: {
  to: string;
  name: string;
  amount: number;
  fromUserName?: string;
  fromUserId?: string;
  packageName?: string;
  dashboardLink?: string;
}): Promise<void> => {
  await dispatch({
    to: p.to,
    subject: `Referral income credited — $${p.amount.toFixed(2)}`,
    html: T.referralIncomeHtml({
      ...p,
      dashboardLink: p.dashboardLink || `${clientBaseUrl()}/dashboard`,
    }),
    label: "Referral income",
  });
};

export const sendBinaryIncomeEmail = async (p: {
  to: string;
  name: string;
  amount: number;
  matchedVolume?: number;
  dashboardLink?: string;
}): Promise<void> => {
  await dispatch({
    to: p.to,
    subject: `Binary income credited — $${p.amount.toFixed(2)}`,
    html: T.binaryIncomeHtml({
      ...p,
      dashboardLink: p.dashboardLink || `${clientBaseUrl()}/binary`,
    }),
    label: "Binary income",
  });
};

export const sendTicketCreatedEmail = async (p: {
  to: string;
  name: string;
  ticketId: string;
  subject: string;
  department: string;
}): Promise<void> => {
  await dispatch({
    to: p.to,
    subject: `Support ticket created — ${p.subject}`,
    html: T.ticketCreatedHtml(p),
    label: "Ticket created",
  });
};

export const sendTicketStatusUpdateEmail = async (p: {
  to: string;
  name: string;
  ticketId: string;
  subject: string;
  oldStatus: string;
  newStatus: string;
  reply?: string;
}): Promise<void> => {
  await dispatch({
    to: p.to,
    subject: `Ticket update — ${p.subject}`,
    html: T.ticketStatusUpdateHtml(p),
    label: "Ticket status update",
  });
};

export const sendVoucherCreatedEmail = async (params: {
  to: string;
  name: string;
  voucherId: string;
  amount: number;
  investmentValue: number;
  expiryDate: string;
  dashboardLink: string;
  source?: "wallet" | "payment";
}): Promise<void> => {
  await dispatch({
    to: params.to,
    subject: `Voucher created — ${params.voucherId}`,
    html: T.voucherCreatedHtml(params),
    label: "Voucher created",
  });
};

export const sendVoucherUsedEmail = async (params: {
  to: string;
  name: string;
  voucherId: string;
  amount: number;
  investmentValue: number;
  usedBy: string;
  dashboardLink: string;
}): Promise<void> => {
  await dispatch({
    to: params.to,
    subject: `Voucher used — ${params.voucherId}`,
    html: T.voucherUsedHtml(params),
    label: "Voucher used",
  });
};

export const sendVoucherExpiredEmail = async (params: {
  to: string;
  name: string;
  voucherId: string;
  amount: number;
  investmentValue: number;
  expiryDate: string;
  dashboardLink: string;
}): Promise<void> => {
  await dispatch({
    to: params.to,
    subject: `Voucher expired — ${params.voucherId}`,
    html: T.voucherExpiredHtml(params),
    label: "Voucher expired",
  });
};

export const sendAnnouncementEmail = async (p: {
  to: string;
  name?: string;
  headline: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): Promise<void> => {
  await dispatch({
    to: p.to,
    subject: p.headline,
    html: T.announcementHtml(p),
    label: "Announcement",
  });
};

export const sendCalculationFailureEmail = async (p: {
  to: string;
  jobId: string;
  jobType: string;
  error: string;
  processedItems: number;
  totalItems: number;
}): Promise<void> => {
  const progressPct =
    p.totalItems > 0 ? Math.round((p.processedItems / p.totalItems) * 100) : 0;
  const adminLink = `${clientBaseUrl()}/admin/settings`;

  await dispatch({
    to: p.to,
    subject: `Calculation job failed — ${p.jobType}`,
    html: T.calculationFailureHtml({
      ...p,
      progressPct,
      adminLink,
    }),
    label: "Calculation failure",
  });
};
