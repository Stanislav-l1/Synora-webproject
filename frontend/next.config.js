/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: process.env.S3_PROTOCOL || 'http',
        hostname: process.env.S3_HOSTNAME || 'localhost',
        port: process.env.S3_PORT || '9000',
        pathname: '/synora/**',
      },
    ],
  },
  // Rewrites only for local dev (npm run dev without nginx).
  // In Docker/production, nginx routes /api and /ws to the backend directly.
  ...(process.env.NODE_ENV !== 'production' && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8080/api/:path*',
        },
        {
          source: '/ws/:path*',
          destination: 'http://localhost:8080/ws/:path*',
        },
      ];
    },
  }),
};

module.exports = nextConfig;
