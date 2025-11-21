import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth-server'

const FASTAPI_URL = process.env.FASTAPI_URL
if (!FASTAPI_URL) {
  throw new Error('FASTAPI_URL environment variable is required')
}

/**
 * DELETE /api/custom-forms/[formName]/versions/[version]/delete
 *
 * Proxy to FastAPI backend to delete a specific version of a form
 *
 * **⚠️ Requires admin authentication** - Cookie-based session
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ formName: string; version: string }> }
) {
  try {
    // Validate admin authentication
    await requireAdminAuth(request)

    const { formName, version } = await params

    // Extract JWT token from cookie to forward to backend
    const cookieHeader = request.headers.get('cookie') || ''
    const tokenMatch = cookieHeader.match(/admin_token=([^;]+)/)
    const adminToken = tokenMatch ? tokenMatch[1] : null

    if (!adminToken) {
      return NextResponse.json(
        { error: 'No admin token found' },
        { status: 401 }
      )
    }

    const response = await fetch(`${FASTAPI_URL}/api/custom-forms/${formName}/versions/${version}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`, // Forward the JWT token
      },
    })

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status })
    }

    console.log(`[Custom Forms API] Deleted version ${version} of form ${formName}`)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[Custom Forms API] Error deleting version:', error)

    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete version' },
      { status: 500 }
    )
  }
}
