/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/auth*',
        destination: '/api/auth*',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
