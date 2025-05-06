/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/admin',
        destination: 'https://app.contentful.com/spaces/o7cd9mv2klad/views/entries?id=zv4JLLWdFDbjOJGb&order.fieldId=relevance&order.direction=ascending&contentTypeId=projects&displayedFieldIds=contentType&displayedFieldIds=updatedAt&displayedFieldIds=author&contentTypeIds=projects',
        permanent: false,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        port: '',
        pathname: '/**',
      }
    ]
  }
};

export default nextConfig;
