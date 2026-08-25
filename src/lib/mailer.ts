import "server-only";
import { Resend } from "resend";
import type { ContactPayload } from "./contact-schema";
import { services } from "@/data/services";
import { contact as contactDetails } from "./site";

/**
 * Contact-form delivery.
 *
 * Deliberately written as a narrow adapter with one implementation. The route
 * handler calls `sendContactEnquiry` and knows nothing about Resend, so
 * switching to SMTP, SES or a CRM webhook later means editing this file alone.
 *
 * SECURITY
 * --------
 * - The API key is read from `process.env` inside a `server-only` module. It
 *   can never reach the client bundle: importing this file from a client
 *   component is a build error, not a runtime surprise.
 * - Every user-supplied value is escaped before being interpolated into the
 *   HTML body. A contact form that mails unescaped input to staff is a stored
 *   XSS vector aimed at your own inbox.
 * - `replyTo` carries the enquirer's address so staff can reply naturally,
 *   while `from` stays on a domain we control — spoofing the sender would
 *   fail SPF/DKIM and land the mail in spam.
 */

export type SendResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "provider-error"; detail?: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function serviceLabel(id: string): string {
  if (id === "other") return "Other";
  return services.find((service) => service.id === id)?.title.en ?? id;
}

interface Meta {
  ip: string;
  userAgent: string;
  submittedAt: Date;
}

function buildHtml(values: ContactPayload, meta: Meta): string {
  const rows: Array<[string, string]> = [
    ["Name", values.name],
    ["Company", values.company || "—"],
    ["Email", values.email],
    ["Phone", values.phone],
    ["Service", serviceLabel(values.service)],
    ["Language", values.locale === "ar" ? "Arabic" : "English"],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr>
          <th align="left" style="padding:8px 16px 8px 0;color:#574f5e;font-weight:bold;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</th>
          <td style="padding:8px 0;color:#17141a;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f7f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e0dbe5;border-radius:8px;overflow:hidden;">
    <tr><td style="background:#d9088c;padding:16px 24px;">
      <p style="margin:0;color:#ffffff;font-size:14px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">New website enquiry</p>
    </td></tr>
    <tr><td style="padding:24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;">${rowsHtml}</table>
      <div style="margin-top:20px;padding-top:20px;border-top:1px solid #e0dbe5;">
        <p style="margin:0 0 8px;color:#574f5e;font-size:13px;font-weight:bold;">Message</p>
        <p style="margin:0;color:#17141a;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(values.message)}</p>
      </div>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e0dbe5;color:#756b7e;font-size:12px;line-height:1.6;">
        <p style="margin:0;">Submitted ${escapeHtml(meta.submittedAt.toISOString())}</p>
        <p style="margin:0;">IP ${escapeHtml(meta.ip)}</p>
        <p style="margin:0;">User agent ${escapeHtml(meta.userAgent.slice(0, 200))}</p>
      </div>
    </td></tr>
  </table>
</body></html>`;
}

function buildText(values: ContactPayload, meta: Meta): string {
  return [
    "New website enquiry",
    "",
    `Name:     ${values.name}`,
    `Company:  ${values.company || "—"}`,
    `Email:    ${values.email}`,
    `Phone:    ${values.phone}`,
    `Service:  ${serviceLabel(values.service)}`,
    `Language: ${values.locale === "ar" ? "Arabic" : "English"}`,
    "",
    "Message:",
    values.message,
    "",
    `Submitted ${meta.submittedAt.toISOString()}`,
    `IP ${meta.ip}`,
  ].join("\n");
}

export function isMailerConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendContactEnquiry(
  values: ContactPayload,
  meta: Meta,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, reason: "not-configured" };

  /* Must be a verified domain in the Resend dashboard. Kept in an env var so
     the same build works across staging and production without a code change. */
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Smart Channels Website <onboarding@resend.dev>";
  const to = process.env.CONTACT_TO_EMAIL?.trim() || contactDetails.email;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: values.email,
      subject: `Website enquiry — ${values.name}${values.company ? ` (${values.company})` : ""}`,
      html: buildHtml(values, meta),
      text: buildText(values, meta),
    });

    if (error) {
      return { ok: false, reason: "provider-error", detail: error.message };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: "provider-error",
      detail: error instanceof Error ? error.message : "unknown",
    };
  }
}
