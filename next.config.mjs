/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      unoptimized: true,
    },
    async headers() {
      return [
        {
          source: '/uploads/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=3600',
            },
          ],
        },
      ];
    },
  };

  export default nextConfig;