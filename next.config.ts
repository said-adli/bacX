import type { NextConfig } from "next";

import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  // ... existing config (images, headers, etc) preserved by TypeScript since we're just wrapping the export
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      }
    ],
  },
  experimental: {
    // Other experimental features
  },
  reactCompiler: true,
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://img.youtube.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://*.supabase.co https://lh3.googleusercontent.com https://*.googleusercontent.com https://img.youtube.com https://via.placeholder.com;
      font-src 'self' data:;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co;
      frame-src 'self' https://www.youtube.com;
    `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN' // Preventing Clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  reactStrictMode: true,
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  org: "bacx", // Inferred from project ID usually, but safe to default
  project: "bacx",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
});
