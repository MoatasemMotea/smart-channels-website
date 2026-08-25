import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { isLocale } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { buildMetadata } from "@/lib/seo";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import { services, serviceGroups } from "@/data/services";
import { certifications } from "@/data/certifications";
import { sectionMode } from "@/lib/collections";
import { company } from "@/lib/site";
import { localePath } from "@/lib/routes";
import { Container, Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { stagger } from "@/lib/motion";
import { LinkButton } from "@/components/ui/Button";
import { PendingSection } from "@/components/ui/PendingSection";
import { Icon } from "@/components/ui/Icon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, page: "company" });
}

/**
 * Company profile.
 *
 * Contains only what Smart Channels can state about itself: its positioning,
 * its stated vision and mission, its values, the capabilities evidenced by its
 * service list, and its delivery approach. There is no timeline, no leadership
 * section and no milestone list, because none of that was supplied — and a
 * fabricated history is exactly the kind of thing a procurement team checks.
 */
export default async function CompanyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  const certificationsMode = sectionMode(certifications);

  return (
    <>
      <BreadcrumbSchema
        locale={locale}
        items={[
          { name: dict.nav.home, path: "/" },
          { name: dict.company.hero.eyebrow, path: "/company" },
        ]}
      />

      {/* --- Page header --- */}
      <section
        aria-labelledby="company-heading"
        className="relative isolate overflow-hidden border-b border-border bg-bg"
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
          <div className="absolute -top-1/3 end-[-10%] size-[min(34rem,80vw)] rounded-full bg-[radial-gradient(circle,var(--glow-1),transparent_70%)] blur-[110px]" />
        </div>

        <Container>
          <div className="py-20 sm:py-24 lg:py-28">
            <Reveal>
              <p className="text-xs font-bold tracking-[0.16em] uppercase text-accent">
                {dict.company.hero.eyebrow}
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1
                id="company-heading"
                className="mt-4 text-[clamp(2rem,5.5vw,3.5rem)] leading-[1.1] font-bold tracking-tight"
              >
                {dict.company.hero.heading}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted">
                {dict.company.hero.body}
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <dl className="mt-12 grid max-w-xl grid-cols-2 gap-6 border-t border-border pt-8">
                <div>
                  <dt className="text-xs font-bold tracking-[0.1em] uppercase text-fg-subtle">
                    {dict.about.facts.founded.label}
                  </dt>
                  <dd className="numerals-latin mt-1.5 text-base font-bold text-fg-strong">
                    {company.foundedYear}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold tracking-[0.1em] uppercase text-fg-subtle">
                    {dict.about.facts.headquarters.label}
                  </dt>
                  <dd className="mt-1.5 text-base font-bold text-fg-strong">
                    {company.address.city[locale]}
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* --- Who we are --- */}
      <Section labelledBy="intro-heading" tone="default">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] lg:gap-16">
            <SectionHeading id="intro-heading" heading={dict.company.intro.heading} />
            <div className="space-y-6">
              {dict.about.body.map((paragraph, index) => (
                <Reveal key={index} delay={0.05 * index}>
                  <p className="text-base leading-relaxed text-fg-muted sm:text-lg">
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* --- Vision & mission --- */}
      <Section tone="subtle">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { heading: dict.company.vision.heading, body: dict.company.vision.body },
              { heading: dict.company.mission.heading, body: dict.company.mission.body },
            ].map((item, index) => (
              <Reveal key={item.heading} delay={stagger(index, 0.08)}>
                <article className="h-full rounded-lg border border-border bg-surface p-8 sm:p-10">
                  <h2 className="text-xl font-bold text-fg-strong sm:text-2xl">
                    {item.heading}
                  </h2>
                  <div
                    aria-hidden="true"
                    className="mt-4 h-0.5 w-12 rounded-full bg-accent"
                  />
                  <p className="mt-5 text-base leading-relaxed text-fg-muted">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* --- Values --- */}
      <Section labelledBy="values-heading" tone="default">
        <Container>
          <SectionHeading id="values-heading" heading={dict.company.values.heading} />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2">
            {dict.company.values.items.map((value, index) => (
              <li key={value.title}>
                <Reveal delay={stagger(index, 0.06)} className="h-full">
                  <div className="flex h-full gap-4 rounded-lg border border-border bg-surface p-6 sm:p-7">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent"
                    >
                      <Check className="size-4" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-fg-strong">
                        {value.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                        {value.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* --- Capabilities ---
          Generated from the same service data the landing page uses, so the two
          can never drift apart as services are added or renamed. */}
      <Section labelledBy="capabilities-heading" tone="subtle">
        <Container>
          <SectionHeading
            id="capabilities-heading"
            heading={dict.company.capabilities.heading}
            body={dict.company.capabilities.body}
          />
          <div className="mt-12 space-y-8">
            {serviceGroups.map((group, groupIndex) => (
              <Reveal key={group.id} delay={stagger(groupIndex, 0.06)}>
                <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-fg-strong">
                    {group.title[locale]}
                  </h3>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {services
                      .filter((service) => service.group === group.id)
                      .map((service) => (
                        <li
                          key={service.id}
                          className="flex items-start gap-3 rounded-md bg-bg-subtle px-4 py-3"
                        >
                          <Icon
                            name={service.icon}
                            className="mt-0.5 size-4 shrink-0 text-accent"
                          />
                          <span className="text-sm leading-snug text-fg">
                            {service.title[locale]}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* --- Approach --- */}
      <Section labelledBy="approach-heading" tone="default">
        <Container>
          <SectionHeading id="approach-heading" heading={dict.company.approach.heading} />
          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {dict.company.approach.steps.map((step, index) => (
              <li key={step.title}>
                <Reveal delay={stagger(index, 0.07)} className="h-full">
                  <div className="relative h-full rounded-lg border border-border bg-surface p-6">
                    <span className="numerals-latin text-sm font-bold text-accent tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 text-base font-bold text-fg-strong">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* --- Certifications (pending) --- */}
      {certificationsMode === "placeholder" ? (
        <PendingSection
          id="certifications"
          eyebrow={dict.certifications.eyebrow}
          heading={dict.certifications.heading}
          note={dict.certifications.pending}
          detail={certifications.pendingNote}
          tone="subtle"
        />
      ) : certificationsMode === "content" ? (
        <Section labelledBy="certifications-heading" tone="subtle">
          <Container>
            <SectionHeading
              id="certifications-heading"
              eyebrow={dict.certifications.eyebrow}
              heading={dict.certifications.heading}
            />
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {certifications.items.map((certification, index) => (
                <li key={certification.id}>
                  <Reveal delay={stagger(index, 0.06)} className="h-full">
                    <div className="h-full rounded-lg border border-border bg-surface p-6">
                      <h3 className="text-base font-bold text-fg-strong">
                        {certification.name[locale]}
                      </h3>
                      <p className="mt-2 text-sm text-fg-muted">
                        {certification.issuer[locale]}
                      </p>
                      {certification.issuedYear ? (
                        <p className="numerals-latin mt-1 text-xs text-fg-subtle">
                          {certification.issuedYear}
                        </p>
                      ) : null}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      {/* --- CTA --- */}
      <Section tone="default" spacing="tight">
        <Container>
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-lg border border-border-brand bg-surface p-8 text-center sm:p-12">
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,var(--glow-1),transparent_65%)]"
              />
              <h2 className="text-2xl font-bold text-fg-strong sm:text-3xl">
                {dict.company.cta.heading}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-fg-muted">
                {dict.company.cta.body}
              </p>
              <LinkButton
                href={`${localePath(locale, "/")}#contact`}
                size="lg"
                className="mt-8"
              >
                {dict.company.cta.action}
                <Arrow aria-hidden="true" className="size-[18px]" />
              </LinkButton>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
