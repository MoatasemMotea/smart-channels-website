/**
 * Locale configuration.
 *
 * English is the default language and is served from `/en`. There is no
 * un-prefixed variant of a page: `/` redirects to `/en`. Keeping every page on
 * an explicit locale prefix means canonical URLs, hreflang alternates and the
 * language switcher all have exactly one URL per language per page, which is
 * what search engines need and what avoids duplicate-content ambiguity.
 */

export const locales = ["en", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export type Direction = "ltr" | "rtl";

export const localeDirection: Record<Locale, Direction> = {
  en: "ltr",
  ar: "rtl",
};

/**
 * BCP-47 tags used for `<html lang>`, hreflang and `Intl` formatting.
 * `ar-SA` rather than bare `ar` because the audience is specifically Saudi.
 */
export const localeHrefLang: Record<Locale, string> = {
  en: "en",
  ar: "ar-SA",
};

export const localeOpenGraph: Record<Locale, string> = {
  en: "en_US",
  ar: "ar_SA",
};

/**
 * Each language is labelled in its own script. A user who has landed on the
 * wrong language cannot read a label written in the language they don't speak,
 * so "العربية" is never rendered as "Arabic".
 */
export const localeNames: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

/** Compact label for the switcher on narrow viewports. */
export const localeShortNames: Record<Locale, string> = {
  en: "EN",
  ar: "ع",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDirection(locale: Locale): Direction {
  return localeDirection[locale];
}

/** The other locale — the one the switcher should offer. */
export function getAlternateLocale(locale: Locale): Locale {
  return locale === "en" ? "ar" : "en";
}
