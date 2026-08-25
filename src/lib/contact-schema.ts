import "server-only";
import { z } from "zod";
import type { Dictionary } from "@/i18n";
import {
  EMAIL_PATTERN,
  LIMITS,
  PHONE_PATTERN,
  serviceOptionIds,
} from "./contact-rules";

/**
 * Server-side contact validation.
 *
 * This module is `server-only`: importing it from a client component is a build
 * error, not a silent 72 KB regression. Zod is excellent for this job, but it
 * has no business in the browser bundle — the browser uses the dependency-free
 * validator in `contact-rules.ts`, built from the same constants imported here,
 * so the two cannot disagree about what is valid.
 *
 * This is the authoritative check. Everything arriving at the API route is
 * treated as hostile regardless of what the browser claimed to have verified.
 */

export function createContactSchema(dict: Dictionary) {
  const v = dict.contact.validation;

  return z.object({
    // The `error` option also covers the invalid-type case. Without it, a
    // request that omits a key entirely fails Zod's type check before `.min()`
    // runs, and the response leaks an untranslated internal message instead of
    // the localised one. Browsers always send strings, but this endpoint is
    // public and must answer any caller in the requested language.
    name: z
      .string({ error: v.nameRequired })
      .trim()
      .min(1, v.nameRequired)
      .min(LIMITS.nameMin, v.nameTooShort)
      .max(LIMITS.nameMax, v.nameTooLong),

    // The only optional field. Asking for it helps qualify an enquiry;
    // requiring it would block individuals and small operators.
    company: z
      .string({ error: v.companyTooLong })
      .trim()
      .max(LIMITS.companyMax, v.companyTooLong)
      .optional()
      .default(""),

    email: z
      .string({ error: v.emailRequired })
      .trim()
      .min(1, v.emailRequired)
      .max(LIMITS.emailMax, v.emailTooLong)
      // Zod's own validator is stricter than the client's typo check, which is
      // the right way round: the browser is permissive, the server decides.
      .pipe(z.email(v.emailInvalid))
      .refine((value) => EMAIL_PATTERN.test(value), v.emailInvalid),

    phone: z
      .string({ error: v.phoneRequired })
      .trim()
      .min(1, v.phoneRequired)
      .regex(PHONE_PATTERN, v.phoneInvalid),

    // Constrained to known ids, so the value can be trusted when composing the
    // notification email — it is never echoed back as free text.
    service: z
      .string({ error: v.serviceRequired })
      .min(1, v.serviceRequired)
      .refine(
        (value): value is (typeof serviceOptionIds)[number] =>
          (serviceOptionIds as readonly string[]).includes(value),
        v.serviceInvalid,
      ),

    message: z
      .string({ error: v.messageRequired })
      .trim()
      .min(1, v.messageRequired)
      .min(LIMITS.messageMin, v.messageTooShort)
      .max(LIMITS.messageMax, v.messageTooLong),

    /* ---- Anti-spam, never shown to a real user ---------------------------
       `website` is a honeypot: hidden from sight and from assistive tech, so
       only an automated form-filler populates it.
       `startedAt` is the epoch-ms the form was rendered; the route rejects
       submissions completed implausibly fast. Both are optional so a
       legitimate submission never fails because of them. */
    website: z.string().max(0).optional().default(""),
    startedAt: z.coerce.number().int().nonnegative().optional(),

    /** Locale, so the response matches the language of the enquiry. */
    locale: z.enum(["en", "ar"]).optional().default("en"),
  });
}

export type ContactSchema = ReturnType<typeof createContactSchema>;
export type ContactPayload = z.output<ContactSchema>;
