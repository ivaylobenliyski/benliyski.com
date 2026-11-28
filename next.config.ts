import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // Hans demo (university project): hidden URL – never index it, never leak it via the Referer header.
    const hidden = [
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
      { key: "Referrer-Policy", value: "no-referrer" },
    ];
    return [
      { source: "/hans/:path*", headers: hidden },
      { source: "/api/hans/:path*", headers: hidden },
    ];
  },
  async redirects() {
    return [
      {
        source: "/spaceinvaders",
        destination: "/spaceinvaders/index.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
