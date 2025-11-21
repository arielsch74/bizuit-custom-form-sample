import { NextResponse } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL
if (!FASTAPI_URL) {
  throw new Error('FASTAPI_URL environment variable is required')
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ formName: string; version: string }> }
) {
  try {
    const { formName, version } = await params

    const response = await fetch(`${FASTAPI_URL}/api/custom-forms/${formName}/versions/${version}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
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
    return NextResponse.json(
      { error: error.message || 'Failed to delete version' },
      { status: 500 }
    )
  }
}
