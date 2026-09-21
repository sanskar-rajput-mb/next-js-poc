import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permanent redirects for old or guessable URLs. They run before middleware
  // and before any page, and are sent as 308s so browsers remember them.
  async redirects() {
    return [
      { source: "/dashboard", destination: "/", permanent: true },
      { source: "/register", destination: "/patients", permanent: true },
      { source: "/patient/:id", destination: "/patients/:id", permanent: true },
    ];
  },

  // Security headers on every response. For an app that shows patient data
  // these are table stakes: no embedding in other sites' frames, no MIME
  // sniffing, and no referrer URLs (which contain record IDs) leaking out.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
