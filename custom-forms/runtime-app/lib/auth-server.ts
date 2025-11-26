/**
 * Server-side authentication utilities for API routes
 *
 * IMPORTANT: These utilities only work in server-side contexts (API routes, Server Components)
 * For client-side auth, use useAuth hook from @/lib/useAuth
 */

import { NextRequest } from 'next/server'

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
 * Get tenant-aware cookie name
 * @param baseName - Base cookie name (e.g., 'admin_token')
 * @param request - Next.js request object
 * @returns Tenant-prefixed cookie name (e.g., 'arielsch_admin_token')
 */
export function getTenantCookieName(baseName: string, request: NextRequest): string {
  const tenantId = getTenantIdFromRequest(request)
  const cookiePrefix = tenantId !== 'default' ? `${tenantId}_` : ''
  return `${cookiePrefix}${baseName}`
}

/**
 * Validates admin session from cookies
 *
 * @param request - Next.js request object
 * @returns User data if authenticated, null otherwise
 */
export async function validateAdminSession(request: NextRequest): Promise<{
  username: string
  roles: string[]
} | null> {
  try {
    // Read cookies from request headers (IIS compatibility)
    const cookieHeader = request.headers.get('cookie') || ''

    // SECURITY: Get tenant-aware cookie names
    const tokenCookieName = getTenantCookieName('admin_token', request)
    const userDataCookieName = getTenantCookieName('admin_user_data', request)

    // Parse admin_token and admin_user_data from cookie string (with tenant prefix)
    const tokenMatch = cookieHeader.match(new RegExp(`${tokenCookieName}=([^;]+)`))
    const userDataMatch = cookieHeader.match(new RegExp(`${userDataCookieName}=([^;]+)`))

    if (!tokenMatch || !userDataMatch) {
      return null
    }

    try {
      // Decode and parse user data
      const userData = JSON.parse(decodeURIComponent(userDataMatch[1]))

      // Validate required fields
      // Support both 'username' (Python backend) and 'userName' (.NET backend)
      const username = userData.username || userData.userName
      if (!username || !Array.isArray(userData.roles)) {
        console.error('[Auth Server] Invalid user data structure', userData)
        return null
      }

      return {
        username: username,
        roles: userData.roles
      }
    } catch (parseError) {
      console.error('[Auth Server] Failed to parse user data:', parseError)
      return null
    }
  } catch (error) {
    console.error('[Auth Server] Session validation error:', error)
    return null
  }
}

/**
 * Validates that request has admin authentication
 * Throws if not authenticated
 *
 * @param request - Next.js request object
 * @throws Error if not authenticated or invalid session
 */
export async function requireAdminAuth(request: NextRequest): Promise<{
  username: string
  roles: string[]
}> {
  const user = await validateAdminSession(request)

  if (!user) {
    throw new Error('Unauthorized - Admin authentication required')
  }

  return user
}
