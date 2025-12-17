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
  // Fix pour le workspace root
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
