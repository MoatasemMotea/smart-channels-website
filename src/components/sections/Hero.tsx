import { ArrowRight, ArrowLeft } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { localePath } from "@/lib/routes";
import { company } from "@/lib/site";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { NetworkCanvas } from "@/components/visuals/NetworkCanvas";

/**
 * Hero.
 *
 * The approved tagline "we take you to the future" leads, set in the brand
 * gradient. It stays in English in both locales because it is part of the logo
 * artwork, not body copy — translating it would create a second, unapproved
 * tagline.
 *
 * The H1 pairs the tagline with a plain statement of what the company does.
 * A visitor who reads only the tagline learns nothing concrete, and "is the
 * visitor immediately able to understand what Smart Channels does?" is the bar
 * this section has to clear.
 */
export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const isRtl = locale === "ar";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const home = localePath(locale, "/");

  return (
    <section
      aria-labelledby="hero-heading"
      /* The opening is a `deep` environment: it renders dark in both themes.
         See "STORYTELLING ENVIRONMENTS" in globals.css — a cinematic opening
         that inverted with the theme would stop being an opening. */
      data-env="deep"
      className="relative isolate overflow-hidden bg-bg"
    >
      {/* --- Backdrop layers --- */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {/* Engineering grid, faded out toward the bottom so it never competes
            with the section that follows. */}
        <div className="absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom,black_10%,transparent_92%)]" />

        <NetworkCanvas className="absolute inset-0 size-full opacity-70" />

        {/* Brand glow, positioned on the side the eye reaches last so it frames
            the type instead of sitting behind it. */}
        <div
          className={
            "absolute top-[-14%] size-[min(46rem,92vw)] rounded-full blur-[110px] " +
            "bg-[radial-gradient(circle,var(--glow-1),transparent_68%)] " +
            (isRtl ? "start-[-12%]" : "end-[-12%]")
          }
        />
        <div
          className={
            "absolute bottom-[-30%] size-[min(34rem,80vw)] rounded-full blur-[120px] " +
            "bg-[radial-gradient(circle,var(--glow-2),transparent_70%)] " +
            (isRtl ? "end-[-8%]" : "start-[-8%]")
          }
        />

        {/* Fade into the next section's background. */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-bg" />
      </div>

      <div className="container-page">
        <div className="flex min-h-[min(88svh,50rem)] flex-col justify-center py-24 sm:py-28 lg:py-32">
          <div className="max-w-4xl">
            {/* --- Brand ---
                A tracked wordmark on a hairline rule, not a pill badge. The
                badge form this replaces reads as a generic SaaS "announcement"
                chip; at enterprise scale the brand should simply be stated. The
                only brand colour here is the rule, which lets the label itself
                stay solid --color-fg-strong and fully legible in both
                environments. */}
            <Reveal>
              <p className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="h-px w-10 shrink-0 bg-linear-to-r from-accent to-transparent rtl:bg-linear-to-l"
                />
                <span className="text-brandline text-fg-strong uppercase">
                  {dict.hero.brandLabel}
                </span>
              </p>
            </Reveal>

            {/* --- Message ---
                The approved tagline leads, set solid rather than in the brand
                gradient. A gradient across the whole line costs legibility at
                exactly the moment the visitor is deciding whether to stay, and
                it is the one place a premium enterprise page cannot afford it.
                The identity is carried instead by the surrounding glow, the
                network field behind it, and a single focal word — "Future" —
                held in the accent as flat, solid colour. */}
            <h1
              id="hero-heading"
              className="mt-8 text-display-1 text-fg-strong text-balance"
            >
              <Reveal delay={0.05}>
                {/* The break is explicit, not left to text-balance: the
                    confirmed headline is "We Take You To The / Future", and
                    balancing put it after "You". Two block spans also give the
                    focal word a line of its own, which is what makes it focal. */}
                <span className="block">{dict.hero.taglineLead}</span>
                <span className="block text-accent">{dict.hero.taglineFocus}</span>
              </Reveal>
              <Reveal delay={0.12}>
                <span className="mt-5 block text-h3 font-semibold text-fg-muted">
                  {dict.hero.headline}
                </span>
              </Reveal>
            </h1>

            <Reveal delay={0.2}>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-fg-muted sm:text-xl">
                {dict.hero.body}
              </p>
            </Reveal>

            <Reveal delay={0.28}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <LinkButton href={`${home}#contact`} size="lg">
                  {dict.hero.primaryCta}
                  <Arrow aria-hidden="true" className="size-[18px]" />
                </LinkButton>
                <LinkButton href={`${home}#solutions`} variant="outline" size="lg">
                  {dict.hero.secondaryCta}
                </LinkButton>
              </div>
            </Reveal>

            {/* --- Factual strip ---
                Every value here is confirmed: the establishment year supplied by
                the client, the headquarters city, and counts derived from the
                approved content itself. No invented statistics. */}
            <Reveal delay={0.36}>
              <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-6 border-t border-border pt-8 sm:grid-cols-4">
                <Fact
                  label={dict.about.facts.founded.label}
                  value={String(company.foundedYear)}
                  numeric
                />
                <Fact
                  label={dict.about.facts.headquarters.label}
                  value={company.address.city[locale]}
                />
                <Fact
                  label={dict.about.facts.focus.label}
                  value={dict.about.facts.focus.value}
                />
                <Fact
                  label={dict.about.facts.sectors.label}
                  value={dict.about.facts.sectors.value}
                />
              </dl>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Fact({
  label,
  value,
  numeric = false,
}: {
  label: string;
  value: string;
  numeric?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-bold tracking-[0.1em] uppercase text-fg-subtle">
        {label}
      </dt>
      <dd
        className={
          "mt-1.5 text-base font-bold text-fg-strong" +
          (numeric ? " numerals-latin" : "")
        }
      >
        {value}
      </dd>
    </div>
  );
}
