import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */ 
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;