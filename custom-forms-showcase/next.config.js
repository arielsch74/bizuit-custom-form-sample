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
    assetPrefix: BASE_PATH,
  }),

  // Trailing slash for consistent routing
  trailingSlash: true,

  // Output standalone server for IISNode deployment
  output: 'standalone',

  // Fix workspace root for file tracing
  outputFileTracingRoot: path.join(__dirname, '../'),
}

module.exports = nextConfig
