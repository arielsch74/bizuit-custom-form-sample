import { NextResponse } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL
if (!FASTAPI_URL) {
  throw new Error('FASTAPI_URL environment variable is required')
}

/**
 * GET /api/custom-forms/[formName]/versions
 *
 * Proxy to FastAPI backend to get all versions of a form
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ formName: string }> }
) {
  try {
    const { formName } = await params

    const response = await fetch(`${FASTAPI_URL}/api/custom-forms/${formName}/versions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`[Custom Forms API] Backend error for ${formName}/versions:`, error)
      return NextResponse.json(
        { error: 'Failed to fetch form versions from backend' },
        { status: response.status }
      )
    }

    const versions = await response.json()
    console.log(`[Custom Forms API] Retrieved ${versions.length} versions for form ${formName}`)

    return NextResponse.json(versions, {
      headers: {
        'Cache-Control': 'public, max-age=60' // 1 min cache
      }
    })

  } catch (error) {
    console.error('[Custom Forms API] Error fetching versions:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch form versions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
