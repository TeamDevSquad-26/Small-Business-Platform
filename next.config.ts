import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Ensure `.env.local` is loaded when Next evaluates config (helps some Windows setups).
loadEnvConfig(process.cwd());

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin", "express"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { dev }) => {
    // Avoid persistent filesystem cache on Windows (can corrupt), but do NOT
    // disable caching entirely — that makes dev rebuilds very slow and triggers
    // ChunkLoadError / layout.js load timeouts in the browser.
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
