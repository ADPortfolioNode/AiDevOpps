/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@lancedb/lancedb'],
};
export default nextConfig;