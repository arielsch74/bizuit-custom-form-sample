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

    // Set HttpOnly cookie with the JWT token
    // HttpOnly = prevents JavaScript access (XSS protection)
    // Secure = only sent over HTTPS in production
    // SameSite = CSRF protection
    // Path = basePath for production (IIS virtual directory) or '/' for development
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/'
    const isProduction = process.env.NODE_ENV === 'production'
    const maxAge = 60 * 60 * 24 // 24 hours in seconds

    // Build Set-Cookie headers manually (IIS reverse proxy compatibility)
    const cookieOptions = `Path=${basePath}; Max-Age=${maxAge}; SameSite=Lax${isProduction ? '; Secure' : ''}`

    const adminTokenCookie = `admin_token=${data.token}; HttpOnly; ${cookieOptions}`
    const adminUserDataCookie = `admin_user_data=${encodeURIComponent(JSON.stringify(data.user))}; ${cookieOptions}`

    // Create response with Set-Cookie headers
    const response = NextResponse.json({
      success: true,
      user: data.user,
    })

    // Set cookies via response headers (works better with IIS reverse proxy)
    response.headers.append('Set-Cookie', adminTokenCookie)
    response.headers.append('Set-Cookie', adminUserDataCookie)

    return response

  } catch (error: any) {
    console.error('[Auth API] Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
