/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker builds
  output: 'standalone',

  // Force HTTPS pour toutes les requêtes externes
  async redirects() {
    return [
      // Rediriger toute requête HTTP vers HTTPS pour l'API Railway
      {
        source: '/api/:path*',
        has: [
          {
            type: 'host',
            value: 'intowork-dashboard-production.up.railway.app'
          }
        ],
        destination: 'https://intowork-dashboard-production.up.railway.app/api/:path*',
        permanent: true,
      }
    ];
  },
  // Configuration pour éviter les Mixed Content
  env: {
    FORCE_HTTPS_API: 'true',
    CACHE_BUSTER_TIMESTAMP: '2025-12-17-18-33',
    VERCEL_REDEPLOY_FORCE: 'true'
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
