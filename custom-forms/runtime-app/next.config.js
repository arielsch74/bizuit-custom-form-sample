const path = require('path')

// Determine if we're in production (Azure DevOps deployment)
const isProduction = process.env.NODE_ENV === 'production' || process.env.DEPLOY_ENV === 'production'

// IMPORTANT: Runtime basePath configuration
// Priority: 1) Runtime env var, 2) Build-time placeholder, 3) Empty (root)
// The placeholder /__RUNTIME_BASEPATH__ will be replaced at deployment time in static files
// But for server-side rendering (SSR), we need the runtime environment variable
const basePath = process.env.__NEXT_ROUTER_BASEPATH || (isProduction ? '/__RUNTIME_BASEPATH__' : '')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set basePath with placeholder that will be replaced at runtime
  ...(basePath && { basePath }),
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
