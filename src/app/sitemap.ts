import type { MetadataRoute } from "next";
import { localeHrefLang, locales } from "@/i18n/config";
import { absoluteUrl, localePath, routes } from "@/lib/routes";
import { getSiteUrl } from "@/lib/site";

/**
 * Sitemap.
 *
 * Emits every locale variant of every page, each carrying `alternates.languages`
 * so search engines can see the pages are translations of one another rather
 * than duplicates competing with each other.
 *
 * Driven by the `routes` map, so adding a page means adding it in one place.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  const paths = Object.values(routes);

  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: absoluteUrl(siteUrl, localePath(locale, path)),
      lastModified,
      changeFrequency: "monthly" as const,
      // The landing page is the entry point; the company profile supports it.
      priority: path === routes.home ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [
            localeHrefLang[l],
            absoluteUrl(siteUrl, localePath(l, path)),
          ]),
        ),
      },
    })),
  );
}
