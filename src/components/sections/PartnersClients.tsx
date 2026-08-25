import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { partners } from "@/data/partners";
import { clients, renderableClients } from "@/data/clients";
import { sectionMode, sectionModeFor } from "@/lib/collections";
import { Container, Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PendingSection } from "@/components/ui/PendingSection";
import { Reveal } from "@/components/ui/Reveal";
import { LogoRail } from "./LogoRail";

export function Partners({ dict }: { dict: Dictionary }) {
  const mode = sectionMode(partners);
  if (mode === "hidden") return null;

  if (mode === "placeholder") {
    return (
      <PendingSection
        id="partners"
        eyebrow={dict.partners.eyebrow}
        heading={dict.partners.heading}
        note={dict.partners.pending}
        detail={partners.pendingNote}
        tone="default"
      />
    );
  }

  return (
    <Section id="partners" labelledBy="partners-heading" tone="default" spacing="tight">
      <Container>
        <SectionHeading
          id="partners-heading"
          eyebrow={dict.partners.eyebrow}
          heading={dict.partners.heading}
          body={dict.partners.body}
          align="center"
        />
      </Container>
      <Reveal>
        <LogoRail
          items={partners.items}
          label={dict.partners.listLabel}
          className="mt-12"
        />
      </Reveal>
    </Section>
  );
}

export function Clients({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  // Only clients with recorded permission to display their mark.
  const approved = renderableClients();
  const mode = sectionModeFor(clients, approved);
  if (mode === "hidden") return null;

  if (mode === "placeholder") {
    return (
      <PendingSection
        id="clients"
        eyebrow={dict.clients.eyebrow}
        heading={dict.clients.heading}
        note={dict.clients.pending}
        detail={clients.pendingNote}
        tone="subtle"
      />
    );
  }

  return (
    <Section id="clients" labelledBy="clients-heading" tone="subtle" spacing="tight">
      <Container>
        <SectionHeading
          id="clients-heading"
          eyebrow={dict.clients.eyebrow}
          heading={dict.clients.heading}
          align="center"
        />
      </Container>
      <Reveal>
        <LogoRail
          items={approved.map((client) => ({
            id: client.id,
            name: client.name[locale],
            logo: client.logo,
            width: client.width,
            height: client.height,
          }))}
          label={dict.clients.listLabel}
          className="mt-12"
        />
      </Reveal>
    </Section>
  );
}
