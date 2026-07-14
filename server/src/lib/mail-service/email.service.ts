/**
 * Email Service
 * Sends emails via Elastic Email API using pre-built templates and merge fields.
 * Set ELASTICMAIL_API_KEY in env. Create templates in Elastic Email dashboard with the names and merge tags below.
 */

import { sendWithTemplate } from "./elastic-email";

const defaultFrom = () =>
  process.env.EMAIL_USER ||
  process.env.EMAIL_FROM ||
  "noreply@crownbankers.com";

/** Elastic Email template names (must match templates in your Elastic Email dashboard) */
const TEMPLATES = {
  SignupWelcome: "SignupWelcome",
  InvestmentConfirmation: "InvestmentConfirmation",
  WithdrawalCreated: "WithdrawalCreated",
  WithdrawalApproved: "WithdrawalApproved",
  WithdrawalRejected: "WithdrawalRejected",
  PasswordReset: "PasswordReset",
  TicketCreated: "TicketCreated",
  TicketStatusUpdate: "TicketStatusUpdate",
  VoucherCreated: "VoucherCreated",
  VoucherUsed: "VoucherUsed",
  VoucherExpired: "VoucherExpired",
  CalculationFailure: "CalculationFailure",
} as const;

interface SendSignupEmailParams {
  to: string;
  name: string;
  userId: string;
  loginLink: string;
}
// migrated
export const sendSignupWelcomeEmail = async ({
  to,
  name,
  userId,
  loginLink,
}: SendSignupEmailParams): Promise<void> => {
  try {
    console.log({ name, userId, loginLink }, "sendSignupWelcomeEmail");

    await sendWithTemplate({
      from: defaultFrom(),
      to,
      subject: "Welcome to Big Bull Energies - Your Account is Ready!",
      template: TEMPLATES.SignupWelcome,
      merge: { name, userId, loginLink },
    });
    console.log(`✅ Signup welcome email sent to ${to}`);
  } catch (error: any) {
    console.error(
      `❌ Failed to send signup welcome email to ${to}:`,
      error.message,
    );
  }
};

interface SendInvestmentPurchaseEmailParams {
  to: string;
  name: string;
  packageName: string;
  investmentAmount: number;
  duration: number;
  totalOutputPct: number;
  startDate: string;
  endDate: string;
  dashboardLink: string;
  /** User ID (e.g. CROWN-000123) for template {userId} */
  userId?: string;
}
// migrated

export const sendInvestmentPurchaseEmail = async ({
  to,
  name,
  packageName,
  investmentAmount,
  duration,
  totalOutputPct,
  startDate,
  endDate,
  dashboardLink,
  userId,
}: SendInvestmentPurchaseEmailParams): Promise<void> => {
  try {
    await sendWithTemplate({
      from: defaultFrom(),
      to,
      subject: `Investment Confirmation - ${packageName}`,
      template: TEMPLATES.InvestmentConfirmation,
      merge: {
        name,
        packageName,
        investmentAmount,
        duration,
        totalOutputPct,
        startDate,
        endDate,
        dashboardLink,
        // Template fields: User ID, Package Amount, Package Name, Date of Purchase
        userId: userId ?? "",
        amount: investmentAmount,
        package: packageName,
        date: startDate,
      },
    });
    console.log(`✅ Investment purchase confirmation email sent to ${to}`);
  } catch (error: any) {
    console.error(
      `❌ Failed to send investment purchase email to ${to}:`,
      error.message,
    );
  }
};

interface SendWithdrawalCreatedEmailParams {
  to: string;
  name: string;
  amount: number;
  charges: number;
  finalAmount: number;
  walletType: string;
  withdrawalId: string;
  dashboardLink: string;
}
// migrated
export const sendWithdrawalCreatedEmail = async ({
  to,
  name,
  amount,
  charges,
  finalAmount,
  walletType,
  withdrawalId,
  dashboardLink,
}: SendWithdrawalCreatedEmailParams): Promise<void> => {
  try {
    await sendWithTemplate({
      from: defaultFrom(),
      to,
      subject: `Withdrawal Request Submitted - $${amount.toFixed(2)}`,
      template: TEMPLATES.WithdrawalCreated,
      merge: {
        name,
        amount: amount.toFixed(2),
        charges: charges.toFixed(2),
        finalAmount: finalAmount.toFixed(2),
        walletType,
        withdrawalId,
        dashboardLink,
      },
    });
    console.log(`✅ Withdrawal created email sent to ${to}`);
  } catch (error: any) {
    console.error(
      `❌ Failed to send withdrawal created email to ${to}:`,
      error.message,
    );
  }
};

