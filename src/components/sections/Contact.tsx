import { ExternalLink, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { company, contact, mailtoHref, telHref } from "@/lib/site";
import { Container, Section, SectionAtmosphere } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "./ContactForm";

/**
 * Contact.
 *
 * Direct channels sit alongside the form rather than beneath it. An enterprise
 * buyer who wants to phone should not have to scroll past a form to find the
 * number, and a WhatsApp tap is the fastest path to a conversation in this
 * market.
 *
 * THE MAP: rendered as a static branded card linking out to Google Maps, not an
 * embedded iframe. An embed costs roughly 800 KB across dozens of requests and
 * sets third-party cookies — a heavy price on mobile for something most
 * visitors will open in their own maps app anyway. Setting
 * NEXT_PUBLIC_MAP_EMBED_URL switches this to a real embed if the client wants
 * one; see src/lib/site.ts.
 */
export function Contact({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <Section id="contact" labelledBy="contact-heading" tone="default" env="deep" seam spacing="loose">
      {/* The closing beat needs a light source, or a flat near-black band reads
          as the page having run out rather than as a deliberate change of
          scene. Offset off-centre and toward the top so it falls behind the
          heading and dies away before the form. */}
      <SectionAtmosphere x="26%" y="14%" size="min(58rem, 130%)" intensity={0.9} />
      <Container>
        <SectionHeading
          id="contact-heading"
          eyebrow={dict.contact.eyebrow}
          heading={dict.contact.heading}
          body={dict.contact.body}
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-12">
          {/* --- Direct channels --- */}
          <Reveal>
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-[0.16em] uppercase text-fg-subtle">
                {dict.contact.directHeading}
              </h3>

              <ChannelCard
                href={telHref()}
                icon={<Phone aria-hidden="true" className="size-5" />}
                label={dict.contact.phoneLabel}
                value={contact.phone.display}
                action={dict.contact.callAction}
                ltrValue
              />

              <ChannelCard
                href={contact.whatsapp.url}
                icon={<MessageCircle aria-hidden="true" className="size-5" />}
                label={dict.contact.whatsappLabel}
                value={contact.whatsapp.display}
                action={dict.contact.whatsappAction}
                external
                externalHint={dict.common.openInNewTab}
                ltrValue
              />

              <ChannelCard
                href={mailtoHref("Website enquiry")}
                icon={<Mail aria-hidden="true" className="size-5" />}
                label={dict.contact.emailLabel}
                value={contact.email}
                action={dict.contact.emailAction}
                ltrValue
              />

              {/* --- Location --- */}
              {contact.mapEmbedUrl ? (
                <div className="overflow-hidden rounded-lg border border-border">
                  <iframe
                    src={contact.mapEmbedUrl}
                    title={dict.contact.mapFrameTitle}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-64 w-full border-0"
                  />
                </div>
              ) : null}

              <a
                href={contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-lg border border-border bg-surface p-5 transition-[border-color,box-shadow] duration-300 hover:border-border-brand hover:shadow-[var(--shadow-panel)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                  <MapPin aria-hidden="true" className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold tracking-wide uppercase text-fg-subtle">
                    {dict.contact.addressLabel}
                  </span>
                  <span className="mt-1 block text-sm font-bold text-fg-strong">
                    {company.address.full[locale]}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-accent">
                    {dict.contact.openMap}
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                  </span>
                  <span className="sr-only"> — {dict.common.openInNewTab}</span>
                </span>
              </a>

              <p className="text-xs text-fg-subtle">{dict.contact.hoursNote}</p>
            </div>
          </Reveal>

          {/* --- Form --- */}
          <Reveal delay={0.08}>
            <ContactForm locale={locale} dict={dict} />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

function ChannelCard({
  href,
  icon,
  label,
  value,
  action,
  external = false,
  externalHint,
  ltrValue = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  action: string;
  external?: boolean;
  externalHint?: string;
  ltrValue?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex items-center gap-4 rounded-lg border border-border bg-surface p-5 transition-[border-color,box-shadow] duration-300 hover:border-border-brand hover:shadow-[var(--shadow-panel)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
    >
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent transition-colors group-hover:bg-magenta-600 group-hover:text-white">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold tracking-wide uppercase text-fg-subtle">
          {label}
        </span>
        <span
          className={
            "mt-0.5 block truncate text-sm font-bold text-fg-strong" +
            (ltrValue ? " numerals-latin" : "")
          }
          {...(ltrValue ? { dir: "ltr" as const } : {})}
        >
          {value}
        </span>
      </span>
      <span className="shrink-0 text-xs font-bold text-accent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {action}
      </span>
      {externalHint ? <span className="sr-only">{externalHint}</span> : null}
    </a>
  );
}
