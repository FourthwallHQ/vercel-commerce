/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.fourthwall.com',
        port: '',
        search: '',
      },
      {
        protocol: 'https',
        hostname: '*.fourthwall.dev',
        port: '',
        search: '',
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/_c/mtg.js',
        destination: 'https://www.googletagmanager.com/gtm.js'
      },
      {
        source: '/_c/g/:path*',
        destination: 'https://www.google-analytics.com/g/:path*'
      },
      {
        source: '/_c/_/:path*',
        destination: 'https://www.googletagmanager.com/_/:path*'
      }
    ];
  }
};
