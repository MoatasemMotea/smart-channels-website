import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { createContactSchema } from "@/lib/contact-schema";
import type { ContactErrors } from "@/lib/contact-rules";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isMailerConfigured, sendContactEnquiry } from "@/lib/mailer";

/**
 * Contact form endpoint.
 *
 * Defence in depth, cheapest check first so an abusive request is rejected
 * before it costs anything:
 *
 *   1. Content-type must be JSON — blocks trivial cross-site form posts.
 *   2. Body size cap — a 2000-character message cannot need 16 KB.
 *   3. Per-IP rate limit — 5 submissions per 10 minutes.
 *   4. Honeypot field — must be empty.
 *   5. Timing check — a human cannot complete this form in under 2.5 seconds.
 *   6. Full schema validation, identical to the client's.
 *   7. Only then is any mail sent.
 *
 * Responses never reveal which anti-spam check fired. A bot that learns it was
 * caught by the honeypot simply stops filling it in, so spam rejections return
 * the same shape as a success.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 };
const MIN_COMPLETION_MS = 2500;

function jsonError(status: number, errors: ContactErrors, extra?: ResponseInit) {
  return NextResponse.json({ ok: false, errors }, { status, ...extra });
}

export async function POST(request: NextRequest) {
  /* --- 1. Content type ---------------------------------------------------- */
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ ok: false }, { status: 415 });
  }

  /* --- 2. Body size ------------------------------------------------------- */
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false }, { status: 413 });
    }
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Resolve the locale early so every error below is in the visitor's language.
  const candidateLocale =
    typeof raw === "object" && raw !== null && "locale" in raw
      ? String((raw as { locale?: unknown }).locale)
      : "en";
  const locale = isLocale(candidateLocale) ? candidateLocale : "en";
  const dict = getDictionary(locale);

  /* --- 3. Rate limit ------------------------------------------------------ */
  const ip = clientIp(request.headers);
  const limited = rateLimit(`contact:${ip}`, RATE_LIMIT);
  if (!limited.ok) {
    return jsonError(
      429,
      { form: dict.contact.form.errorRateLimit },
      { headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  /* --- 6. Validation (4 and 5 handled just below) ------------------------- */
  const schema = createContactSchema(dict);
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const errors: ContactErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !(field in errors)) {
        // `website` and `startedAt` are anti-spam fields with no visible
        // control — a failure there is a bot, reported as a generic success.
        if (field === "website" || field === "startedAt") {
          return NextResponse.json({ ok: true }, { status: 200 });
        }
        errors[field as keyof ContactErrors] = issue.message;
      }
    }
    if (Object.keys(errors).length === 0) {
      errors.form = dict.contact.form.errorGeneric;
    }
    return jsonError(400, errors);
  }

  const values = parsed.data;

  /* --- 4. Honeypot -------------------------------------------------------- */
  if (values.website && values.website.length > 0) {
    // Silently accepted. The bot believes it succeeded; nothing is sent.
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  /* --- 5. Timing ---------------------------------------------------------- */
  if (values.startedAt !== undefined) {
    const elapsed = Date.now() - values.startedAt;
    // Negative elapsed means a forged or clock-skewed timestamp.
    if (elapsed >= 0 && elapsed < MIN_COMPLETION_MS) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
  }

  /* --- 7. Deliver --------------------------------------------------------- */
  if (!isMailerConfigured()) {
    // Fail loudly in the server log and honestly to the user. Silently
    // discarding an enquiry because an env var is missing is the worst possible
    // outcome for a contact form — the visitor believes they made contact.
    console.error(
      "[contact] RESEND_API_KEY is not set — enquiry was NOT delivered.",
      { name: values.name, email: values.email },
    );
    return jsonError(503, { form: dict.contact.form.errorGeneric });
  }

  const result = await sendContactEnquiry(values, {
    ip,
    userAgent: request.headers.get("user-agent") ?? "unknown",
    submittedAt: new Date(),
  });

  if (!result.ok) {
    console.error("[contact] delivery failed", result);
    return jsonError(502, { form: dict.contact.form.errorGeneric });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

/** Anything other than POST is not part of this endpoint's contract. */
export async function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
