const path = require('path')

// Determine if we're in production (Azure DevOps deployment)
const isProduction = process.env.NODE_ENV === 'production' || process.env.DEPLOY_ENV === 'production'

// IMPORTANT: Runtime basePath configuration
// The placeholder /__RUNTIME_BASEPATH__ will be replaced at deployment time via prepare-deployment script
// This allows deploying to multiple locations (arielsch, recubiz, etc.) without rebuilding
const basePath = process.env.__NEXT_ROUTER_BASEPATH || (isProduction ? '/__RUNTIME_BASEPATH__' : '')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set basePath with placeholder that will be replaced at runtime
  ...(basePath && { basePath }),
  ...(basePath && { assetPrefix: basePath }),

  // Remove trailing slashes to prevent redirect issues with basePath
  // Without this, /admin/ redirects to /admin but loses basePath
  trailingSlash: false,

  // Output standalone server for Azure Web App deployment
  output: 'standalone',

  // Force unique build ID in production for cache busting
  ...(isProduction && {
    generateBuildId: async () => {
      return 'production-build-' + Date.now()
    }
  }),

  // Experimental: Fix for basePath in App Router
  ...(isProduction && {
    experimental: {
      // This helps with asset loading in production
      optimizeCss: false,
    }
  }),

  // Security headers for standalone forms (iframe-only routes)
  async headers() {
    // Parse allowed origins from environment variable
    const allowedOrigins = process.env.NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS
      ? process.env.NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS.split(',').map(o => o.trim())
      : []

    // Add localhost if allowed in development
    if (process.env.NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME === 'true') {
      allowedOrigins.push('http://localhost', 'http://127.0.0.1')
    }

    // Build frame-ancestors directive
    // Note: frame-ancestors doesn't support port wildcards, so we add common ports for localhost
    const frameAncestors = allowedOrigins.length > 0
      ? allowedOrigins.join(' ')
      : "'none'"  // Block all iframes if no origins configured

    return [
      {
        // Apply CSP to standalone forms routes only
        source: '/formsa/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors ${frameAncestors}`,
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',  // Fallback for older browsers
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
