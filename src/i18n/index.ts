import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";
import en from "./dictionaries/en";
import ar from "./dictionaries/ar";

/**
 * Dictionaries are imported statically rather than dynamically.
 *
 * Both languages together are a few kilobytes of strings, and every page is
 * statically rendered per locale, so there is nothing to gain from splitting
 * them — and a static import keeps `getDictionary` synchronous, which means
 * server components can call it without becoming async.
 */
const dictionaries: Record<Locale, Dictionary> = { en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/**
 * Substitute `{name}` placeholders in a dictionary string.
 *
 * Deliberately minimal — the site has a handful of interpolated strings, which
 * does not justify an ICU message-format dependency.
 */
export function format(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}

export type { Dictionary };
