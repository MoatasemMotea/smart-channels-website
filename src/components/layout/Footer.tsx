import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { format } from "@/i18n";
import { footerNav } from "@/data/navigation";
import { localePath } from "@/lib/routes";
import { activeSocials, company, contact, mailtoHref, telHref } from "@/lib/site";
import { Logo } from "./Logo";
import { SocialIcon } from "./SocialIcons";

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const nav = footerNav(locale, dict);
  const socials = activeSocials();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg-subtle">
      <div className="container-page py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-12">
          {/* --- Identity --- */}
          <div>
            <Logo href={localePath(locale, "/")} label={dict.nav.logoAlt} />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-fg-muted">
              {dict.footer.about}
            </p>

            {socials.length > 0 ? (
              <ul className="mt-6 flex items-center gap-2">
                {socials.map((social) => (
                  <li key={social.network}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={format(dict.footer.socialLabel, {
                        network: social.label,
                      })}
                      className="inline-flex size-10 items-center justify-center rounded-md border border-border text-fg-muted transition-colors hover:border-border-brand hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                    >
                      <SocialIcon network={social.network} className="size-[17px]" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* --- Navigation --- */}
          <nav aria-label={dict.footer.navHeading}>
            <h2 className="text-xs font-bold tracking-[0.16em] uppercase text-fg-subtle">
              {dict.footer.navHeading}
            </h2>
            <ul className="mt-5 space-y-3">
              {nav.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-sm text-fg-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* --- Contact --- */}
          <div>
            <h2 className="text-xs font-bold tracking-[0.16em] uppercase text-fg-subtle">
              {dict.footer.contactHeading}
            </h2>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <a
                  href={telHref()}
                  className="group inline-flex items-start gap-3 text-fg-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                >
                  <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <span dir="ltr" className="numerals-latin">
                    {contact.phone.display}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={contact.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-3 text-fg-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                >
                  <MessageCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <span dir="ltr" className="numerals-latin">
                    {contact.whatsapp.display}
                  </span>
                  <span className="sr-only"> — {dict.common.openInNewTab}</span>
                </a>
              </li>
              <li>
                <a
                  href={mailtoHref()}
                  className="group inline-flex items-start gap-3 break-all text-fg-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                >
                  <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <span dir="ltr">{contact.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={contact.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-3 text-fg-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                >
                  <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <span>{company.address.full[locale]}</span>
                  <span className="sr-only"> — {dict.common.openInNewTab}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* --- Legal line --- */}
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8 text-sm text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="numerals-latin">© {year}</span>{" "}
            {company.name[locale]}. {dict.footer.rights}
          </p>
          <p>{dict.footer.builtIn}</p>
        </div>
      </div>
    </footer>
  );
}
