import type { NextConfig } from "next";

/**
 * Baseline security headers. `process.env.NODE_ENV` is read here because this
 * file runs outside the app runtime, before (and without) the application's
 * env modules - the one justified exception to the "process.env only in env
 * modules" rule.
 */
const commonHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

/**
 * CSP is production-only: dev overlays/websockets need looser rules than a
 * static config can express, and this file can't be verified in a browser
 * from CI.
 */
const productionHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: http: https:",
      "font-src 'self' data:",
      "media-src 'self' http: https:",
      "connect-src 'self' http: https: ws: wss:",
      "form-action 'self'",
    ].join("; "),
  },
];

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [...commonHeaders, ...(isProduction ? productionHeaders : [])],
      },
    ];
  },
};

export default nextConfig;
