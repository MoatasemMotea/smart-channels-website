import Script from "next/script";
import { analyticsId } from "@/lib/site";

/**
 * Analytics.
 *
 * Renders nothing at all unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set to a real
 * measurement ID. No placeholder ID ships in the codebase, so a fresh clone
 * sends no data anywhere and there is no tag to forget to replace.
 *
 * Privacy-conscious configuration:
 * - `anonymize_ip` truncates the visitor's address before storage.
 * - Google Signals and ad personalisation are disabled, so no advertising
 *   profile is built from this site's traffic.
 * - `SameSite=None;Secure` on the cookie, and nothing else is set.
 * - `afterInteractive` keeps the tag off the critical path so it cannot
 *   affect LCP or INP.
 *
 * If the client later wants no cookies at all, a cookieless alternative
 * (Plausible, Umami, Vercel Analytics) drops straight into this component —
 * nothing else in the codebase references analytics.
 */
export function Analytics() {
  const id = analyticsId();
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', {
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
    </>
  );
}
