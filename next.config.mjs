/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/auth/:path*',
        destination: '/api/auth/:path*',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
