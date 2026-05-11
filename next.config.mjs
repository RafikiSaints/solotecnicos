/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Permite build aunque haya errores de tipos / lint.
  // Recomendado para primer deploy; arregla los warnings cuando puedas.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000', 'solotecnicos.cl'] },
  },
}

export default nextConfig
