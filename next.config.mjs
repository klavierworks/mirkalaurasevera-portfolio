/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  async redirects() {
    return [
      {
        source: '/admin',
        destination: 'https://app.pagescms.org/Runeii/mirkalaurasevera-portfolio/main/',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
