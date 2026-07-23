/**
 * Elastic Email API client
 * Sends transactional emails via Elastic Email REST API (raw HTML).
 * Docs: https://api.elasticemail.com/public/help (v2 email/send)
 */

const ELASTIC_EMAIL_SEND_URL = "https://api.elasticemail.com/v2/email/send";

export interface SendEmailParams {
  to: string;
  from: string;
  subject: string;
  html: string;
  fromName?: string;
  /** Optional Reply-To (e.g. visitor email on contact form) */
  replyTo?: string;
}

function getApiKey(): string {
  const apiKey = process.env.ELASTICMAIL_API_KEY || process.env.ELASTIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ELASTICMAIL_API_KEY (or ELASTIC_API_KEY) is not set — emails cannot be delivered",
    );
  }
  return apiKey;
}

function warnIfUnverifiedFrom(from: string): void {
  const domain = from.split("@")[1]?.toLowerCase() || "";
  if (
    domain === "gmail.com" ||
    domain === "yahoo.com" ||
    domain === "outlook.com" ||
    domain === "hotmail.com"
  ) {
    console.warn(
      `[Email] From address "${from}" uses a free mailbox domain. Elastic Email usually rejects these unless the domain is verified. Set ELASTIC_FROM_EMAIL to an address on your verified sending domain.`,
    );
  }
}

/**
 * Send a single transactional email with raw HTML body.
 */
export async function sendEmail({
  to,
  from,
  subject,
  html,
  fromName,
  replyTo,
}: SendEmailParams): Promise<void> {
  const apiKey = getApiKey();
  warnIfUnverifiedFrom(from);

  const body = new URLSearchParams({
    apikey: apiKey,
    from,
    to,
    subject,
    bodyHtml: html,
    isTransactional: "true",
    ...(fromName && { fromName }),
    ...(replyTo && { replyTo }),
  });

  const res = await fetch(ELASTIC_EMAIL_SEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`Elastic Email API error ${res.status}: ${text}`);
  }

  if (data && data.success === false) {
    throw new Error(data.error || "Elastic Email API returned success: false");
  }

  console.log(
    `[Email] Queued via Elastic Email → to=${to} subject="${subject}" transaction=${data?.data || data?.transactionid || "ok"}`,
  );
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
 * @deprecated Prefer sendEmail with in-repo branded HTML templates.
 * Kept for backwards compatibility with any remaining dashboard templates.
 */
export async function sendWithTemplate({
  to,
  from,
  subject,
  template,
  merge,
  fromName,
}: SendWithTemplateParams): Promise<void> {
  const apiKey = getApiKey();
  warnIfUnverifiedFrom(from);

  const body = new URLSearchParams({
    apikey: apiKey,
    from,
    to,
    subject,
    template,
    isTransactional: "true",
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

  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`Elastic Email API error ${res.status}: ${text}`);
  }

  if (data && data.success === false) {
    throw new Error(data.error || "Elastic Email API returned success: false");
  }
}
