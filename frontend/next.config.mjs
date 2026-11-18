/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiServerUrl = (process.env.API_SERVER_URL || 'http://127.0.0.1:5000').replace(/\/+$/, '');

    return [
      {
        source: '/api/:path*',
        destination: `${apiServerUrl}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
};

export default nextConfig;
