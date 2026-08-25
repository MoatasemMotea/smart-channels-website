import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/lib/routes";

export interface NavItem {
  readonly key: string;
  readonly label: string;
  readonly href: string;
  /** In-page anchors drive scroll-spy; page links do not. */
  readonly isAnchor: boolean;
}

/**
 * Primary navigation.
 *
 * Deliberately short. The site is two pages by design, so the nav points at
 * the four landing-page sections a buyer actually navigates to, plus the
 * company profile. Adding every section would turn a wayfinding aid into a
 * table of contents.
 *
 * Anchors are absolute (`/en#solutions`) rather than bare (`#solutions`) so the
 * same nav works from `/company`, where a bare fragment would resolve against
 * the wrong page.
 */
export function primaryNav(locale: Locale, dict: Dictionary): readonly NavItem[] {
  const home = localePath(locale, "/");
  return [
    { key: "solutions", label: dict.nav.solutions, href: `${home}#solutions`, isAnchor: true },
    { key: "industries", label: dict.nav.industries, href: `${home}#industries`, isAnchor: true },
    { key: "why", label: dict.nav.why, href: `${home}#why`, isAnchor: true },
    { key: "company", label: dict.nav.company, href: localePath(locale, "/company"), isAnchor: false },
    { key: "contact", label: dict.nav.contact, href: `${home}#contact`, isAnchor: true },
  ];
}

/** Footer navigation — the primary items plus the sections omitted from the header. */
export function footerNav(locale: Locale, dict: Dictionary): readonly NavItem[] {
  const home = localePath(locale, "/");
  return [
    { key: "about", label: dict.nav.about, href: `${home}#about`, isAnchor: true },
    { key: "solutions", label: dict.nav.solutions, href: `${home}#solutions`, isAnchor: true },
    { key: "industries", label: dict.nav.industries, href: `${home}#industries`, isAnchor: true },
    { key: "why", label: dict.nav.why, href: `${home}#why`, isAnchor: true },
    { key: "company", label: dict.nav.company, href: localePath(locale, "/company"), isAnchor: false },
    { key: "contact", label: dict.nav.contact, href: `${home}#contact`, isAnchor: true },
  ];
}

/** Section ids observed by the scroll-spy, in document order. */
export const scrollSpySections = [
  "about",
  "solutions",
  "industries",
  "why",
  "work",
  "contact",
] as const;
