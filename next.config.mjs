/** @type {import('next').NextConfig} */
const nextConfig = {
  // This option opts-out packages from the server-side bundle.
  // Instead, they will be resolved from `node_modules` at runtime.
  // This is the recommended way to handle packages with native Node.js
  // addons like `@lancedb/lancedb`.
  serverExternalPackages: ['@lancedb/lancedb'],
};

export default nextConfig;