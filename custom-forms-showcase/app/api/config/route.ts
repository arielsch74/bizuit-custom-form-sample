import { NextResponse } from 'next/server'

/**
 * Runtime Configuration Endpoint
 *
 * This endpoint reads configuration from environment variables at RUNTIME,
 * allowing you to change settings without rebuilding the application.
 *
 * Unlike NEXT_PUBLIC_* variables (which are burned into the build),
 * these values are read dynamically from .env.local on each request.
 *
 * Usage:
 * - Change values in .env.local on the server
 * - Restart the app (pm2 restart, etc.)
 * - No rebuild needed!
 */
export async function GET() {
  const config = {
    // Read from server-side env variables (not NEXT_PUBLIC_*)
    // These can be changed without rebuilding
    timeout: parseInt(process.env.BIZUIT_TIMEOUT || '30000', 10),
    tokenExpirationMinutes: parseInt(process.env.BIZUIT_TOKEN_EXPIRATION_MINUTES || '1440', 10),

    // These are still from NEXT_PUBLIC because they're needed at build time
    // But we return them here for consistency
    formsApiUrl: process.env.NEXT_PUBLIC_BIZUIT_FORMS_API_URL || '/api/bizuit',
    dashboardApiUrl: process.env.NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL || '/api/bizuit',
  }

  console.log('[Config API] Serving runtime configuration:', config)

  return NextResponse.json(config, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
