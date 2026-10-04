/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  async rewrites() {
    return [
      { source: '/ask', destination: '/copilot' },
      { source: '/intervention', destination: '/simulator' },
    ];
  },
}

module.exports = nextConfig
