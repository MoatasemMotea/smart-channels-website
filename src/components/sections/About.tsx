import { ArrowRight, ArrowLeft } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { localePath } from "@/lib/routes";
import { company } from "@/lib/site";
import { Container, Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { LinkButton } from "@/components/ui/Button";

/**
 * About.
 *
 * The `lead` paragraph is Smart Channels' own positioning statement, carried
 * over from the source material with only light copy-editing. It is set as a
 * pull quote because it is the company's voice rather than ours, and it earns
 * the emphasis.
 */
export function About({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <Section id="about" labelledBy="about-heading" tone="default" env="bright" seam>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <SectionHeading
              id="about-heading"
              eyebrow={dict.about.eyebrow}
              heading={dict.about.heading}
            />

            <Reveal delay={0.12}>
              <blockquote className="mt-8 border-s-2 border-accent ps-5">
                <p className="text-lg leading-relaxed text-fg italic sm:text-xl">
                  {dict.about.lead}
                </p>
              </blockquote>
            </Reveal>

            {/* Establishment year and base, stated in the About section itself
                rather than only in the hero's fact strip. Both values come from
                `company` in src/lib/site.ts — the single source of truth — so a
                correction to either lands everywhere at once. The year is
                wrapped in `.numerals-latin` because Saudi business contexts read
                and dial years and numbers in Latin digits even in Arabic copy. */}
            <Reveal delay={0.16}>
              <dl className="mt-7 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                <dt className="font-bold text-fg-strong">
                  {dict.about.facts.founded.label}
                </dt>
                <dd className="numerals-latin font-bold text-accent">
                  {company.foundedYear}
                </dd>
                <span aria-hidden="true" className="px-1 text-fg-subtle">
                  ·
                </span>
                <dt className="sr-only">
                  {dict.about.facts.headquarters.label}
                </dt>
                <dd className="text-fg-muted">{company.address.full[locale]}</dd>
              </dl>
            </Reveal>

            <Reveal delay={0.22}>
              <LinkButton
                href={localePath(locale, "/company")}
                variant="outline"
                className="mt-8"
              >
                {dict.about.cta}
                <Arrow aria-hidden="true" className="size-4" />
              </LinkButton>
            </Reveal>
          </div>

          <div className="space-y-6 lg:pt-4">
            {dict.about.body.map((paragraph, index) => (
              <Reveal key={index} delay={0.06 * index}>
                <p className="text-base leading-relaxed text-fg-muted sm:text-lg">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
