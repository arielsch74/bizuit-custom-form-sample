import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

  // Only apply in production
  if (process.env.NODE_ENV !== 'production' || !basePath) {
    return NextResponse.next()
  }

  // Fix for _next/static assets without basePath
  if (request.nextUrl.pathname.startsWith('/_next/')) {
    return NextResponse.next()
  }

  // Add basePath to response headers for client-side code
  const response = NextResponse.next()
  response.headers.set('x-base-path', basePath)

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