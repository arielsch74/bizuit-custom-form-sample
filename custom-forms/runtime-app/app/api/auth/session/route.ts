import { NextRequest, NextResponse } from 'next/server'

/**
 * Extract tenant ID from request URL
 * Used for multi-tenant cookie isolation
 */
function getTenantIdFromRequest(request: NextRequest): string {
  const url = new URL(request.url)
  const pathname = url.pathname

  // Match pattern: /XXXXBIZUITCustomForms/...
  const match = pathname.match(/^\/([^/]+?)BIZUIT/)
  return match ? match[1] : 'default'
}

/**
 * GET /api/auth/session
 *
 * Returns current user session if authenticated
 * Reads cookies from request headers for IIS reverse proxy compatibility
 */
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Get tenant ID for multi-tenant isolation
    const tenantId = getTenantIdFromRequest(request)
    const cookiePrefix = tenantId !== 'default' ? `${tenantId}_` : ''

    // Read cookies from request headers (IIS compatibility)
    const cookieHeader = request.headers.get('cookie') || ''

    // Parse admin_token and admin_user_data from cookie string (with tenant prefix)
    const tokenMatch = cookieHeader.match(new RegExp(`${cookiePrefix}admin_token=([^;]+)`))
    const userDataMatch = cookieHeader.match(new RegExp(`${cookiePrefix}admin_user_data=([^;]+)`))

    if (tokenMatch && userDataMatch) {
      try {
        // Decode and parse user data
        const userData = JSON.parse(decodeURIComponent(userDataMatch[1]))

        return NextResponse.json({
          authenticated: true,
          user: userData,
        })
      } catch (parseError) {
        console.error('[Auth API] Failed to parse user data:', parseError)
        return NextResponse.json(
          { authenticated: false, error: 'Invalid session data' },
          { status: 401 }
        )
      }
    }

    // Not authenticated
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )

  } catch (error: any) {
    console.error('[Auth API] Session check error:', error)
    return NextResponse.json(
      { authenticated: false, error: error.message },
      { status: 401 }
    )
  }
}
