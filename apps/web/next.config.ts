import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@islamic/database', '@islamic/islamic-engine', '@islamic/ui'],

  experimental: {
    typedRoutes: true,
    optimizePackageImports: [
      '@islamic/ui',
      '@islamic/islamic-engine',
      '@islamic/database',
    ],
  },

  typescript: {
    // Project-wide type safety is validated via workspace `pnpm typecheck`
    ignoreBuildErrors: true,
  },

  async headers() {
    return [
      // 1. Global Security Headers for all routes
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; media-src 'self' https: data: blob:; connect-src 'self' https: wss:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },

      // 2. Next.js Static Asset Chunks — 1 Year Immutable Caching
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      // 3. Static Media, Fonts, and Icons — 1 Year Immutable Caching
      {
        source: '/(images|fonts|icons)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      // 4. PWA Web Manifest & Favicon — 24 Hour Caching with Stale-While-Revalidate
      {
        source: '/(manifest.webmanifest|manifest.json|favicon.ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },

      // 5. Service Worker — Always Validate to ensure instant rollout
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer, webpack }) => {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        fs: false,
        path: false,
      };
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
          resource.request = resource.request.replace(/^node:/, '');
        })
      );
    }
    return config;
  },
};

export default nextConfig;
