import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/routes";
import { getSiteUrl, hasCanonicalDomain } from "@/lib/site";

/**
 * robots.txt
 *
 * While no production domain is configured, crawling is disallowed outright.
 * A preview deployment that gets indexed on a temporary URL competes with the
 * real site once it launches and dilutes its authority — a genuinely costly
 * mistake and an awkward one to unwind.
 *
 * Setting NEXT_PUBLIC_SITE_URL flips this to a normal allow-all with a sitemap
 * reference. Nothing else needs to change at launch.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  if (!hasCanonicalDomain()) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The contact endpoint accepts POST only; there is nothing to crawl.
        disallow: ["/api/"],
      },
    ],
    sitemap: absoluteUrl(siteUrl, "/sitemap.xml"),
    host: siteUrl,
  };
}
