/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker builds
  output: 'standalone',
  
  // Force rebuild - 2026-01-09
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
    ],
  },
};

module.exports = nextConfig;
