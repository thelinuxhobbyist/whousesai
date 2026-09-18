import type { NextConfig } from "next";

const noIndexHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  serverExternalPackages: ["better-sqlite3"],
  async headers() {
    return [
      {
        source: "/admin",
        headers: noIndexHeaders,
      },
      {
        source: "/admin/:path*",
        headers: noIndexHeaders,
      },
      {
        source: "/add",
        headers: noIndexHeaders,
      },
      {
        source: "/add/:path*",
        headers: noIndexHeaders,
      },
      {
        source: "/entity/:slug/edit",
        headers: noIndexHeaders,
      },
      {
        source: "/api/reports",
        headers: noIndexHeaders,
      },
      {
        source: "/api/reports/:path*",
        headers: noIndexHeaders,
      },
      {
        source: "/api/entities/:slug/revert",
        headers: noIndexHeaders,
      },
    ];
  },
};

export default nextConfig;
