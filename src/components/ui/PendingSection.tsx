import { Container, Section } from "./Section";

interface PendingSectionProps {
  id: string;
  eyebrow: string;
  heading: string;
  /** Localised, visitor-facing explanation of what is missing. */
  note: string;
  /** Internal note from the data file — where the content should go. */
  detail?: string;
  tone?: "default" | "subtle" | "inset";
}

/**
 * Placeholder for a section whose content has not been supplied yet.
 *
 * This is a *build-time affordance for the team*, not a public-facing state.
 * It renders only when `showPendingSections()` is true, which is development by
 * default. In production an empty section is omitted entirely — see
 * `src/lib/collections.ts` for why.
 *
 * The dashed border and explicit "not visible in production" note are there so
 * nobody reviewing a preview mistakes this for finished UI.
 */
export function PendingSection({
  id,
  eyebrow,
  heading,
  note,
  detail,
  tone = "default",
}: PendingSectionProps) {
  return (
    <Section id={id} tone={tone} spacing="tight">
      <Container>
        <div className="rounded-lg border-2 border-dashed border-border-strong p-8 sm:p-10">
          <p className="text-xs font-bold tracking-[0.16em] uppercase text-fg-subtle">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-fg-muted">{heading}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fg-muted">
            {note}
          </p>
          {detail ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-subtle">
              {detail}
            </p>
          ) : null}
          <p className="mt-6 inline-flex items-center gap-2 rounded-sm bg-bg-inset px-3 py-1.5 text-2xs font-bold tracking-wide uppercase text-fg-subtle">
            Development only — this section is not rendered in production while
            empty
          </p>
        </div>
      </Container>
    </Section>
  );
}
