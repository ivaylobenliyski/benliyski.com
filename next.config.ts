import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
