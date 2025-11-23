import { NextResponse } from 'next/server'

/**
 * GET /api/config
 *
 * Returns runtime configuration for the client
 * This allows basePath to be configured at runtime instead of build time
 */
export async function GET() {
  // Get basePath from Next.js configuration
  // In production, this will be the replaced value from __RUNTIME_BASEPATH__
  // @ts-ignore - __basePath is set by Next.js
  const basePath = process.env.__NEXT_ROUTER_BASEPATH || process.env.BASE_PATH || ''

  return NextResponse.json({
    basePath,
    // Add other runtime configs here as needed
    apiUrl: process.env.FASTAPI_URL || 'http://localhost:8000',
    environment: process.env.NODE_ENV || 'development',
    // Allow dev mode (direct form access without Dashboard token)
    // Defaults to false if not set (secure by default)
    allowDevMode: process.env.ALLOW_DEV_MODE === 'true',
  })
}