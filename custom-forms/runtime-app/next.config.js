const path = require('path')

// Determine if we're in production (Azure DevOps deployment)
const isProduction = process.env.NODE_ENV === 'production' || process.env.DEPLOY_ENV === 'production'

// IMPORTANT: basePath MUST be set at build time for static assets
// The basePath is required for Next.js to generate correct asset URLs
// Navigation paths are handled dynamically via RuntimeConfigProvider
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set basePath for static assets (CSS, JS, etc.)
  // This is REQUIRED at build time for proper asset loading
  ...(basePath && { basePath }),

  // Also set assetPrefix to ensure assets are served from correct path
  ...(basePath && { assetPrefix: basePath }),

  // Remove trailing slashes to prevent redirect issues with basePath
  // Without this, /admin/ redirects to /admin but loses basePath
  trailingSlash: false,

  // Output standalone server for IISNode deployment
  output: 'standalone',

  // Fix workspace root for file tracing
  outputFileTracingRoot: path.join(__dirname, '../'),

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
  })
}

module.exports = nextConfig
