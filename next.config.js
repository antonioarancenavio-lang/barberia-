/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fase 2 anadira aqui la logica de rewrites para subdominios.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
