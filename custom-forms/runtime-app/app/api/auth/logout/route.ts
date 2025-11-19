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

    // Clear auth cookies
    cookieStore.delete('auth_token')
    cookieStore.delete('user_data')

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[Auth API] Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
