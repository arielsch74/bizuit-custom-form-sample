import { NextResponse } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL
if (!FASTAPI_URL) {
  throw new Error('FASTAPI_URL environment variable is required')
}

/**
 * GET /api/custom-forms
 *
 * Proxy to FastAPI backend which queries SQL Server
 */
export async function GET() {
  try {
    const response = await fetch(`${FASTAPI_URL}/api/custom-forms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // No cache para siempre obtener datos frescos
      cache: 'no-store'
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[Custom Forms API] Backend error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch forms from backend' },
        { status: response.status }
      )
    }

    const forms = await response.json()
    console.log(`[Custom Forms API] Retrieved ${forms.length} forms from backend`)

    return NextResponse.json(forms, {
      headers: {
        'Cache-Control': 'public, max-age=300' // 5 min cache
      }
    })

  } catch (error) {
    console.error('[Custom Forms API] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch forms',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
