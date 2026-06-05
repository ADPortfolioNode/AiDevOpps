/** @type {import('next').NextConfig} */
const nextConfig = {
  // This option is required to make the Next.js app compatible with the
  // production-optimized Dockerfile, which uses the standalone output.
  // This creates a smaller, more secure Docker image for production.  
  //
  // ⚠️ IMPORTANT: This MUST be enabled for the './start.sh' (Docker) workflow.
  // If you are running locally via 'npm run dev', you MUST comment this line out.
  output: 'standalone',
};
export default nextConfig;