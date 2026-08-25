"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getAlternateLocale, localeNames, localeShortNames } from "@/i18n/config";
import { switchLocalePath } from "@/lib/routes";
import { cn } from "@/lib/cn";

interface LocaleToggleProps {
  locale: Locale;
  /** Accessible label, written in the *target* language. */
  label: string;
  className?: string;
  variant?: "compact" | "full";
}

/**
 * Language switch.
 *
 * Two decisions worth noting:
 *
 * 1. It is an `<a>`, not a button. Switching language is navigation to a
 *    different URL, so it must be openable in a new tab, crawlable, and
 *    functional before JavaScript loads.
 *
 * 2. The target language is always named in its own script — "العربية" when
 *    offering Arabic, "English" when offering English. A user stranded on the
 *    wrong language cannot read a label written in the language they don't
 *    speak, which is exactly the moment they need this control.
 *
 * The current path is preserved across the switch, so a visitor reading
 * `/en/company` lands on `/ar/company` rather than being dumped on the home
 * page. `lang` and `hrefLang` tell assistive tech and crawlers what they're
 * pointing at.
 */
export function LocaleToggle({
  locale,
  label,
  className,
  variant = "compact",
}: LocaleToggleProps) {
  const pathname = usePathname();
  const target = getAlternateLocale(locale);
  const href = switchLocalePath(pathname ?? `/${locale}`, target);

  return (
    <Link
      href={href}
      hrefLang={target}
      lang={target}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-md text-sm font-bold",
        "text-fg-muted transition-colors duration-200 hover:bg-bg-subtle hover:text-fg-strong",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
        variant === "compact" ? "h-10 px-2.5 sm:px-3" : "h-11 w-full justify-center px-4",
        className,
      )}
    >
      <Languages aria-hidden="true" className="size-[18px] shrink-0" />
      {/* The full language name needs ~50px that a 390px header does not have
          once the logo and the other controls have taken their share. Below
          `sm` it collapses to "EN" / "ع" — still in the target language's own
          script, so the control keeps meaning something to a reader who cannot
          read the current one. The `aria-label` always carries the full name,
          so nothing is lost to assistive technology. */}
      <span aria-hidden="true" className="sm:hidden">
        {localeShortNames[target]}
      </span>
      <span aria-hidden="true" className="hidden sm:inline">
        {localeNames[target]}
      </span>
    </Link>
  );
}
