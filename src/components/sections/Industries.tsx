import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import type { Industry } from "@/types/content";
import { industries, industryPhotoReadiness } from "@/data/industries";
import { showPendingSections } from "@/lib/site";
import { Container, Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { stagger } from "@/lib/motion";

/**
 * Industries we serve.
 *
 * IMAGERY
 * -------
 * Each panel is designed around a photograph of the real environment. Where a
 * photograph has been supplied it renders through `next/image`, which produces
 * a responsive srcset and serves AVIF/WebP — worth doing here because these are
 * sixteen large raster images.
 *
 * Where one has not been supplied yet, the panel falls back to the
 * brand-generated SVG. That fallback renders through a plain `<img>` rather
 * than `next/image`: an SVG gains nothing from raster resizing and would
 * otherwise require `dangerouslyAllowSVG` to be enabled for the whole project.
 * Explicit dimensions are set either way, so there is no layout shift.
 *
 * In development each fallback panel is labelled, so "still on placeholder art"
 * is visible at a glance rather than something to remember.
 *
 * INTERACTION — why this is not a carousel library.
 * CSS scroll-snap gives the same swipe gesture with no JavaScript: native
 * momentum scrolling, working find-in-page, and correct RTL behaviour that a JS
 * carousel would have to reimplement. From `md` up the same markup becomes a
 * grid, so there is exactly one list for assistive technology to read.
 *
 * CONTRAST — every title sits on a scrim that darkens whatever is beneath it,
 * so white text clears 4.5:1 over a photograph as reliably as over the artwork.
 */
export function Industries({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const readiness = industryPhotoReadiness();
  const showFallbackNotice = showPendingSections() && readiness.missing.length > 0;

  // Photo-first, taken literally: an industry leads with its photograph when it
  // has one, and appears in the typographic index when it does not.
  const photographed = industries.filter((industry) => industry.photo !== undefined);
  const listed = industries.filter((industry) => industry.photo === undefined);

  return (
    <Section id="industries" labelledBy="industries-heading" tone="default" env="bright">
      <Container>
        <SectionHeading
          id="industries-heading"
          eyebrow={dict.industries.eyebrow}
          heading={dict.industries.heading}
          body={dict.industries.body}
        />

        {showFallbackNotice ? (
          <div className="mt-8 rounded-md border-2 border-dashed border-border-strong p-4">
            <p className="text-sm font-bold text-fg-muted">
              {readiness.withPhoto} of {readiness.total} industries have
              photography.
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-fg-subtle">
              The rest are listed in the index below and will move up into the
              photographic grid as images land. Add a photograph as{" "}
              <code className="rounded-sm bg-bg-inset px-1 py-0.5 text-2xs">
                source-assets/industries/&lt;id&gt;.jpg
              </code>{" "}
              and run{" "}
              <code className="rounded-sm bg-bg-inset px-1 py-0.5 text-2xs">
                npm run assets:photos
              </code>
              . Awaiting: {readiness.missing.join(", ")}.
            </p>
            <p className="mt-3 inline-flex rounded-sm bg-bg-inset px-3 py-1.5 text-2xs font-bold tracking-wide uppercase text-fg-subtle">
              Development only — not shown in production
            </p>
          </div>
        ) : null}
      </Container>

      {/* --- Photographed industries --- */}
      {photographed.length > 0 ? (
        <div className="mt-14">
          <ul
            aria-label={dict.industries.listLabel}
            /* Focusable so the horizontal scroller can be operated from the
               keyboard. The cards are not links, so without this there would be
               nothing to focus inside the region and a keyboard user could not
               reach the industries beyond the first screenful — flagged by axe
               as `scrollable-region-focusable`. Harmless from `md` up, where the
               list becomes a grid and stops scrolling. */
            tabIndex={0}
            className={
              "flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-4 " +
              "[scrollbar-width:thin] sm:scroll-px-8 sm:px-8 " +
              "md:mx-auto md:grid md:max-w-[80rem] md:grid-cols-3 md:overflow-visible md:px-8 md:pb-0 " +
              "lg:grid-cols-4 lg:px-10"
            }
          >
            {photographed.map((industry, index) => (
              <li
                key={industry.id}
                className="w-[72vw] max-w-[19rem] shrink-0 snap-start sm:w-[46vw] md:w-auto md:max-w-none"
              >
                <Reveal delay={stagger(index, 0.04)} className="h-full">
                  <IndustryCard industry={industry} locale={locale} />
                </Reveal>
              </li>
            ))}
          </ul>

          {photographed.length > 4 ? (
            <Container>
              <p
                aria-hidden="true"
                className="mt-4 text-center text-xs text-fg-subtle md:hidden"
              >
                {dict.industries.swipeHint}
              </p>
            </Container>
          ) : null}
        </div>
      ) : null}

      {/* --- Everything still awaiting photography --- */}
      {listed.length > 0 ? (
        <Container className={photographed.length > 0 ? "mt-14" : "mt-12"}>
          <ul
            aria-label={dict.industries.indexLabel}
            className="grid gap-x-12 border-t border-border sm:grid-cols-2"
          >
            {listed.map((industry, index) => (
              <li key={industry.id}>
                <Reveal delay={stagger(index, 0.03)}>
                  <IndustryRow industry={industry} locale={locale} />
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      ) : null}
    </Section>
  );
}

/**
 * An industry with no photograph yet.
 *
 * WHY THIS EXISTS AT ALL.
 *
 * Every one of the sixteen sectors is currently unphotographed, and the
 * previous treatment rendered all sixteen as image cards — abstract generated
 * artwork dressed in the full apparatus of a photograph: a tonal scrim, a hover
 * zoom, a brand glow. It looked like sixteen pictures of the work. It is not,
 * and a placeholder styled to pass for the real thing is the same mistake as
 * stock photography under a project name, only quieter.
 *
 * So an unphotographed sector is presented as what it is: an entry in an index.
 * Name, delivery context, a rule. No frame, no scrim, nothing implying a
 * picture is being withheld. It is a complete, composed presentation in its own
 * right rather than an apology for a missing one — and against sixteen tiles of
 * placeholder art it reads as more precise, not less finished.
 *
 * The generated artwork is not deleted; it remains the fallback inside
 * IndustryCard for anything that has a photo entry but a missing file. It is
 * simply no longer used to imply photography that does not exist.
 *
 * Nothing here is conditional on the current state of the data: an industry
 * moves from this row to a photographic card the moment its `photo` field is
 * filled in, with no component change.
 */
function IndustryRow({ industry, locale }: { industry: Industry; locale: Locale }) {
  return (
    <article className="group flex gap-3.5 border-b border-border py-4 sm:gap-4 sm:py-5">
      {/* A short brand rule instead of a bullet — it carries the accent at a
          scale that keeps the section inside its brand-colour budget, and it
          extends on hover so the row has a state without moving any text. */}
      <span
        aria-hidden="true"
        className="mt-2.5 h-px w-4 shrink-0 bg-border-strong transition-[width,background-color] duration-300 ease-[var(--ease-brand)] group-hover:w-7 group-hover:bg-accent sm:w-5 sm:group-hover:w-8"
      />
      <div className="min-w-0">
        <h3 className="text-[0.9375rem] leading-snug font-bold text-fg-strong sm:text-base">
          {industry.title[locale]}
        </h3>
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-fg-muted sm:text-sm">
          {industry.note[locale]}
        </p>
      </div>
    </article>
  );
}

function IndustryCard({
  industry,
  locale,
}: {
  industry: Industry;
  locale: Locale;
}) {
  const { photo, art } = industry;

  return (
    <article className="group relative h-full overflow-hidden rounded-lg border border-border">
      <div className="relative aspect-[16/11] overflow-hidden bg-bg-inset">
        {photo ? (
          <Image
            src={photo.src}
            alt=""
            width={photo.width}
            height={photo.height}
            sizes="(min-width: 1024px) 20rem, (min-width: 768px) 30vw, 72vw"
            loading="lazy"
            {...(photo.blurDataURL
              ? { placeholder: "blur" as const, blurDataURL: photo.blurDataURL }
              : {})}
            className="size-full object-cover transition-transform duration-700 ease-[var(--ease-brand)] motion-safe:group-hover:scale-[1.07]"
          />
        ) : (
          /* Fallback only. A plain <img> because this is an SVG: raster
             resizing gains it nothing, and next/image would require
             `dangerouslyAllowSVG` project-wide. */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={art.src}
            alt=""
            width={art.width}
            height={art.height}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-700 ease-[var(--ease-brand)] motion-safe:group-hover:scale-[1.07]"
          />
        )}

        {/* Scrim — guarantees title contrast over a photograph or the artwork.
            Slightly stronger for photographs, which carry far more tonal
            variation in the lower third than the generated panels do. */}
        <div
          aria-hidden="true"
          className={
            "absolute inset-0 bg-gradient-to-t " +
            (photo
              ? "from-ink-1000/95 via-ink-1000/55 to-ink-1000/15"
              : "from-ink-1000/92 via-ink-1000/45 to-ink-1000/10")
          }
        />

        {/* Brand glow on hover — subtle, and motion-safe only. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,var(--color-magenta-600),transparent_62%)] opacity-0 mix-blend-screen transition-opacity duration-500 group-hover:opacity-100"
        />

        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="text-base leading-snug font-bold text-white drop-shadow-sm">
            {industry.title[locale]}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-white/80">
            {industry.note[locale]}
          </p>
        </div>

        {/* Bottom rule that fills on hover. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-magenta-500 transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-x-100 rtl:origin-right"
        />
      </div>
    </article>
  );
}
