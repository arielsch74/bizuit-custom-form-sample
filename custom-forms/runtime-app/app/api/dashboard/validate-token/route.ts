import { NextResponse } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL
if (!FASTAPI_URL) {
  throw new Error('FASTAPI_URL environment variable is required')
}

/**
 * POST /api/dashboard/validate-token
 *
 * Proxy to FastAPI backend to validate Dashboard tokens
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await fetch(`${FASTAPI_URL}/api/dashboard/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[Dashboard API] Backend error validating token:', error)
      return NextResponse.json(
        { valid: false, error: 'Failed to validate token' },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('[Dashboard API] Token validation result:', result.valid ? 'valid' : 'invalid')

    return NextResponse.json(result)

  } catch (error) {
    console.error('[Dashboard API] Error validating token:', error)
    return NextResponse.json(
      {
        valid: false,
        error: 'Failed to validate token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
