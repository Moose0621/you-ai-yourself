/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is enabled by default in Next.js 13+
  images: {
    domains: ['phish.net', 'media.phish.net'],
  },
}

module.exports = nextConfig
