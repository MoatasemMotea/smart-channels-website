import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { localeHrefLang, localeOpenGraph, locales } from "@/i18n/config";
import { format, getDictionary } from "@/i18n";
import { absoluteUrl, localePath } from "./routes";
import { company, getSiteUrl, hasCanonicalDomain, searchConsoleVerification } from "./site";

/**
 * Metadata construction.
 *
 * The production domain is not yet confirmed, so no domain is ever hard-coded.
 * Everything derives from `getSiteUrl()`, which reads NEXT_PUBLIC_SITE_URL (or
 * Vercel's deployment URL). Point that at the real domain and every canonical,
 * hreflang, sitemap entry and Open Graph URL follows — with no code change.
 *
 * Until a real domain is configured the site is marked `noindex`. Letting a
 * preview deployment get indexed on a temporary URL is a genuinely damaging SEO
 * mistake: it splits authority and can outrank the real site once it launches.
 */

type Page = "home" | "company";

const pagePath: Record<Page, string> = {
  home: "/",
  company: "/company",
};

export function buildMetadata({
  locale,
  page,
}: {
  locale: Locale;
  page: Page;
}): Metadata {
  const dict = getDictionary(locale);
  const siteUrl = getSiteUrl();
  const path = pagePath[page];
  const canonical = absoluteUrl(siteUrl, localePath(locale, path));

  const title =
    page === "home" ? dict.meta.home.title : `${dict.meta.company.title} — ${dict.meta.siteName}`;

  /* The company description carries a {year} placeholder rather than a literal
     establishment year, so the year has exactly one source of truth
     (`company.foundedYear`) across the UI, the structured data and the meta
     tags. Interpolating here is what keeps a correction to that one value from
     having to be chased through the translation files. */
  const description =
    page === "home"
      ? dict.meta.home.description
      : format(dict.meta.company.description, { year: company.foundedYear });

  /* hreflang: every locale variant of *this* page, plus x-default pointing at
     English as the specified default language. */
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[localeHrefLang[l]] = absoluteUrl(siteUrl, localePath(l, path));
  }
  languages["x-default"] = absoluteUrl(siteUrl, localePath("en", path));

  const indexable = hasCanonicalDomain();
  const verification = searchConsoleVerification();

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    applicationName: dict.meta.siteName,
    alternates: { canonical, languages },
    openGraph: {
      type: "website",
      siteName: dict.meta.siteName,
      title,
      description,
      url: canonical,
      locale: localeOpenGraph[locale],
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => localeOpenGraph[l]),
      images: [
        {
          url: "/images/og/share-card.png",
          width: 1200,
          height: 630,
          alt: `${dict.meta.siteName} — ${dict.meta.tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og/share-card.png"],
    },
    robots: indexable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : // No confirmed domain yet — keep preview deployments out of the index.
        { index: false, follow: false },
    icons: {
      icon: [
        { url: "/images/logo/icon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/images/logo/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/images/logo/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/images/logo/apple-touch-icon.png", sizes: "180x180" }],
    },
    manifest: "/manifest.webmanifest",
    ...(verification ? { verification: { google: verification } } : {}),
    formatDetection: {
      // The phone number is an explicit tel: link; automatic detection would
      // also linkify unrelated numbers and restyle them unpredictably on iOS.
      telephone: false,
    },
  };
}
