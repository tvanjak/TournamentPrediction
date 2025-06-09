import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */ 
  eslint: {
    ignoreDuringBuilds: true, // This is the key line
  },
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