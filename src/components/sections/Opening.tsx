import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

/**
 * The cinematic opening.
 *
 * A brief title card on the deep ground, resolving into the hero. It exists on
 * the homepage only — it is the first beat of that page's story, not a
 * site-wide interstitial.
 *
 * ---------------------------------------------------------------------------
 * IT IS CSS, NOT JAVASCRIPT, AND THAT IS THE POINT
 * ---------------------------------------------------------------------------
 * This markup is inert by default: globals.css gives `.opening` `display: none`
 * until <html> carries `data-opening="on"`, which only the pre-paint bootstrap
 * script sets. So a visitor without JavaScript never sees it at all — the hero
 * is simply there.
 *
 * And once it is playing, nothing further is required of JavaScript. The
 * animation ends with the overlay removed via `animation-fill-mode: forwards`,
 * so it finishes even if the React bundle never loads, is blocked by a proxy,
 * or throws on the way in. A curtain that needs a script to lift is a curtain
 * that will one day not lift, and there is no acceptable version of that.
 *
 * ---------------------------------------------------------------------------
 * WHY TYPE AND NOT THE LOGO
 * ---------------------------------------------------------------------------
 * The obvious title card is the lockup. It cannot be used here: the approved
 * wordmark is dark, the opening ground is near-black, and no reversed variant
 * has been supplied. Recolouring or redrawing the logo is out of the question,
 * so the card is set in the same tracked brand line the hero already uses —
 * type, not artwork, and nothing about the logo is altered.
 *
 * ---------------------------------------------------------------------------
 * THE GROUND MATCHES THE HERO EXACTLY
 * ---------------------------------------------------------------------------
 * The overlay is painted in the hero's own `deep` background rather than a
 * generic black, so the reveal is a dissolve of *content* with no colour step
 * underneath it. The card fades and the hero is already there, in the same
 * ground it was always going to be in.
 */
export function Opening({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <div
      /* aria-hidden, and containing nothing focusable, so it never enters the
         accessibility tree and cannot trap a keyboard user for the second and
         a half it is on screen. Assistive-technology users get the page
         immediately; there is nothing here for them to miss. */
      aria-hidden="true"
      className="opening"
      data-env="deep"
    >
      <div className="opening-card">
        <span className="opening-rule" />
        <span className="opening-word" lang={locale}>
          {dict.hero.brandLabel}
        </span>
      </div>
    </div>
  );
}
