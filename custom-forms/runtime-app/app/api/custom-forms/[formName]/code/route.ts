import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000'

/**
 * API endpoint para obtener código compilado del form
 *
 * GET /api/custom-forms/{formName}/code
 * Retorna el código JavaScript compilado del form desde SQL Server
 *
 * Proxy to FastAPI backend which queries CustomFormVersions table
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formName: string }> }
) {
  try {
    const { formName } = await params
    const version = request.nextUrl.searchParams.get('version')

    console.log(`[Form Code API] GET /${formName}/code${version ? `?version=${version}` : ''}`)

    // Proxy request to FastAPI backend
    const url = `${FASTAPI_URL}/api/custom-forms/${formName}/code${version ? `?version=${version}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/javascript',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }))
      console.error(`[Form Code API] Backend error:`, error)
      return NextResponse.json(
        { error: error.detail || `Form '${formName}' not found` },
        { status: response.status }
      )
    }

    const compiledCode = await response.text()
    const formVersion = response.headers.get('X-Form-Version')
    const publishedAt = response.headers.get('X-Published-At')
    const sizeBytes = response.headers.get('X-Size-Bytes')

    console.log(`[Form Code API] ✅ Proxied ${formName}@${formVersion} (${sizeBytes} bytes)`)

    // Return JavaScript code with metadata headers
    return new NextResponse(compiledCode, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Form-Version': formVersion || '1.0.0',
        'X-Published-At': publishedAt || new Date().toISOString(),
        'X-Size-Bytes': sizeBytes || compiledCode.length.toString(),
      },
    })

  } catch (error: any) {
    console.error('[Form Code API] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to load form code',
        details: error.message || 'Internal server error'
      },
      { status: 500 }
    )
  }
}
