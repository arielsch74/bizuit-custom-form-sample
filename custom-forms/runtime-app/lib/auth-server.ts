/**
 * Server-side authentication utilities for API routes
 *
 * IMPORTANT: These utilities only work in server-side contexts (API routes, Server Components)
 * For client-side auth, use useAuth hook from @/lib/useAuth
 */

import { NextRequest } from 'next/server'

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

    // Parse admin_token and admin_user_data from cookie string
    const tokenMatch = cookieHeader.match(/admin_token=([^;]+)/)
    const userDataMatch = cookieHeader.match(/admin_user_data=([^;]+)/)

    if (!tokenMatch || !userDataMatch) {
      return null
    }

    try {
      // Decode and parse user data
      const userData = JSON.parse(decodeURIComponent(userDataMatch[1]))

      // Validate required fields
      if (!userData.username || !Array.isArray(userData.roles)) {
        console.error('[Auth Server] Invalid user data structure')
        return null
      }

      return {
        username: userData.username,
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
