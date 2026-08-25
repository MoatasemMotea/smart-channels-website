import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { buildMetadata } from "@/lib/seo";
import { Opening } from "@/components/sections/Opening";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { TrackRecord } from "@/components/sections/TrackRecord";
import { Solutions } from "@/components/sections/Solutions";
import { Industries } from "@/components/sections/Industries";
import { WhyUs } from "@/components/sections/WhyUs";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { GallerySection } from "@/components/sections/GallerySection";
import { Clients, Partners } from "@/components/sections/PartnersClients";
import { Contact } from "@/components/sections/Contact";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, page: "home" });
}

/**
 * Landing page.
 *
 * SECTION ORDER — this follows a buyer's questions in the order they ask them,
 * rather than the order the brief listed them in:
 *
 *   Hero        what is this, and what do they do?
 *   About       who are they?
 *   Solutions   what exactly can they deliver?      ← the core of the page
 *   Industries  do they work in environments like mine?
 *   Why us      why them rather than someone else?
 *   Work        can they show it?     (projects / gallery — conditional)
 *   Credibility who backs them, who trusts them?    (partners / clients)
 *   Contact     how do I start?
 *
 * Proof sections sit *after* the argument rather than in the middle of it,
 * which also means the four collections still awaiting content are contiguous
 * — so while they are empty the page reads as a continuous, finished piece
 * instead of one with holes punched through it.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return (
    <>
      <Opening locale={locale} dict={dict} />
      <Hero locale={locale} dict={dict} />
      <About locale={locale} dict={dict} />
      <TrackRecord locale={locale} dict={dict} />
      <FeaturedProjects locale={locale} dict={dict} />
      <Solutions locale={locale} dict={dict} />
      <Industries locale={locale} dict={dict} />
      <WhyUs dict={dict} />

      {/* Conditional: each renders only when its collection has content.
          See src/lib/collections.ts. */}
      <GallerySection locale={locale} dict={dict} />
      <Partners dict={dict} />
      <Clients locale={locale} dict={dict} />

      <Contact locale={locale} dict={dict} />
    </>
  );
}
