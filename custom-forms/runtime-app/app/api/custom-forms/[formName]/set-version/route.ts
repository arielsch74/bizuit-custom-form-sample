import { NextResponse } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL
if (!FASTAPI_URL) {
  throw new Error('FASTAPI_URL environment variable is required')
}

/**
 * POST /api/custom-forms/[formName]/set-version?version=X.X.X
 *
 * Proxy to FastAPI backend to set a specific version as current
 */
export async function POST(
  request: Request,
  { params }: { params: { formName: string } }
) {
  try {
    const { formName } = params
    const { searchParams } = new URL(request.url)
    const version = searchParams.get('version')

    if (!version) {
      return NextResponse.json(
        { error: 'Version parameter is required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${FASTAPI_URL}/api/custom-forms/${formName}/set-version?version=${version}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error(`[Custom Forms API] Backend error for ${formName}/set-version:`, error)
      return NextResponse.json(
        { error: 'Failed to set form version' },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log(`[Custom Forms API] Set version ${version} as current for form ${formName}`)

    return NextResponse.json(result)

  } catch (error) {
    console.error('[Custom Forms API] Error setting version:', error)
    return NextResponse.json(
      {
        error: 'Failed to set form version',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
