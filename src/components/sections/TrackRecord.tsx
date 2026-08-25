import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { format } from "@/i18n";
import { company } from "@/lib/site";
import { trackRecordStats, trackRecordPublication } from "@/data/track-record";
import { Container, Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Track record.
 *
 * The first `deep` beat after the opening: the page has introduced the company
 * and now has to make one substantiated claim before asking for anything. It
 * sits between About and Solutions for that reason — proof, then detail.
 *
 * WHAT IS NOT HERE is as deliberate as what is. No project count, no revenue,
 * no "customer satisfaction", no market position, no partner logos. Four
 * figures, each traceable to either a client confirmation or a count of
 * content already published on this site; see src/data/track-record.ts, where
 * every value carries its source. An unsourceable fifth number would cost more
 * credibility than it bought.
 */
export function TrackRecord({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const stats = trackRecordStats;
  const copy = dict.trackRecord;
  const publication = trackRecordPublication[locale];

  return (
    <Section
      id="track-record"
      labelledBy="track-record-heading"
      tone="default"
      env="bright"
      spacing="loose"
    >
      <Container>
        <SectionHeading
          id="track-record-heading"
          eyebrow={copy.eyebrow}
          heading={copy.heading}
          body={format(copy.body, { publication })}
        />

        <dl className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-panel border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const label = copy.stats[stat.id as keyof typeof copy.stats];
            return (
              <Reveal
                key={stat.id}
                as="div"
                delay={i * 0.08}
                /* bg-bg, not bg-surface: the 1px grid is drawn by the parent's
                   background showing through a gap-px grid, so each cell has to
                   paint its own opaque background or the whole panel goes the
                   colour of the border. */
                className="bg-bg p-7 lg:p-8"
              >
                <dd className="text-stat numerals-latin text-fg-strong">
                  <Counter value={stat.value} suffix={stat.suffix ?? ""} />
                </dd>
                <dt className="mt-3">
                  <span className="block text-stat-label font-bold text-fg">
                    {label.label}
                  </span>
                  <span className="mt-1 block text-sm leading-snug text-fg-subtle">
                    {/* The only figure a note may carry is the establishment
                        year, and it is interpolated from lib/site.ts rather
                        than typed into two translation files. */}
                    {format(label.note, { year: company.foundedYear })}
                  </span>
                </dt>
              </Reveal>
            );
          })}
        </dl>

        {/* The attribution is part of the claim, not a footnote to it. A reader
            who can place where a number came from can weigh it; one who cannot
            has to take it on trust, which is exactly what an enterprise buyer
            declines to do. */}
        <Reveal delay={0.34}>
          <p className="mt-6 text-meta text-fg-subtle uppercase">
            {format(copy.source, { publication })}
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
