import type { Localized } from "@/types/content";

/**
 * Single source of truth for company facts, contact channels and site-wide
 * configuration.
 *
 * Every value here is either supplied by Smart Channels or derived from a
 * supplied value. Nothing in this file is inferred, estimated or invented — if
 * a fact is not confirmed it is absent rather than approximated.
 */

/* -------------------------------------------------------------------------- */
/* Deployment                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Canonical origin, e.g. "https://smartchannels.co".
 *
 * The production domain is not yet confirmed, so it is never hard-coded. Set
 * NEXT_PUBLIC_SITE_URL at build time. On Vercel, VERCEL_PROJECT_PRODUCTION_URL
 * is used as a fallback so preview and production deployments still emit
 * absolute, self-consistent URLs for canonicals, sitemap and Open Graph.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  // Local development fallback. Never used in a production build that has
  // NEXT_PUBLIC_SITE_URL set, which the deployment docs require.
  return "http://localhost:3000";
}

/** True once a real production domain is configured. */
export function hasCanonicalDomain(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim(),
  );
}

/* -------------------------------------------------------------------------- */
/* Company                                                                     */
/* -------------------------------------------------------------------------- */

export const company = {
  name: {
    en: "Smart Channels",
    ar: "القنوات الذكية",
  } satisfies Localized,

  /** Approved brand tagline. Rendered verbatim, untranslated, in both locales. */
  tagline: "we take you to the future",

  /**
   * Establishment year, confirmed by the client.
   *
   * This is the single source of truth. It is deliberately NOT duplicated into
   * the translation dictionaries — the year is a fact, not a translated string,
   * and holding it in two places is how a correction ends up applied to one and
   * not the other. Components read it from here and render it with
   * `.numerals-latin` so it stays in Latin digits in both languages.
   *
   * Never derive a "years of experience" figure from this automatically —
   * with one documented exception. The client later confirmed the duration
   * ("7 years") in the same decision as the year, and the two agree, so
   * src/data/track-record.ts derives the duration rather than hard-coding a
   * literal that would silently become false. That file explains the reasoning
   * at the point of use; nothing else may derive from this value.
   */
  foundedYear: 2019,

  address: {
    /** Street-level detail has not been confirmed; district and city have. */
    district: { en: "Al Murabba", ar: "المربّع" } satisfies Localized,
    city: { en: "Riyadh", ar: "الرياض" } satisfies Localized,
    country: {
      en: "Saudi Arabia",
      ar: "المملكة العربية السعودية",
    } satisfies Localized,
    countryCode: "SA",
    /** Full single-line form used in the UI. */
    full: {
      en: "Al Murabba, Riyadh, Saudi Arabia",
      ar: "المربّع، الرياض، المملكة العربية السعودية",
    } satisfies Localized,
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Contact                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Phone numbers are stored once in E.164 and once in display form, so the
 * dialable `tel:` value can never drift from the number shown on screen.
 */
export const contact = {
  email: "info@smartchannels.co",

  phone: {
    e164: "+966112099621",
    display: "+966 11 209 9621",
  },

  whatsapp: {
    e164: "+966539795999",
    display: "+966 53 979 5999",
    /** wa.me requires the number without "+" or separators. */
    url: "https://wa.me/966539795999",
  },

  /** Authoritative location link, exactly as supplied by the client. */
  mapsUrl: "https://maps.app.goo.gl/NJzy4hGdWgEg4caWA",

  /**
   * Optional Google Maps embed.
   *
   * Left unset by default and deliberately so: a Maps iframe pulls roughly
   * 800 KB across dozens of requests and sets third-party cookies, which costs
   * Core Web Vitals and complicates the privacy position — for a link that most
   * visitors will open in their own maps app anyway. When a verified embed URL
   * is available, set NEXT_PUBLIC_MAP_EMBED_URL and the map renders in place of
   * the static location card.
   */
  mapEmbedUrl: process.env.NEXT_PUBLIC_MAP_EMBED_URL?.trim() || null,
} as const;

export function mailtoHref(subject?: string): string {
  return subject
    ? `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${contact.email}`;
}

export function telHref(): string {
  return `tel:${contact.phone.e164}`;
}

/* -------------------------------------------------------------------------- */
/* Social                                                                      */
/* -------------------------------------------------------------------------- */

export type SocialNetwork = "linkedin" | "x" | "instagram";

export interface SocialLink {
  readonly network: SocialNetwork;
  readonly label: string;
  /** `null` means the account is not live yet — the link is not rendered. */
  readonly url: string | null;
}

/**
 * Social accounts.
 *
 * Only entries with a real URL are rendered anywhere on the site, and only
 * those are emitted into the Organization schema's `sameAs`. A dead "#" link is
 * worse than no icon at all, so unconfirmed networks stay `null` until the URL
 * is supplied. Fill in a URL here and the icon appears automatically.
 */
export const socials: readonly SocialLink[] = [
  // PENDING: awaiting the official LinkedIn company page URL from the client.
  { network: "linkedin", label: "LinkedIn", url: null },
  // Not launched yet — confirmed with the client.
  { network: "x", label: "X", url: null },
  { network: "instagram", label: "Instagram", url: null },
];

export function activeSocials(): readonly (SocialLink & { url: string })[] {
  return socials.filter(
    (s): s is SocialLink & { url: string } => typeof s.url === "string" && s.url.length > 0,
  );
}

/* -------------------------------------------------------------------------- */
/* Feature flags                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Whether sections whose content is still pending should render a visible
 * placeholder.
 *
 * On by default in development so the team can see the full page architecture,
 * off in production so visitors never meet an empty "coming soon" panel. Set
 * NEXT_PUBLIC_SHOW_PENDING_SECTIONS=true to force placeholders on in a
 * preview deployment for review.
 */
export function showPendingSections(): boolean {
  const explicit = process.env.NEXT_PUBLIC_SHOW_PENDING_SECTIONS?.trim();
  if (explicit === "true") return true;
  if (explicit === "false") return false;
  return process.env.NODE_ENV === "development";
}

/* -------------------------------------------------------------------------- */
/* Analytics                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Google Analytics measurement ID, e.g. "G-XXXXXXXXXX".
 *
 * No placeholder or example ID ships in the codebase: analytics is inert until
 * a real value is configured in the deployment environment.
 */
export function analyticsId(): string | null {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return id && /^G-[A-Z0-9]+$/i.test(id) ? id : null;
}

/** Google Search Console HTML-tag verification token, if used. */
export function searchConsoleVerification(): string | null {
  return process.env.NEXT_PUBLIC_GSC_VERIFICATION?.trim() || null;
}
