/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is enabled by default in Next.js 13+
  output: 'standalone',
  images: {
    domains: ['phish.net', 'media.phish.net'],
  },
}

module.exports = nextConfig
