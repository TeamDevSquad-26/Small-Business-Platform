import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    // Windows low-memory issue: webpack filesystem cache pack can corrupt
    // and cause routes-manifest ENOENT during dev.
    if (dev) config.cache = false;
    return config;
  },
};

export default nextConfig;