interface SendWithdrawalApprovedEmailParams {
  to: string;
  name: string;
  amount: number;
  charges: number;
  finalAmount: number;
  walletType: string;
  withdrawalId: string;
  transactionId: string;
  dashboardLink: string;
}
// migrated
export const sendWithdrawalApprovedEmail = async ({
  to,
  name,
  amount,
  charges,
  finalAmount,
  walletType,
  withdrawalId,
  transactionId,
  dashboardLink,
}: SendWithdrawalApprovedEmailParams): Promise<void> => {
  try {
    await sendWithTemplate({
      from: defaultFrom(),
      to,
      subject: `Withdrawal Approved - $${amount.toFixed(2)}`,
      template: TEMPLATES.WithdrawalApproved,
      merge: {
        name,
        amount: amount.toFixed(2),
        charges: charges.toFixed(2),
        finalAmount: finalAmount.toFixed(2),
        walletType,
        withdrawalId,
        transactionId,
        dashboardLink,
      },
    });
    console.log(`✅ Withdrawal approved email sent to ${to}`);
  } catch (error: any) {
    console.error(
      `❌ Failed to send withdrawal approved email to ${to}:`,
      error.message,
    );
  }
};

interface SendWithdrawalRejectedEmailParams {
  to: string;
  name: string;
  amount: number;
  charges: number;
  finalAmount: number;
  walletType: string;
  withdrawalId: string;
  reason?: string;
  dashboardLink: string;
}
// migrated
export const sendWithdrawalRejectedEmail = async ({
  to,
  name,
  amount,
  charges,
  finalAmount,
  walletType,
  withdrawalId,
  reason,
  dashboardLink,
}: SendWithdrawalRejectedEmailParams): Promise<void> => {
  try {
    await sendWithTemplate({
      from: defaultFrom(),
      to,
      subject: `Withdrawal Request Rejected - $${amount.toFixed(2)}`,
      template: TEMPLATES.WithdrawalRejected,
      merge: {
        name,
        amount: amount.toFixed(2),
        charges: charges.toFixed(2),
        finalAmount: finalAmount.toFixed(2),
        walletType,
        withdrawalId,
        reason: reason ?? "",
        dashboardLink,
      },
    });
    console.log(`✅ Withdrawal rejected email sent to ${to}`);
  } catch (error: any) {
    console.error(
      `❌ Failed to send withdrawal rejected email to ${to}:`,
      error.message,
    );
  }
};

interface SendPasswordResetEmailParams {
  to: string;
  name: string;
  resetLink: string;
}
// migrated

export const sendPasswordResetEmail = async ({
  to,
  name,
  resetLink,
}: SendPasswordResetEmailParams): Promise<void> => {
  try {
    console.log({ name, resetLink }, "sendPasswordResetEmail");

    await sendWithTemplate({
      from: defaultFrom(),
      to,
      subject: "Reset Your Password - CROWN",
      template: TEMPLATES.PasswordReset,
      merge: { name, resetLink },
    });
    console.log(`✅ Password reset email sent to ${to}`);
  } catch (error: any) {
    console.error(
      `❌ Failed to send password reset email to ${to}:`,
      error.message,
    );
  }
};

interface SendTicketCreatedEmailParams {
  to: string;
  name: string;
  ticketId: string;
  subject: string;
  department: string;
}
// migrated

export const sendTicketCreatedEmail = async ({
  to,
  name,
  ticketId,
  subject,
  department,
}: SendTicketCreatedEmailParams): Promise<void> => {
  try {
    await sendWithTemplate({
      from: defaultFrom(),
      to,
      subject: `Support Ticket Created - ${subject}`,
      template: TEMPLATES.TicketCreated,
      merge: { name, ticketId, subject, department },
    });
    console.log(`✅ Ticket created email sent to ${to}`);
  } catch (error: any) {
    console.error(
      `❌ Failed to send ticket created email to ${to}:`,
      error.message,
    );
  }
};

