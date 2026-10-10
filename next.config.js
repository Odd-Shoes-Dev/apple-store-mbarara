/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Without this, Next.js scrolls to the top on every navigation —
    // including back/forward — overriding the browser's own scroll memory.
    scrollRestoration: true,
  },
};

module.exports = nextConfig;
