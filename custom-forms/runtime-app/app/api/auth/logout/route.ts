import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * POST /api/auth/logout
 *
 * Logout endpoint that clears authentication cookies
 */
export async function POST() {
  try {
    const cookieStore = await cookies()

    // Clear admin auth cookies (must match names set in login route)
    cookieStore.delete('admin_token')
    cookieStore.delete('admin_user_data')

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[Auth API] Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
