import type { Certification, Collection } from "@/types/content";

/**
 * Certifications, awards, memberships and vendor accreditations.
 *
 * ---------------------------------------------------------------------------
 * STATUS: PENDING — intentionally empty.
 * ---------------------------------------------------------------------------
 * Certifications are verifiable claims that procurement teams check. None were
 * supplied, so none are published. The architecture is in place and the section
 * appears on the company page as soon as a first entry is added.
 *
 * ---------------------------------------------------------------------------
 * TO ADD A CERTIFICATION
 * ---------------------------------------------------------------------------
 * 1. Confirm the certificate is current and that the issuing body permits
 *    display of its mark.
 * 2. Optionally save the badge in `public/images/certifications/`.
 * 3. Add an entry below and set `status` to "published".
 */
export const certifications: Collection<Certification> = {
  status: "pending",
  pendingNote: "Awaiting certification documents and issuer details.",
  items: [
    /* ------------------------------------------------------------------
     * Example:
     *
     * {
     *   id: "iso-9001",
     *   name: { en: "ISO 9001:2015", ar: "آيزو 9001:2015" },
     *   issuer: { en: "Certification body", ar: "جهة المنح" },
     *   logo: "/images/certifications/iso-9001.svg",
     *   issuedYear: 2024,
     * },
     * ------------------------------------------------------------------ */
  ],
};
