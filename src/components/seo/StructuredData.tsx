import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { services } from "@/data/services";
import { absoluteUrl, localePath } from "@/lib/routes";
import { activeSocials, company, contact, getSiteUrl } from "@/lib/site";

/**
 * JSON-LD structured data.
 *
 * Every property below maps to a fact confirmed by the client. Nothing is
 * padded out to make the graph look richer: no invented `foundingDate` beyond
 * the supplied year, no `aggregateRating`, no `numberOfEmployees`, no award
 * entries. Google penalises structured data that does not match visible page
 * content, and an enterprise buyer can check these claims.
 *
 * `sameAs` is populated only from social accounts that actually exist — see
 * `activeSocials()`.
 */

function jsonLd(data: Record<string, unknown>) {
  return (
    <script
      type="application/ld+json"
      // Sanitised: `<` is escaped so a stray character in content can never
      // close the script tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function OrganizationSchema({ locale }: { locale: Locale }) {
  const siteUrl = getSiteUrl();
  const dict = getDictionary(locale);
  const socials = activeSocials();

  const organization: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: company.name.en,
    alternateName: company.name.ar,
    legalName: company.name.en,
    slogan: company.tagline,
    description: dict.meta.home.description,
    url: absoluteUrl(siteUrl, localePath(locale, "/")),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(siteUrl, "/images/logo/smart-channels.png"),
      width: 400,
      height: 150,
    },
    image: absoluteUrl(siteUrl, "/images/og/share-card.png"),
    foundingDate: String(company.foundedYear),
    address: {
      "@type": "PostalAddress",
      addressLocality: company.address.district.en,
      addressRegion: company.address.city.en,
      addressCountry: company.address.countryCode,
    },
    areaServed: {
      "@type": "Country",
      name: "Saudi Arabia",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: contact.phone.e164,
        email: contact.email,
        availableLanguage: ["en", "ar"],
        areaServed: "SA",
      },
    ],
    knowsAbout: services.map((service) => service.title.en),
  };

  if (socials.length > 0) {
    organization.sameAs = socials.map((social) => social.url);
  }

  /* LocalBusiness is justified here: Smart Channels operates from a physical
     Riyadh address that visitors are directed to via a Maps link. It is
     deliberately minimal — no opening hours, price range or geo coordinates,
     because none of those have been confirmed, and a guessed coordinate would
     put a real business pin in the wrong place. */
  const localBusiness: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteUrl}/#localbusiness`,
    name: company.name.en,
    parentOrganization: { "@id": `${siteUrl}/#organization` },
    url: absoluteUrl(siteUrl, localePath(locale, "/")),
    telephone: contact.phone.e164,
    email: contact.email,
    hasMap: contact.mapsUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: company.address.district.en,
      addressRegion: company.address.city.en,
      addressCountry: company.address.countryCode,
    },
    areaServed: { "@type": "Country", name: "Saudi Arabia" },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: dict.meta.siteName,
    inLanguage: locale === "ar" ? "ar-SA" : "en",
    publisher: { "@id": `${siteUrl}/#organization` },
  };

  return (
    <>
      {jsonLd(organization)}
      {jsonLd(localBusiness)}
      {jsonLd(website)}
    </>
  );
}

/**
 * Breadcrumbs for the company page. Not emitted on the home page, where a
 * single-item breadcrumb carries no information.
 */
export function BreadcrumbSchema({
  locale,
  items,
}: {
  locale: Locale;
  items: readonly { name: string; path: string }[];
}) {
  const siteUrl = getSiteUrl();

  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(siteUrl, localePath(locale, item.path)),
    })),
  });
}
