import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000'

/**
 * GET /api/custom-forms/{formName}/metadata
 *
 * Returns metadata for a specific form from SQL Server
 * Uses the same backend endpoint as the forms list
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formName: string }> }
) {
  try {
    const { formName } = await params

    console.log(`[Form Metadata API] GET /${formName}/metadata`)

    // Fetch all forms from backend
    const response = await fetch(`${FASTAPI_URL}/api/custom-forms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      console.error(`[Form Metadata API] Backend error:`, error)
      return NextResponse.json(
        { error: 'Failed to fetch forms from backend' },
        { status: response.status }
      )
    }

    const forms = await response.json()

    // Find the specific form
    const formMetadata = forms.find((f: any) => f.formName === formName)

    if (!formMetadata) {
      console.error(`[Form Metadata API] Form not found: ${formName}`)
      return NextResponse.json(
        { error: `Form '${formName}' not found` },
        { status: 404 }
      )
    }

    console.log(`[Form Metadata API] ✅ Metadata for ${formName}@${formMetadata.currentVersion}`)

    return NextResponse.json(formMetadata, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error: any) {
    console.error('[Form Metadata API] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch form metadata',
        details: error.message || 'Internal server error'
      },
      { status: 500 }
    )
  }
}
