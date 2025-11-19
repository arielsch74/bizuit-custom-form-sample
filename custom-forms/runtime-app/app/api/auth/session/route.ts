import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * GET /api/auth/session
 *
 * Returns current user session if authenticated
 */
export async function GET() {
  try {
    const cookieStore = await cookies()

    // Check for admin_token (used by admin pages)
    const adminToken = cookieStore.get('admin_token')
    const adminUserData = cookieStore.get('admin_user_data')

    if (adminToken && adminUserData) {
      return NextResponse.json({
        authenticated: true,
        user: JSON.parse(adminUserData.value),
      })
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
