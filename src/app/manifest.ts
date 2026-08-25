import type { MetadataRoute } from "next";

/**
 * Web app manifest.
 *
 * Modest by intent: this is a corporate website, not an installable app. The
 * manifest exists so Android home-screen shortcuts and browser UI pick up the
 * right name, icons and brand colour.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Smart Channels",
    short_name: "Smart Channels",
    description:
      "Saudi technology and systems integration — IT, networking, communications, security and smart infrastructure.",
    start_url: "/en",
    display: "standalone",
    background_color: "#0e0c11",
    theme_color: "#d9088c",
    icons: [
      {
        src: "/images/logo/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/logo/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
