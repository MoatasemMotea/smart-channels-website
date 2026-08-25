import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { gallery } from "@/data/gallery";
import { sectionMode } from "@/lib/collections";
import { Container, Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PendingSection } from "@/components/ui/PendingSection";
import { GalleryGrid } from "./Gallery";

/**
 * Server wrapper around the interactive gallery grid.
 *
 * Splitting it this way keeps the empty/pending decision and all the copy on
 * the server, so the client bundle only carries the lightbox — and carries
 * nothing at all while the gallery is empty.
 */
export function GallerySection({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const mode = sectionMode(gallery);
  if (mode === "hidden") return null;

  if (mode === "placeholder") {
    return (
      <PendingSection
        id="gallery"
        eyebrow={dict.gallery.eyebrow}
        heading={dict.gallery.heading}
        note={dict.gallery.pending}
        detail={gallery.pendingNote}
        tone="subtle"
      />
    );
  }

  return (
    <Section id="gallery" labelledBy="gallery-heading" tone="subtle">
      <Container>
        <SectionHeading
          id="gallery-heading"
          eyebrow={dict.gallery.eyebrow}
          heading={dict.gallery.heading}
          body={dict.gallery.body}
        />
        <div className="mt-12">
          <GalleryGrid items={gallery.items} locale={locale} dict={dict} />
        </div>
      </Container>
    </Section>
  );
}
