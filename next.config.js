/** @type {import('next').NextConfig} */
const nextConfig = {
  // This option is required to make the Next.js app compatible with the
  // production-optimized Dockerfile, which uses the standalone output.
  // This creates a smaller, more secure Docker image for production.  
  // NOTE: This MUST be enabled for Docker builds, but it prevents `npm run dev` from working correctly.
  // Comment this line out if you need to run the local development server.
  output: 'standalone',
};
export default nextConfig;