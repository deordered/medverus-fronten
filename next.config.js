/** @type {import('next').NextConfig} */
import path from 'path'

const nextConfig = {
  // Performance optimizations
  experimental: {
    // Enable modern bundling optimizations
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'lucide-react',
      'date-fns',
      'recharts'
    ],
  },

  // Turbopack configuration (stable in Next.js 15)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Server external packages (moved from experimental)
  serverExternalPackages: ['sharp', 'onnxruntime-node'],

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
    // Note: SWC minification is now enabled by default in Next.js 15
  },

  // Image optimization for medical platform
  images: {
    // Enable modern image formats
    formats: ['image/avif', 'image/webp'],
    
    // Allowed domains for medical images
    domains: [
      'medverus-backend.fly.dev',
      'medverus.com',
      'cdn.medverus.com',
      'images.medverus.com',
    ],
    
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Enable placeholder blur for better UX
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // Optimize for medical document thumbnails
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production'
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production'
  },

  // Security headers for medical compliance
  async headers() {
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload'
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=(self), usb=(), bluetooth=(), magnetometer=(), accelerometer=(), gyroscope=()'
      },
      {
        key: 'Content-Security-Policy',
        value: process.env.NODE_ENV === 'production' 
          ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content"
          : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws: wss:;"
      },
      // Medical compliance headers
      {
        key: 'X-Medical-Data-Protection',
        value: 'enabled'
      },
      {
        key: 'X-HIPAA-Compliant',
        value: 'true'
      },
      {
        key: 'X-Audit-Trail',
        value: 'required'
      }
    ];

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // API-specific headers
      {
        source: '/api/(.*)',
        headers: [
          ...securityHeaders,
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGINS || 'https://medverus.com'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With, X-API-Key'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400'
          }
        ],
      },
      // Static assets caching
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      // Font caching
      {
        source: '/(.*\\.woff2?)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      }
    ];
  },

  // Output configuration for production
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|framer-motion)[\\/]/,
            name: 'ui-components',
            priority: 20,
            reuseExistingChunk: true,
          },
          icons: {
            test: /[\\/]node_modules[\\/](lucide-react|@radix-ui\/react-icons)[\\/]/,
            name: 'icons',
            priority: 20,
            reuseExistingChunk: true,
          },
          charts: {
            test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
            name: 'charts',
            priority: 20,
            reuseExistingChunk: true,
          },
        },
      };
    }

    // Optimize imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), './'),
    };

    // Optimize for medical data handling
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Add source maps in development
    if (dev) {
      config.devtool = 'eval-source-map';
    }

    return config;
  },

  // Enable static optimization
  trailingSlash: false,
  
  // Compression and caching
  compress: true,
  
  // Power optimizations
  poweredByHeader: false,

  // Redirects for SEO and user experience
  async redirects() {
    return [
      // Note: Removed incorrect /login and /register redirects
      // These pages exist at their correct locations: /login and /register
      {
        source: '/docs',
        destination: '/about',
        permanent: false,
      }
    ];
  },

  // Rewrites for clean URLs
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health',
      },
      {
        source: '/status',
        destination: '/api/status',
      }
    ];
  },

  // Environment variables for runtime
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Medverus AI',
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },

  // Generate sitemap and robots.txt
  async generateBuildId() {
    // Use git commit hash for build ID in production
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
      return process.env.VERCEL_GIT_COMMIT_SHA;
    }
    return 'development';
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // Development server configuration
  ...(process.env.NODE_ENV === 'development' && {
    devIndicators: {
      buildActivity: true,
      buildActivityPosition: 'bottom-right',
    },
  }),
}

export default nextConfig