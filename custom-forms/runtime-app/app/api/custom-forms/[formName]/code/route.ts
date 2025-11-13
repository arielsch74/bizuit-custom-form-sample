import { NextRequest, NextResponse } from 'next/server'

/**
 * API endpoint para obtener código compilado del form
 *
 * GET /api/custom-forms/{formName}/code
 * Retorna el código JavaScript compilado del form desde la base de datos
 *
 * Calls: GET http://localhost:8000/forms/{formName}/code
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formName: string }> }
) {
  const backendUrl = process.env.NEXT_PUBLIC_CUSTOM_FORMS_API_URL || 'http://localhost:8000'

  try {
    const { formName } = await params
    const version = request.nextUrl.searchParams.get('version')

    console.log(`[Form Code API] GET /${formName}/code${version ? `?version=${version}` : ''}`)

    const url = `${backendUrl}/forms/${formName}/code${version ? `?version=${version}` : ''}`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/javascript',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error(`[Form Code API] Backend returned ${response.status}`)
      return NextResponse.json(
        { error: `Form '${formName}' not found in database` },
        { status: response.status }
      )
    }

    const compiledCode = await response.text()
    const formVersion = response.headers.get('X-Form-Version') || '1.0.0'
    const publishedAt = response.headers.get('X-Published-At') || new Date().toISOString()
    const sizeBytes = response.headers.get('X-Size-Bytes') || compiledCode.length.toString()

    console.log(`[Form Code API] ✅ Serving ${formName}@${formVersion} (${sizeBytes} bytes) from database`)

    // Retornar código JavaScript
    return new NextResponse(compiledCode, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Form-Version': formVersion,
        'X-Published-At': publishedAt,
        'X-Size-Bytes': sizeBytes,
      },
    })

  } catch (error: any) {
    console.error('[Form Code API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
