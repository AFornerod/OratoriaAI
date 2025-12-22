/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb', // Permitir videos de hasta 20MB
    },
  },
};

module.exports = nextConfig;