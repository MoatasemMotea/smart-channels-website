import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getDirection, isLocale, locales } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { primaryNav } from "@/data/navigation";
import {
  ThemeProvider,
  openingBootstrapScript,
  themeBootstrapScript,
} from "@/components/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { Analytics } from "@/components/analytics/Analytics";
import { buildMetadata } from "@/lib/seo";
import { OrganizationSchema } from "@/components/seo/StructuredData";
import "../globals.css";

/**
 * This is the application's root layout.
 *
 * It lives under `[locale]` rather than at `app/` because `<html lang>` and
 * `<html dir>` must be correct in the server-rendered HTML — not patched in by
 * an effect after hydration. A screen reader needs the language before it
 * speaks a word, and RTL needs `dir` before first paint or the whole page
 * visibly reflows. Requests without a locale prefix are redirected by
 * `src/middleware.ts`.
 */

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, page: "home" });
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0c11" },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const dir = getDirection(locale);
  const nav = primaryNav(locale, dict);

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        {/* Runs before first paint so the correct theme is applied without a
            flash of the wrong colour scheme. See ThemeProvider for detail. */}
        <script
          dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
        />
        {/* Decides whether the homepage's cinematic opening plays. Also before
            paint, because the overlay must be up in the first frame or it is a
            flash of the page followed by a curtain, which is worse than no
            opening at all. See Opening.tsx. */}
        <script
          dangerouslySetInnerHTML={{ __html: openingBootstrapScript }}
        />
      </head>
      <body className="min-h-dvh antialiased">
        <ThemeProvider>
          <a href="#main" className="sr-only-focusable z-100 m-3 rounded-md bg-magenta-600 px-4 py-2.5 text-sm font-bold text-white">
            {dict.common.skipToContent}
          </a>

          <Header locale={locale} dict={dict} nav={nav} />

          <main id="main" className="pt-[var(--spacing-header)]">
            {children}
          </main>

          <Footer locale={locale} dict={dict} />

          {/* One observer drives every [data-reveal] element on the page. */}
          <RevealObserver />
        </ThemeProvider>

        <OrganizationSchema locale={locale} />
        <Analytics />
      </body>
    </html>
  );
}