interface SendTicketStatusUpdateEmailParams {
  to: string;
  name: string;
  ticketId: string;
  subject: string;
  oldStatus: string;
  newStatus: string;
  reply?: string;
}
// migrated
export const sendTicketStatusUpdateEmail = async ({
  to,
  name,
  ticketId,
  subject,
  oldStatus,
  newStatus,
  reply,
}: SendTicketStatusUpdateEmailParams): Promise<void> => {
  try {
    await sendWithTemplate({
      from: defaultFrom(),
      to,
      subject: `Ticket Status Updated - ${subject}`,
      template: TEMPLATES.TicketStatusUpdate,
      merge: {
        name,
        ticketId,
        subject,
        oldStatus,
        newStatus,
        reply: reply ?? "",
      },
    });
    console.log(`✅ Ticket status update email sent to ${to}`);
  } catch (error: any) {
    console.error(
      `❌ Failed to send ticket status update email to ${to}:`,
      error.message,
    );
  }
};
// migrated

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
  try {
    await sendWithTemplate({
      from: defaultFrom(),
      to: params.to,
      subject: `Voucher Created - ${params.voucherId}`,
      template: TEMPLATES.VoucherCreated,
      merge: {
        name: params.name,
        voucherId: params.voucherId,
        amount: params.amount.toFixed(2),
        investmentValue: params.investmentValue.toFixed(2),
        expiryDate: params.expiryDate,
        dashboardLink: params.dashboardLink,
        source: params.source ?? "wallet",
      },
    });
    console.log(`✅ Voucher created email sent to ${params.to}`);
  } catch (error: any) {
    console.error(
      `❌ Failed to send voucher created email to ${params.to}:`,
      error.message,
    );
  }
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
  try {
    await sendWithTemplate({
      from: defaultFrom(),
      to: params.to,
      subject: `Voucher Used - ${params.voucherId}`,
      template: TEMPLATES.VoucherUsed,
      merge: {
        name: params.name,
        voucherId: params.voucherId,
        amount: params.amount.toFixed(2),
        investmentValue: params.investmentValue.toFixed(2),
        usedBy: params.usedBy,
        dashboardLink: params.dashboardLink,
      },
    });
    console.log(`✅ Voucher used email sent to ${params.to}`);
  } catch (error: any) {
    console.error(
      `❌ Failed to send voucher used email to ${params.to}:`,
      error.message,
    );
  }
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
  try {
    await sendWithTemplate({
      from: defaultFrom(),
      to: params.to,
      subject: `Voucher Expired - ${params.voucherId}`,
      template: TEMPLATES.VoucherExpired,
      merge: {
        name: params.name,
        voucherId: params.voucherId,
        amount: params.amount.toFixed(2),
        investmentValue: params.investmentValue.toFixed(2),
        expiryDate: params.expiryDate,
        dashboardLink: params.dashboardLink,
      },
    });
    console.log(`✅ Voucher expired email sent to ${params.to}`);
  } catch (error: any) {
    console.error(
      `❌ Failed to send voucher expired email to ${params.to}:`,
      error.message,
    );
  }
};

interface SendCalculationFailureEmailParams {
  to: string;
  jobId: string;
  jobType: string;
  error: string;
  processedItems: number;
  totalItems: number;
}

export const sendCalculationFailureEmail = async ({
  to,
  jobId,
  jobType,
  error,
  processedItems,
  totalItems,
}: SendCalculationFailureEmailParams): Promise<void> => {
  try {
    const progressPct =
      totalItems > 0 ? Math.round((processedItems / totalItems) * 100) : 0;
    const adminLink = `${process.env.CLIENT_URL || "https://crownbankers.com"}/admin/settings`;

    await sendWithTemplate({
      from: defaultFrom(),
      to,
      subject: `⚠️ Calculation Job Failed - ${jobType}`,
      template: TEMPLATES.CalculationFailure,
      merge: {
        jobId,
        jobType,
        error,
        processedItems: String(processedItems),
        totalItems: String(totalItems),
        progressPct: String(progressPct),
        adminLink,
      },
    });
    console.log(`✅ Calculation failure email sent to ${to}`);
  } catch (error: any) {
    console.error(
      `❌ Failed to send calculation failure email to ${to}:`,
      error.message,
    );
  }
};
