import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000'

/**
 * POST /api/auth/login
 *
 * Secure login endpoint that sets HttpOnly cookies instead of returning tokens to client.
 * This prevents XSS attacks from stealing authentication tokens.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Authenticate with backend
    const response = await fetch(`${FASTAPI_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (!data.success || !data.token) {
      return NextResponse.json(
        { success: false, error: data.error || 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Set HttpOnly cookie with the JWT token
    // HttpOnly = prevents JavaScript access (XSS protection)
    // Secure = only sent over HTTPS in production
    // SameSite = CSRF protection
    const cookieStore = await cookies()

    cookieStore.set('admin_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    // Store user data in a separate cookie (not HttpOnly so client can read it)
    cookieStore.set('admin_user_data', JSON.stringify(data.user), {
      httpOnly: false, // Allow client to read user info
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: data.user,
    })

  } catch (error: any) {
    console.error('[Auth API] Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
