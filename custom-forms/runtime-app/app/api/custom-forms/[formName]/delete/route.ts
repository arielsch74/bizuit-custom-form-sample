import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth-server'

const FASTAPI_URL = process.env.FASTAPI_URL
if (!FASTAPI_URL) {
  throw new Error('FASTAPI_URL environment variable is required')
}

/**
 * DELETE /api/custom-forms/[formName]/delete
 *
 * Proxy to FastAPI backend to delete a form and all its versions
 *
 * **⚠️ Requires admin authentication** - Cookie-based session
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ formName: string }> }
) {
  try {
    // Validate admin authentication
    await requireAdminAuth(request)

    const { formName } = await params

    const response = await fetch(`${FASTAPI_URL}/api/custom-forms/${formName}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`[Custom Forms API] Backend error deleting ${formName}:`, error)
      return NextResponse.json(
        { error: 'Failed to delete form from backend' },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log(`[Custom Forms API] Deleted form ${formName} - ${result.versions_deleted} version(s)`)

    return NextResponse.json(result)

  } catch (error) {
    console.error('[Custom Forms API] Error deleting form:', error)

    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to delete form',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
