import { NextResponse } from 'next/server'

/**
 * GET /api/config
 *
 * Returns runtime configuration for the client
 * This allows basePath to be configured at runtime instead of build time
 */
export async function GET() {
  // Get basePath from server-side environment variable (not NEXT_PUBLIC_)
  // This can be changed in .env.local without rebuilding
  const basePath = process.env.BASE_PATH || ''

  return NextResponse.json({
    basePath,
    // Add other runtime configs here as needed
    apiUrl: process.env.FASTAPI_URL || 'http://localhost:8000',
    environment: process.env.NODE_ENV || 'development',
  })
}