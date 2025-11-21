import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
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