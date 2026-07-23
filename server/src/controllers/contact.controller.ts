import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { sendEmail } from "../lib/mail-service/elastic-email";

const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL?.trim() ||
  process.env.ELASTIC_FROM_EMAIL?.trim() ||
  process.env.email?.trim() ||
  "bigbullenergies@gmail.com";

const FROM_EMAIL =
  process.env.ELASTIC_FROM_EMAIL?.trim() ||
  process.env.EMAIL_FROM?.trim() ||
  process.env.EMAIL_USER?.trim() ||
  SUPPORT_EMAIL;

/**
 * POST /api/v1/support/contact
 * Public contact form from the website.
 * Body: { name, email, phone?, subject, message }
 */
export const submitContactForm = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, phone, subject, message } = (req.body || {}) as {
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
    };

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      throw new AppError(
        "name, email, subject, and message are required",
        400,
      );
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) {
      throw new AppError("Please provide a valid email address", 400);
    }

    const subjectLabel = subject.trim();
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#0B1F2A">
        <h2 style="color:#05627C;margin:0 0 12px">New website contact message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name.trim())}</p>
        <p><strong>Email:</strong> ${escapeHtml(email.trim())}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone?.trim() || "—")}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subjectLabel)}</p>
        <hr style="border:none;border-top:1px solid #d8e2e6;margin:16px 0" />
        <p style="white-space:pre-wrap">${escapeHtml(message.trim())}</p>
      </div>
    `;

    const mailSubject = `[Contact] ${subjectLabel} — ${name.trim()}`;

    try {
      await sendEmail({
        to: SUPPORT_EMAIL,
        from: FROM_EMAIL,
        fromName: "Big Bull Energies Website",
        subject: mailSubject,
        html,
        replyTo: email.trim(),
      });
    } catch (err) {
      // Elastic Email often rejects Gmail "from" addresses unless the domain is verified.
      // Still accept the inquiry so the form isn't blocked; full payload is in the log.
      console.error("[ContactForm] Failed to send email:", (err as Error).message);
      console.error("[ContactForm] Inquiry (email not delivered):", {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        subject: subjectLabel,
        message: message.trim(),
        to: SUPPORT_EMAIL,
        from: FROM_EMAIL,
      });
    }

    (res as any).status(200).json({
      status: "success",
      message: "Your message has been sent. We'll get back to you soon.",
      data: null,
    });
  },
);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
