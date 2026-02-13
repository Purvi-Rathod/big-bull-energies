import { Voucher } from "../models/Voucher";
import { sendVoucherExpiredEmail } from "../lib/mail-service/email.service";

/**
 * Find vouchers that are still active but past their expiry date,
 * mark them as expired, and send expiry notification emails.
 * Intended to be run daily (e.g. from cron).
 */
export async function processExpiredVouchers(): Promise<{ processed: number; emailsSent: number }> {
  const now = new Date();
  const expired = await Voucher.find({
    status: "active",
    expiry: { $lt: now },
  })
    .populate("user", "email name userId")
    .lean();

  let emailsSent = 0;
  for (const v of expired) {
    await Voucher.updateOne({ _id: v._id }, { $set: { status: "expired" } });
    const owner = v.user as any;
    if (owner?.email) {
      const expiryStr = v.expiry
        ? new Date(v.expiry).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "Europe/London",
          })
        : "N/A";
      const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:3000";
      try {
        await sendVoucherExpiredEmail({
          to: owner.email,
          name: owner.name || "User",
          voucherId: v.voucherId,
          amount: parseFloat(v.amount.toString()),
          investmentValue: parseFloat(v.investmentValue.toString()),
          expiryDate: expiryStr,
          dashboardLink: `${clientUrl}/vouchers`,
        });
        emailsSent++;
      } catch (err: any) {
        console.error(`[Voucher Expiry] Failed to send expired email for ${v.voucherId}:`, err.message);
      }
    }
  }

  return { processed: expired.length, emailsSent };
}
