const path = require('path')

// Determine if we're in production (Azure DevOps deployment)
const isProduction = process.env.NODE_ENV === 'production' || process.env.DEPLOY_ENV === 'production'

// Get base path from environment variable (e.g., /BIZUITCustomForms)
// Only applied in production
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Base path for deployment in subdirectory (only in production)
  // e.g., test.bizuit.com/BIZUITCustomForms
  ...(isProduction && BASE_PATH && {
    basePath: BASE_PATH,
    // Remove assetPrefix - let Next.js handle it automatically with basePath
    // assetPrefix is causing issues with dynamic imports in Next.js 15
  }),

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
