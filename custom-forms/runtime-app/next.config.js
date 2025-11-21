const path = require('path')

// Determine if we're in production (Azure DevOps deployment)
const isProduction = process.env.NODE_ENV === 'production' || process.env.DEPLOY_ENV === 'production'

// IMPORTANT: We do NOT set basePath here anymore
// Instead, we handle it at runtime with IIS URL Rewrite
// This allows changing the basePath without rebuilding

/** @type {import('next').NextConfig} */
const nextConfig = {
  // NO basePath configuration - handled at runtime via IIS
  // This allows the app to work at any path without rebuilding

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
