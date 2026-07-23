/**
 * Big Bull Energies — shared branded email shell (table-based, email-client safe)
 */

export const BRAND = {
  name: "Big Bull Energies",
  primary: "#05627C",
  accent: "#3FA9C8",
  gold: "#F5CF0B",
  ink: "#0B1F2A",
  muted: "#5A6F78",
  soft: "#E8F5F0",
  softBlue: "#E6F7FB",
  goldSoft: "#FFF9E6",
  border: "#d8e6ec",
  white: "#FFFFFF",
  danger: "#B42318",
  success: "#027A48",
} as const;

export function escapeHtml(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function clientBaseUrl(): string {
  return (
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    "https://bigbullenergies.com"
  ).replace(/\/$/, "");
}

export function supportEmail(): string {
  return (
    process.env.SUPPORT_EMAIL ||
    process.env.ELASTIC_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    "support@bigbullenergies.com"
  );
}

type DetailRow = { label: string; value: string };

export function renderBrandedEmail(options: {
  preview: string;
  title: string;
  greetingName?: string;
  intro: string;
  details?: DetailRow[];
  highlight?: { label: string; value: string };
  cta?: { label: string; url: string };
  note?: string;
  footerNote?: string;
}): string {
  const {
    preview,
    title,
    greetingName,
    intro,
    details = [],
    highlight,
    cta,
    note,
    footerNote,
  } = options;

  const year = new Date().getFullYear();
  const hi = greetingName
    ? `Hello ${escapeHtml(greetingName)},`
    : "Hello,";

  const detailRows = details
    .map(
      (row) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.muted};width:42%;">${escapeHtml(row.label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};font-size:14px;color:${BRAND.ink};font-weight:700;text-align:right;">${escapeHtml(row.value)}</td>
      </tr>`,
    )
    .join("");

  const highlightBlock = highlight
    ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:${BRAND.goldSoft};border:2px solid ${BRAND.gold};border-radius:12px;">
      <tr>
        <td style="padding:18px 20px;text-align:center;">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">${escapeHtml(highlight.label)}</div>
          <div style="margin-top:6px;font-size:28px;font-weight:800;color:${BRAND.ink};">${escapeHtml(highlight.value)}</div>
        </td>
      </tr>
    </table>`
    : "";

  const ctaBlock = cta
    ? `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 8px;">
      <tr>
        <td style="border-radius:10px;background:${BRAND.gold};">
          <a href="${escapeHtml(cta.url)}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:800;color:${BRAND.ink};text-decoration:none;">
            ${escapeHtml(cta.label)}
          </a>
        </td>
      </tr>
    </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(title)}</title>
  <!--[if mso]><style>body,table,td{font-family:Arial,sans-serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#F3F8FA;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${BRAND.ink};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F8FA;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${BRAND.white};border-radius:16px;overflow:hidden;border:1px solid ${BRAND.border};box-shadow:0 8px 24px rgba(5,98,124,0.08);">
          <tr>
            <td style="background:linear-gradient(125deg,${BRAND.primary} 0%,#0A7A96 55%,${BRAND.accent} 100%);padding:28px 24px;text-align:center;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Wind energy investing</div>
              <div style="margin-top:8px;font-size:24px;font-weight:800;color:#FFFFFF;letter-spacing:-0.02em;">${BRAND.name}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 12px;">
              <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:${BRAND.ink};">${escapeHtml(title)}</h1>
              <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:${BRAND.ink};">${hi}</p>
              <p style="margin:0 0 8px;font-size:15px;line-height:1.65;color:${BRAND.muted};">${escapeHtml(intro)}</p>
              ${highlightBlock}
              ${
                details.length
                  ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">${detailRows}</table>`
                  : ""
              }
              ${ctaBlock}
              ${
                note
                  ? `<p style="margin:20px 0 0;font-size:13px;line-height:1.55;color:${BRAND.muted};">${escapeHtml(note)}</p>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;">
              <div style="height:1px;background:${BRAND.border};margin:8px 0 20px;"></div>
              <p style="margin:0;font-size:12px;line-height:1.55;color:${BRAND.muted};">
                ${footerNote ? escapeHtml(footerNote) : `Questions? Contact us at ${supportEmail()}.`}
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#8a9aa3;">
                © ${year} ${BRAND.name}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
