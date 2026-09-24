import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  outputFileTracingIncludes: {
    '/api/ocr/kbis': ['./fra.traineddata'],
  },
  serverExternalPackages: ['tesseract.js', 'pdf-parse'],
};

export default nextConfig;
