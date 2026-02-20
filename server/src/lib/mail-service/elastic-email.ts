/**
 * Elastic Email API client
 * Sends emails via Elastic Email REST API using ELASTICMAIL_API_KEY.
 * Supports both raw HTML and pre-built templates with merge fields.
 * Docs: https://api.elasticemail.com/public/help (v2 email/send)
 */

const ELASTIC_EMAIL_SEND_URL = "https://api.elasticemail.com/v2/email/send";

export interface SendEmailParams {
  to: string;
  from: string;
  subject: string;
  html: string;
  fromName?: string;
}

/**
 * Send a single email with raw HTML (no template).
 */
export async function sendEmail({ to, from, subject, html, fromName }: SendEmailParams): Promise<void> {
  const apiKey = process.env.ELASTICMAIL_API_KEY;
  if (!apiKey) {
    throw new Error("ELASTICMAIL_API_KEY is not set");
  }

  const body = new URLSearchParams({
    apikey: apiKey,
    from,
    to,
    subject,
    bodyHtml: html,
    ...(fromName && { fromName }),
  });

  const res = await fetch(ELASTIC_EMAIL_SEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Elastic Email API error ${res.status}: ${text}`);
  }

  const data = await res.json().catch(() => ({}));
  if (data && data.success === false) {
    throw new Error(data.error || "Elastic Email API returned success: false");
  }
}

export interface SendWithTemplateParams {
  to: string;
  from: string;
  subject: string;
  /** Template name as created in Elastic Email dashboard */
  template: string;
  /** Merge fields: keys match {key} in template; values are strings */
  merge: Record<string, string | number | undefined>;
  fromName?: string;
}

/**
 * Send email using a pre-built Elastic Email template and merge fields.
 * In the Elastic Email template use single braces, e.g. {name}, {loginLink}.
 * Merge keys are passed as merge_name=value, merge_loginLink=value, etc.
 */
export async function sendWithTemplate({
  to,
  from,
  subject,
  template,
  merge,
  fromName,
}: SendWithTemplateParams): Promise<void> {
  const apiKey = process.env.ELASTICMAIL_API_KEY;
  if (!apiKey) {
    throw new Error("ELASTICMAIL_API_KEY is not set");
  }

  const body = new URLSearchParams({
    apikey: apiKey,
    from,
    to,
    subject,
    template,
    ...(fromName && { fromName }),
  });

  for (const [key, value] of Object.entries(merge)) {
    if (value === undefined || value === null) continue;
    body.set(`merge_${key}`, String(value));
  }

  const res = await fetch(ELASTIC_EMAIL_SEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Elastic Email API error ${res.status}: ${text}`);
  }

  const data = await res.json().catch(() => ({}));
  if (data && data.success === false) {
    throw new Error(data.error || "Elastic Email API returned success: false");
  }
}
