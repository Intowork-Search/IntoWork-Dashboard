/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
    ],
  },
  // Configuration minimale pour Vercel
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
