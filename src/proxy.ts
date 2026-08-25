import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

/**
 * Locale routing.
 *
 * Uses the `proxy` file convention (Next.js 16's replacement for `middleware`).
 *
 * Every page lives under an explicit locale prefix, so this middleware only has
 * to do one thing: send prefix-less requests to a prefixed URL. `/` becomes
 * `/en`, `/company` becomes `/en/company`.
 *
 * Language *detection* is deliberately limited. English is the specified
 * default, and a Saudi visitor whose browser reports `ar` is served Arabic —
 * but only on the bare entry point `/`. Redirecting a deep link based on a
 * header would break shared URLs, so `/company` always resolves to the default
 * locale and the user switches from there if they want to.
 */


function detectLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language");
  if (!header) return defaultLocale;

  // Parse "ar-SA,ar;q=0.9,en;q=0.8" into a quality-ordered list of base tags.
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const quality = q ? Number.parseFloat(q.split("=")[1] ?? "1") : 1;
      return { tag: tag.trim().toLowerCase().split("-")[0] ?? "", quality };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    if (isLocale(tag)) return tag;
  }
  return defaultLocale;
}

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Already carries a supported locale prefix — nothing to do.
  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first)) return NextResponse.next();

  // Only the bare entry point negotiates language from the browser.
  const locale = pathname === "/" ? detectLocale(request) : defaultLocale;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  url.search = search;

  return NextResponse.redirect(url, 307);
}

export const config = {
  /**
   * Skip Next internals, the API routes and any request that looks like a
   * static file, so the middleware never rewrites an asset URL or a form POST.
   */
  matcher: [
    "/((?!_next/static|_next/image|api/|favicon.ico|robots.txt|sitemap.xml|images/|.*\\..*).*)",
  ],
};
