import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Parse allowed origins from environment variable
 */
function parseAllowedOrigins(): string[] {
  const origins: string[] = []

  // Get configured origins from env
  const configuredOrigins = process.env.NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS
  if (configuredOrigins) {
    origins.push(...configuredOrigins.split(',').map(o => o.trim()).filter(Boolean))
  }

  // Add localhost if allowed (for development)
  if (process.env.NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME === 'true') {
    origins.push('http://localhost')
    origins.push('http://127.0.0.1')
  }

  return origins
}

/**
 * Check if an origin matches an allowed pattern
 */
function isOriginAllowed(origin: string, allowedPattern: string): boolean {
  // Exact match
  if (origin === allowedPattern) {
    return true
  }

  // Wildcard subdomain match (e.g., https://*.example.com)
  if (allowedPattern.includes('*')) {
    const regex = new RegExp('^' + allowedPattern.replace(/\*/g, '.*') + '$')
    return regex.test(origin)
  }

  // Port-agnostic localhost match
  if (allowedPattern.startsWith('http://localhost') || allowedPattern.startsWith('http://127.0.0.1')) {
    const allowedHost = allowedPattern.split('://')[1].split(':')[0]
    const originHost = origin.split('://')[1]?.split(':')[0]
    return originHost === allowedHost
  }

  return false
}

export function middleware(request: NextRequest) {
  // 🔒 SECURITY: Validate Referer header for standalone forms (/formsa/*)
  if (request.nextUrl.pathname.startsWith('/formsa/')) {
    const referer = request.headers.get('referer')

    if (!referer) {
      console.warn('[Middleware] ❌ Standalone form access blocked - no Referer header')
      return new NextResponse(
        JSON.stringify({
          error: 'Access Denied',
          message: 'Standalone forms must be loaded from an allowed origin. Missing Referer header.',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Extract origin from Referer
    let refererOrigin: string
    try {
      const refererUrl = new URL(referer)
      refererOrigin = refererUrl.origin
    } catch {
      console.warn('[Middleware] ❌ Standalone form access blocked - invalid Referer:', referer)
      return new NextResponse(
        JSON.stringify({
          error: 'Access Denied',
          message: 'Invalid Referer header.',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if origin is allowed
    const allowedOrigins = parseAllowedOrigins()
    const isAllowed = allowedOrigins.some(pattern => isOriginAllowed(refererOrigin, pattern))

    if (!isAllowed) {
      console.warn(
        `[Middleware] ❌ Standalone form access blocked - origin not allowed: ${refererOrigin}`,
        `(allowed: ${allowedOrigins.join(', ')})`
      )
      return new NextResponse(
        JSON.stringify({
          error: 'Access Denied',
          message: `Origin "${refererOrigin}" is not in the allowed list. Contact administrator to add your domain.`,
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`[Middleware] ✅ Standalone form access allowed from: ${refererOrigin}`)
  }

  // Get runtime basePath from server environment (not NEXT_PUBLIC_)
  const basePath = process.env.BASE_PATH || ''

  // Add basePath to response headers for client-side code
  const response = NextResponse.next()

  if (basePath) {
    response.headers.set('x-base-path', basePath)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}