// next.config.cjs
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Next.js not to bundle the '@lancedb/lancedb' package on the server.
  // Instead, it will be treated as an external dependency that Node.js will
  // require at runtime. This is the correct way to handle packages with
  // native Node.js addons (.node files).
  serverExternalPackages: ['@lancedb/lancedb'],

  webpack: (config) => {
    // This is the best-practice way to inform Webpack of your path aliases.
    config.resolve.alias['@/components'] = path.join(__dirname, 'components');
    config.resolve.alias['@/lib'] = path.join(__dirname, 'lib');

    // The .node file issue is now handled by `serverExternalPackages`,
    // so the custom loader rule is no longer needed.

    return config;
  },
};

module.exports = nextConfig;