import { NextRequest, NextResponse } from 'next/server'

/**
 * API Proxy para fetch de form source desde CDN
 * Evita problemas de CORS en el browser
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const packageName = searchParams.get('package')
  const version = searchParams.get('version')

  if (!packageName || !version) {
    return NextResponse.json(
      { error: 'Missing package or version parameter' },
      { status: 400 }
    )
  }

  // Intentar múltiples CDNs - preferir .js (CommonJS) sobre .mjs (ESM)
  const cdnUrls = [
    `https://cdn.jsdelivr.net/npm/${packageName}@${version}/dist/index.js`,
    `https://unpkg.com/${packageName}@${version}/dist/index.js`,
    `https://cdn.jsdelivr.net/npm/${packageName}@${version}/dist/index.mjs`,
  ]

  let lastError: string | null = null

  for (const url of cdnUrls) {
    try {
      console.log(`[Form Fetch API] Trying: ${url}`)

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/javascript, text/javascript, */*',
        },
      })

      if (response.ok) {
        const source = await response.text()
        const isESM = source.includes('import ') || source.includes('export ')
        const format = isESM ? 'ESM' : 'CommonJS'
        console.log(`[Form Fetch API] ✅ Fetched from ${url} (${source.length} bytes, ${format})`)

        return new NextResponse(source, {
          status: 200,
          headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
            'X-Module-Format': format,
          },
        })
      }

      lastError = `${response.status} ${response.statusText}`
      console.warn(`[Form Fetch API] ❌ Failed ${url}: ${lastError}`)

    } catch (error: any) {
      lastError = error.message
      console.warn(`[Form Fetch API] ❌ Error ${url}:`, error.message)
    }
  }

  return NextResponse.json(
    {
      error: 'Failed to fetch form source from all CDN providers',
      lastError,
      packageName,
      version,
    },
    { status: 404 }
  )
}
