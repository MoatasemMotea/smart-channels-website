import type { Dictionary } from "@/i18n";
import { Container, Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { stagger } from "@/lib/motion";

/**
 * Why Smart Channels.
 *
 * Six operating principles, numbered rather than iconified. Icons here would be
 * decorative at best — there is no meaningful glyph for "partnership, not
 * transactions" — and a numbered list reads as a considered position rather
 * than a feature grid.
 *
 * Every item is a statement about *how the company works*, which Smart Channels
 * can assert about itself. None of them claim a result, a client or a metric.
 */
export function WhyUs({ dict }: { dict: Dictionary }) {
  return (
    <Section id="why" labelledBy="why-heading" tone="subtle" env="bright">
      <Container>
        <SectionHeading
          id="why-heading"
          eyebrow={dict.why.eyebrow}
          heading={dict.why.heading}
          body={dict.why.body}
        />

        <ul className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {dict.why.items.map((item, index) => (
            <li key={item.title} className="bg-surface">
              <Reveal delay={stagger(index, 0.05)} className="h-full">
                <div className="group h-full p-7 transition-colors duration-300 hover:bg-bg-subtle sm:p-8">
                  <span
                    aria-hidden="true"
                    className="numerals-latin inline-flex text-sm font-bold text-accent tabular-nums"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-fg-strong">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
