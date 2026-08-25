import Image from "next/image";
import { Check, ChevronDown } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { productCategories, servicesByGroup } from "@/data/services";
import { Container, Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { stagger } from "@/lib/motion";
import { Icon } from "@/components/ui/Icon";

/**
 * Solutions.
 *
 * The nine services are grouped under the three capability areas the client
 * uses (IT services, networks, security & specialised systems) rather than
 * presented as a flat nine-card grid. Nine equal cards give a reader no way in;
 * three labelled groups let them find the one that matches their problem.
 *
 * Product/hardware categories are folded in at the bottom of this section as a
 * compact list. They are the equipment behind the services, not a separate
 * business line, and a spec-free product catalogue would add nothing for the
 * enterprise buyer this page is written for.
 */
export function Solutions({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const groups = servicesByGroup();

  return (
    <Section id="solutions" labelledBy="solutions-heading" tone="subtle" env="bright" seam>
      <Container>
        <SectionHeading
          id="solutions-heading"
          eyebrow={dict.solutions.eyebrow}
          heading={dict.solutions.heading}
          body={dict.solutions.body}
        />

        <div className="mt-16 space-y-16">
          {groups.map((entry) => (
            <div key={entry.group.id}>
              <Reveal>
                <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                  <h3 className="text-xl font-bold text-fg-strong sm:text-2xl">
                    {entry.group.title[locale]}
                  </h3>
                  <p className="max-w-xl text-sm leading-relaxed text-fg-muted">
                    {entry.group.description[locale]}
                  </p>
                </div>
              </Reveal>

              <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {entry.items.map((service, index) => (
                  <li key={service.id}>
                    <Reveal delay={stagger(index)} className="h-full">
                      <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-[border-color,box-shadow,transform] duration-300 ease-[var(--ease-brand)] hover:border-border-brand hover:shadow-[var(--shadow-lift)] motion-safe:hover:-translate-y-1">
                        {service.image ? (
                          <div className="relative aspect-[16/10] overflow-hidden bg-bg-inset">
                            <Image
                              src={service.image.src}
                              alt={service.image.alt[locale]}
                              width={service.image.width}
                              height={service.image.height}
                              sizes="(min-width: 1280px) 26rem, (min-width: 640px) 45vw, 92vw"
                              loading="lazy"
                              className="size-full object-cover transition-transform duration-700 ease-[var(--ease-brand)] motion-safe:group-hover:scale-105"
                            />
                            {/* Keeps the icon legible over any photograph. */}
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-950/10 to-transparent"
                            />
                            <span
                              aria-hidden="true"
                              className="absolute bottom-3 start-3 inline-flex size-10 items-center justify-center rounded-md bg-magenta-600 text-white shadow-lg"
                            >
                              <Icon name={service.icon} className="size-5" />
                            </span>
                          </div>
                        ) : null}

                        <div className="flex flex-1 flex-col p-6">
                          <h4 className="text-base leading-snug font-bold text-fg-strong">
                            {service.title[locale]}
                          </h4>
                          <p className="mt-3 mb-5 text-sm leading-relaxed text-fg-muted">
                            {service.summary[locale]}
                          </p>

                          {/* Capabilities are disclosed, not listed.

                              Rendered open, this list was 32% of every card and
                              the section was 41% of the entire mobile page —
                              7,237px of 17,524px, nine screens of one section.
                              A homepage should preview the solutions; the
                              reader comparing two of them opens the two.

                              A native <details> rather than a scripted
                              accordion: it is keyboard operable, announced
                              correctly as expanded/collapsed, works with
                              JavaScript disabled, and — because the content is
                              in the DOM either way — is fully indexed. Nothing
                              is lost by closing it, which is the only reason
                              closing it is acceptable. */}
                          {/* mt-auto: the cards are stretched to a common row height, so
                              without it the disclosure floats at whatever height that
                              card's title happened to end at and the row of controls
                              looks ragged. */}
                          <details className="group/caps mt-auto border-t border-border pt-4">
                            <summary /* No focus-visible styling here on purpose. globals.css already
                                  gives every focusable element one consistent outline;
                                  an earlier version of this line set
                                  focus-visible:outline-none and replaced it with a
                                  shadow that never applied, which silently removed the
                                  focus indicator from nine controls. */
                              className="flex cursor-pointer list-none items-center justify-between gap-3 text-2xs font-bold tracking-[0.14em] uppercase text-fg-subtle transition-colors duration-200 hover:text-accent [&::-webkit-details-marker]:hidden">
                              {dict.solutions.capabilitiesLabel}
                              <ChevronDown
                                aria-hidden="true"
                                className="size-4 shrink-0 transition-transform duration-200 ease-[var(--ease-brand)] group-open/caps:rotate-180"
                              />
                            </summary>
                            <ul className="mt-3 space-y-2">
                              {service.capabilities[locale].map((capability) => (
                                <li
                                  key={capability}
                                  className="flex items-start gap-2.5 text-sm text-fg-muted"
                                >
                                  <Check
                                    aria-hidden="true"
                                    className="mt-0.5 size-4 shrink-0 text-accent"
                                  />
                                  <span>{capability}</span>
                                </li>
                              ))}
                            </ul>
                          </details>
                        </div>
                      </article>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* --- Products & hardware --- */}
        <Reveal>
          <div className="mt-16 rounded-lg border border-border bg-surface p-7 sm:p-9">
            <div className="max-w-2xl">
              <h3 className="text-xl font-bold text-fg-strong sm:text-2xl">
                {dict.solutions.products.heading}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted sm:text-base">
                {dict.solutions.products.body}
              </p>
            </div>

            <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {productCategories.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-bg-subtle px-3.5 py-3 transition-colors duration-200 hover:border-border-brand"
                >
                  <Icon
                    name={product.icon}
                    className="size-[18px] shrink-0 text-accent"
                  />
                  <span className="text-sm font-bold text-fg">
                    {product.title[locale]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
