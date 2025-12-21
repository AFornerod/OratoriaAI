/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Permitir videos de hasta 10MB
    },
  },
};

module.exports = nextConfig;