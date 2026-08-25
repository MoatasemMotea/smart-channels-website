import { services } from "@/data/services";
import type { Dictionary } from "@/i18n";

/**
 * Contact form rules, shared by the browser and the server.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The obvious approach is to build one Zod schema and import it on both sides.
 * That is what this project did first, and it cost 72.6 KB gzipped — Zod was
 * the single largest chunk on the site, about a third of all JavaScript, and it
 * was shipped to every visitor purely so the contact form could show an error
 * before submitting. The server re-validates every field regardless, so none of
 * that weight was buying any safety.
 *
 * So the *rules* live here as plain data and a dependency-free validator, and
 * Zod stays on the server where bundle size is irrelevant (see
 * `contact-schema.ts`, which is built from these same constants).
 *
 * The usual objection to two validators is that they drift apart. They cannot
 * here: every limit, pattern and allowed value is defined once in this file and
 * consumed by both. Only the mechanism differs, never the rule.
 */

export const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  companyMax: 120,
  emailMax: 160,
  messageMin: 10,
  messageMax: 2000,
} as const;

/**
 * Permissive on purpose: international formats vary widely and a form that
 * rejects a valid number is worse than one that accepts an invalid one, which
 * a human will simply notice when replying.
 */
export const PHONE_PATTERN = /^[+()\d][\d\s()+.-]{6,24}$/;

/**
 * Client-side email check. Deliberately simpler than the server's — it exists
 * to catch typos, not to be authoritative. The server uses Zod's full email
 * validator, so anything this lets through is still checked properly.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Allowed values for the "service of interest" field. */
export const serviceOptionIds = [
  ...services.map((service) => service.id),
  "other",
] as const;

export type ServiceOptionId = (typeof serviceOptionIds)[number];

/** Fields the form renders, in visual order. */
export const contactFields = [
  "name",
  "company",
  "email",
  "phone",
  "service",
  "message",
] as const;

export type ContactField = (typeof contactFields)[number];

export type ContactErrors = Partial<Record<ContactField | "form", string>>;

export interface ContactValues {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  website: string;
  startedAt: number;
  locale: "en" | "ar";
}

/**
 * Validate the form in the browser.
 *
 * Returns a field→message map, empty when everything passes. Messages come from
 * the dictionary so errors appear in the visitor's language.
 */
export function validateContact(
  values: Pick<ContactValues, ContactField>,
  dict: Dictionary,
): ContactErrors {
  const v = dict.contact.validation;
  const errors: ContactErrors = {};

  const name = values.name.trim();
  if (name.length === 0) errors.name = v.nameRequired;
  else if (name.length < LIMITS.nameMin) errors.name = v.nameTooShort;
  else if (name.length > LIMITS.nameMax) errors.name = v.nameTooLong;

  const company = values.company.trim();
  if (company.length > LIMITS.companyMax) errors.company = v.companyTooLong;

  const email = values.email.trim();
  if (email.length === 0) errors.email = v.emailRequired;
  else if (email.length > LIMITS.emailMax) errors.email = v.emailTooLong;
  else if (!EMAIL_PATTERN.test(email)) errors.email = v.emailInvalid;

  const phone = values.phone.trim();
  if (phone.length === 0) errors.phone = v.phoneRequired;
  else if (!PHONE_PATTERN.test(phone)) errors.phone = v.phoneInvalid;

  const service = values.service.trim();
  if (service.length === 0) errors.service = v.serviceRequired;
  else if (!(serviceOptionIds as readonly string[]).includes(service)) {
    errors.service = v.serviceInvalid;
  }

  const message = values.message.trim();
  if (message.length === 0) errors.message = v.messageRequired;
  else if (message.length < LIMITS.messageMin) errors.message = v.messageTooShort;
  else if (message.length > LIMITS.messageMax) errors.message = v.messageTooLong;

  return errors;
}
