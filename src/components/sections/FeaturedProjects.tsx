import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { projects, pendingProjectPhotography } from "@/data/projects";
import { industries } from "@/data/industries";
import { Container, Section, SectionAtmosphere } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectPlate } from "@/components/ui/ProjectPlate";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Featured projects — the immersive scene.
 *
 * The middle beat of the page's arc: dark → light → IMMERSIVE → light → dark.
 * Where the editorial sections are read, this one is looked at, so the plates
 * break out of the reading column to the full width of the viewport and are
 * sized to dominate it.
 *
 * A horizontal film strip rather than a grid. Five projects in a grid become
 * five equal thumbnails that the eye skims; in a strip each one is large enough
 * to be a scene, and moving between them is a deliberate act. Scroll-snap makes
 * that movement land cleanly without a line of JavaScript, and the strip
 * reverses on its own in RTL because it is laid out with logical properties.
 *
 * ACCESSIBILITY of a horizontal scroller: the cards are not links — there are
 * no project pages — so nothing inside the strip is focusable, and without help
 * a keyboard user could not scroll it at all. The container is therefore
 * focusable itself and labelled as a region, which is what makes the arrow keys
 * work. That is a WCAG 2.1 requirement for scrollable content, not a nicety.
 */
export function FeaturedProjects({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const copy = dict.featuredProjects;
  const items = projects.items;
  if (items.length === 0) return null;

  const awaitingPhotography = pendingProjectPhotography().length;

  return (
    <Section
      id="work"
      labelledBy="work-heading"
      tone="inset"
      env="deep"
      seam
      spacing="loose"
      className="overflow-hidden"
    >
      <SectionAtmosphere x="50%" y="-6%" size="min(92rem, 150%)" intensity={0.75} />

      <Container>
        <SectionHeading
          id="work-heading"
          eyebrow={copy.eyebrow}
          heading={copy.heading}
          body={copy.body}
        />
      </Container>

      {/* Full-bleed. The strip starts at the container's inset so the first
          plate lines up with the heading above it, then runs off the edge of
          the viewport — which is what says "there is more of this". */}
      <Reveal delay={0.12} className="mt-14">
        <div
          role="group"
          aria-label={copy.projectsRegion}
          tabIndex={0}
          className="scrollbar-none container-bleed flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
        >
          {items.map((project) => {
            const industry = industries.find((entry) => entry.id === project.industryId);
            return (
              <article
                key={project.id}
                className="w-[min(78vw,34rem)] shrink-0 snap-start"
              >
                <div className="relative aspect-4/5 overflow-hidden rounded-panel border border-border sm:aspect-3/2">
                  <ProjectPlate
                    project={project}
                    locale={locale}
                    pendingLabel={copy.photographyPending}
                    sizes="(min-width: 640px) 34rem, 78vw"
                  />
                </div>

                <div className="mt-5">
                  {industry ? (
                    <p className="text-meta text-accent uppercase">
                      {industry.title[locale]}
                    </p>
                  ) : null}
                  <h3 className="mt-2 text-h4 font-bold text-fg-strong text-balance">
                    {project.name[locale]}
                  </h3>
                  {project.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                      {project.description[locale]}
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </Reveal>

      {awaitingPhotography > 0 ? (
        <Container>
          {/* Stated once for the section rather than repeated on every plate.
              Saying it plainly is what keeps the placeholders honest instead of
              merely unexplained. */}
          <Reveal delay={0.2}>
            <p className="mt-8 text-sm text-fg-subtle">{copy.pendingNote}</p>
          </Reveal>
        </Container>
      ) : null}
    </Section>
  );
}
