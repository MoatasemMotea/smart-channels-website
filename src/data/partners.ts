import type { Collection, Partner } from "@/types/content";

/**
 * Technology partners.
 *
 * ---------------------------------------------------------------------------
 * STATUS: PENDING — intentionally empty.
 * ---------------------------------------------------------------------------
 * No partner or vendor relationships were supplied, and a technology-partner
 * wall is a direct claim of commercial relationship and certification status.
 * Inventing entries here would misrepresent the company to enterprise and
 * government buyers, so the collection ships empty.
 *
 * ---------------------------------------------------------------------------
 * TO ADD A PARTNER
 * ---------------------------------------------------------------------------
 * 1. Confirm Smart Channels is authorised to display the vendor's mark — most
 *    vendor brand guidelines require an active partner agreement.
 * 2. Save the logo as SVG (preferred) or transparent PNG in
 *    `public/images/partners/`. Monochrome or single-colour marks read best in
 *    both themes; the rail applies no colour treatment of its own.
 * 3. Add an entry below and set `status` to "published".
 *
 * Logos are rendered at a normalised height with their own aspect ratio
 * preserved, so mixed logo dimensions do not need manual adjustment.
 */
export const partners: Collection<Partner> = {
  status: "pending",
  pendingNote: "Awaiting the confirmed list of vendor partnerships.",
  items: [
    /* ------------------------------------------------------------------
     * Example:
     *
     * {
     *   id: "vendor-name",
     *   name: "Vendor Name",
     *   logo: "/images/partners/vendor-name.svg",
     *   width: 200,
     *   height: 60,
     *   url: "https://vendor.example.com",
     * },
     * ------------------------------------------------------------------ */
  ],
};
