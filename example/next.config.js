/** @type {import('next').NextConfig} */
const nextConfig = {
  // Base path for deployment in subdirectory
  // e.g., test.bizuit.com/BIZUITCustomForms
  basePath: '/BIZUITCustomForms',

  // Asset prefix for static files
  assetPrefix: '/BIZUITCustomForms',

  // Trailing slash for consistent routing
  trailingSlash: true,
}

module.exports = nextConfig
