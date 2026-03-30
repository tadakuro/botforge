/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@botforge/database', '@botforge/shared-types', '@botforge/config'],
}
module.exports = nextConfig
