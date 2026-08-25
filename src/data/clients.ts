import type { Client, Collection } from "@/types/content";

/**
 * Clients.
 *
 * ---------------------------------------------------------------------------
 * STATUS: PENDING — intentionally empty.
 * ---------------------------------------------------------------------------
 * No client list was supplied. Displaying a client's logo asserts both a
 * commercial relationship and permission to use their trademark, so nothing is
 * listed here without both being confirmed.
 *
 * Note the `usageApproved` flag on every entry: `renderableClients()` filters
 * out anything not explicitly approved, so a logo added during content entry
 * cannot reach production before permission is recorded. This is a deliberate
 * guard — brand usage rights are a legal matter, not a data-entry detail.
 *
 * ---------------------------------------------------------------------------
 * TO ADD A CLIENT
 * ---------------------------------------------------------------------------
 * 1. Obtain written permission to display the client's logo.
 * 2. Save the logo in `public/images/clients/` (SVG preferred).
 * 3. Add an entry below with `usageApproved: true`.
 * 4. Set `status` to "published".
 */
export const clients: Collection<Client> = {
  status: "pending",
  pendingNote:
    "Awaiting the client list and written permission to display each mark.",
  items: [
    /* ------------------------------------------------------------------
     * Example:
     *
     * {
     *   id: "client-id",
     *   name: { en: "Client Name", ar: "اسم العميل" },
     *   logo: "/images/clients/client-id.svg",
     *   width: 200,
     *   height: 60,
     *   usageApproved: true,
     * },
     * ------------------------------------------------------------------ */
  ],
};

/**
 * Clients cleared for display.
 *
 * Always use this rather than `clients.items` when rendering.
 */
export function renderableClients(): readonly Client[] {
  return clients.items.filter((client) => client.usageApproved);
}
