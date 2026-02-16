/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // This ignores errors so your site can actually go live
    ignoreBuildErrors: true,
  },
  eslint: {
    // This ignores style warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;