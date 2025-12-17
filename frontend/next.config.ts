import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ['@heroicons/react']
  },
  images: {
    domains: ['images.clerk.dev']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Optimisations pour la production
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
};

export default nextConfig;
