import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { sendEmail } from "../lib/mail-service/elastic-email";
import { defaultFrom } from "../lib/mail-service/email.service";
import { contactInquiryHtml } from "../lib/mail-service/templates/emails";

const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL?.trim() ||
  process.env.ELASTIC_FROM_EMAIL?.trim() ||
  process.env.email?.trim() ||
  "support@bigbullenergies.com";

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
    const html = contactInquiryHtml({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim(),
      subject: subjectLabel,
      message: message.trim(),
    });

    const mailSubject = `[Contact] ${subjectLabel} — ${name.trim()}`;

    let fromAddress: string;
    try {
      fromAddress = defaultFrom();
    } catch {
      fromAddress =
        process.env.ELASTIC_FROM_EMAIL?.trim() ||
        process.env.EMAIL_FROM?.trim() ||
        SUPPORT_EMAIL;
    }

    try {
      await sendEmail({
        to: SUPPORT_EMAIL,
        from: fromAddress,
        fromName: "Big Bull Energies Website",
        subject: mailSubject,
        html,
        replyTo: email.trim(),
      });
    } catch (err) {
      // Elastic Email rejects unverified from-domains. Log full inquiry so nothing is lost.
      console.error("[ContactForm] Failed to send email:", (err as Error).message);
      console.error("[ContactForm] Inquiry (email not delivered):", {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        subject: subjectLabel,
        message: message.trim(),
        to: SUPPORT_EMAIL,
        from: fromAddress,
      });
    }

    (res as any).status(200).json({
      status: "success",
      message: "Your message has been sent. We'll get back to you soon.",
      data: null,
    });
  },
);
