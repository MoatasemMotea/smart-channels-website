import type { Locale } from "@/i18n/config";
import { defaultLocale, isLocale, locales } from "@/i18n/config";

/**
 * Route helpers.
 *
 * Every page lives under an explicit locale prefix (`/en/...`, `/ar/...`).
 * These helpers are the only place URLs are assembled, so the prefix rule
 * cannot drift between the header, the footer, the sitemap and the language
 * switcher.
 */

/** Pages that exist in every locale, as paths without the locale prefix. */
export const routes = {
  home: "/",
  company: "/company",
} as const;

export type RoutePath = (typeof routes)[keyof typeof routes];

/** Build a locale-prefixed path: `localePath("ar", "/company")` → `/ar/company`. */
export function localePath(locale: Locale, path: string): string {
  const normalised = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalised}`;
}

/** Build an absolute URL for canonicals, hreflang and structured data. */
export function absoluteUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/$/, "");
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalised}`;
}

/**
 * Strip the locale prefix from a pathname, returning the route beneath it.
 *
 * Used by the language switcher so that switching language on `/en/company`
 * lands on `/ar/company` rather than dumping the user back on the home page —
 * losing your place is the most common failure of a naive locale switcher.
 * Any in-page fragment is preserved by the caller.
 */
export function stripLocale(pathname: string): { locale: Locale; path: string } {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (first !== undefined && isLocale(first)) {
    const rest = segments.slice(1).join("/");
    return { locale: first, path: rest ? `/${rest}` : "/" };
  }

  return { locale: defaultLocale, path: pathname || "/" };
}

/** Swap the locale on a pathname, keeping the page. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const { path } = stripLocale(pathname);
  return localePath(target, path);
}

/** Every locale-prefixed URL for a given route — used to build the sitemap. */
export function allLocaleUrls(siteUrl: string, path: string): Record<Locale, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, absoluteUrl(siteUrl, localePath(locale, path))]),
  ) as Record<Locale, string>;
}
