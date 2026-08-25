import type { NextConfig } from "next";

/**
 * Security headers applied to every response.
 *
 * The Content-Security-Policy is intentionally strict. It is defined here rather
 * than in a hosting-provider config file so the policy travels with the codebase
 * and stays valid on Vercel, a Node server, or a container.
 *
 * `'unsafe-inline'` on script-src is required by the no-flash theme bootstrap in
 * `src/app/layout.tsx` and by Next.js' streaming hydration payload. It is scoped
 * as tightly as the framework allows.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com",
  "frame-src https://www.google.com https://maps.google.com",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Trailing slashes off keeps canonical URLs unambiguous for SEO.
  trailingSlash: false,

  images: {
    // Locally hosted assets only — no remote patterns are allowed by default.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [420, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [96, 128, 192, 256, 384],
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async redirects() {
    return [
      // Legacy anchors from the previous single-page site.
      { source: "/index.html", destination: "/en", permanent: true },
    ];
  },
};

export default nextConfig;
