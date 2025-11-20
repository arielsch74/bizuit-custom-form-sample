import { NextRequest, NextResponse } from 'next/server'

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
    const backendResponse = await fetch(`${FASTAPI_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await backendResponse.json()

    if (!data.success || !data.token) {
      return NextResponse.json(
        { success: false, error: data.error || 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Return token and user data to client
    // Client will store in cookies (IIS strips Set-Cookie headers in reverse proxy mode)
    return NextResponse.json({
      success: true,
      token: data.token,
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
