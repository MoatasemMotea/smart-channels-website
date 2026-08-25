import Link from "next/link";
import { defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { localePath } from "@/lib/routes";
import { Container, Section } from "@/components/ui/Section";

/**
 * 404.
 *
 * Rendered inside the locale layout, so it keeps the site's header, footer,
 * theme and direction rather than dropping the visitor onto a bare page.
 *
 * Next.js does not pass route params to `not-found`, so the locale cannot be
 * read here — the copy falls back to English, which is the site default. The
 * links point at the default locale for the same reason.
 */
export default function NotFound() {
  const dict = getDictionary(defaultLocale);

  return (
    <Section spacing="loose">
      <Container>
        <div className="mx-auto max-w-lg text-center">
          <p className="numerals-latin text-sm font-bold tracking-[0.16em] text-accent">
            {dict.notFound.code}
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {dict.notFound.heading}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-fg-muted">
            {dict.notFound.body}
          </p>
          <Link
            href={localePath(defaultLocale, "/")}
            className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-magenta-600 px-6 text-sm font-bold text-white transition-colors hover:bg-magenta-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            {dict.common.backHome}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
