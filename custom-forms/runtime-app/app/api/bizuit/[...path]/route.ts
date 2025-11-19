import { NextRequest, NextResponse } from 'next/server'

// This variable is read from .env.local at RUNTIME (not burned into the build)
// You can change it without rebuilding the app
function getBizuitApiBase() {
  const apiBase = process.env.BIZUIT_API_BASE_URL
  if (!apiBase) {
    throw new Error('BIZUIT_API_BASE_URL environment variable is not configured')
  }
  return apiBase
}

/**
 * SECURITY: Validates path segments to prevent SSRF attacks
 *
 * Blocks:
 * - Path traversal attempts (../, ..\)
 * - Absolute URLs (http://, https://, //)
 * - Special characters that could bypass filters
 * - Null bytes and control characters
 *
 * @param pathSegments - Array of path segments from Next.js dynamic route
 * @returns true if path is safe, false otherwise
 */
function isValidProxyPath(pathSegments: string[]): boolean {
  // Empty path is invalid
  if (!pathSegments || pathSegments.length === 0) {
    return false
  }

  for (const segment of pathSegments) {
    // Block empty segments
    if (!segment || segment.trim() === '') {
      return false
    }

    // Block path traversal attempts
    if (segment.includes('..') || segment.includes('..\\')) {
      console.warn(`[Security] Blocked path traversal attempt: ${segment}`)
      return false
    }

    // Block absolute URLs or protocol-relative URLs
    if (segment.match(/^(https?:\/\/|\/\/)/i)) {
      console.warn(`[Security] Blocked absolute URL in path: ${segment}`)
      return false
    }

    // Block null bytes and control characters
    if (segment.match(/[\x00-\x1F\x7F]/)) {
      console.warn(`[Security] Blocked control characters in path: ${segment}`)
      return false
    }

    // Block suspicious characters that could be used for injection
    // Allow: alphanumeric, dash, underscore, dot, forward slash
    if (!segment.match(/^[a-zA-Z0-9._\/-]+$/)) {
      console.warn(`[Security] Blocked invalid characters in path segment: ${segment}`)
      return false
    }
  }

  return true
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params
  return handleRequest(request, params, 'GET')
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params
  return handleRequest(request, params, 'POST')
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params
  return handleRequest(request, params, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params
  return handleRequest(request, params, 'DELETE')
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    // SECURITY: Validate path segments to prevent SSRF
    if (!isValidProxyPath(params.path)) {
      console.error(`[Bizuit Proxy] SECURITY: Invalid path rejected:`, params.path)
      return NextResponse.json(
        { error: 'Invalid path: potential security risk detected' },
        { status: 400 }
      )
    }

    const path = params.path.join('/')
    const url = new URL(request.url)
    const queryString = url.search
    const targetUrl = `${getBizuitApiBase()}/${path}${queryString}`

    console.log(`[Bizuit Proxy] ${method} ${targetUrl}`)

    // Copy headers from the incoming request
    const headers: HeadersInit = {}
    let authToken: string | null = null

    request.headers.forEach((value, key) => {
      // Skip host and connection headers
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        // Capture Authorization header but don't copy it yet
        if (key.toLowerCase() === 'authorization') {
          authToken = value.replace(/^Bearer\s+/i, '') // Remove "Bearer " prefix
        } else {
          headers[key] = value
        }
      }
    })

    // Transform Authorization: Bearer TOKEN to Authorization: Basic TOKEN
    // (Bizuit API expects Basic authentication, not Bearer)
    if (authToken) {
      headers['Authorization'] = `Basic ${authToken}`
    }

    // SECURITY: Sanitize authorization header in logs
    const sanitizeAuthHeader = (header: string | undefined) => {
      if (!header) return 'NOT PRESENT'
      const parts = header.split(' ')
      if (parts.length === 2) {
        return `${parts[0]} ***REDACTED***`
      }
      return '***REDACTED***'
    }

    console.log(`[Bizuit Proxy] Headers being sent:`, {
      authorization: sanitizeAuthHeader(headers['Authorization']),
      contentType: headers['content-type'],
      allHeaders: Object.keys(headers)
    })

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
    }

    // Add body for POST/PUT requests
    if (method === 'POST' || method === 'PUT') {
      const contentType = request.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const body = await request.json()
        fetchOptions.body = JSON.stringify(body)
      } else if (contentType?.includes('multipart/form-data')) {
        fetchOptions.body = await request.formData()
      } else {
        const text = await request.text()
        if (text) {
          fetchOptions.body = text
        }
      }
    }

    // Make the request to Bizuit API
    const response = await fetch(targetUrl, fetchOptions)

    // Get response body
    const contentType = response.headers.get('content-type')
    let responseBody

    if (contentType?.includes('application/json')) {
      responseBody = await response.json()
    } else {
      responseBody = await response.text()
    }

    console.log(`[Bizuit Proxy] Response ${response.status} from ${targetUrl}`)
    console.log(`[Bizuit Proxy] Response body:`, typeof responseBody === 'string' ? responseBody.substring(0, 200) : JSON.stringify(responseBody).substring(0, 500))

    // Return response with CORS headers
    return new NextResponse(
      typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody),
      {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': contentType || 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, BZ-PROCESS-NAME, BZ-AUTH-TOKEN',
        },
      }
    )
  } catch (error: any) {
    console.error('[Bizuit Proxy] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Proxy error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, BZ-PROCESS-NAME, BZ-AUTH-TOKEN',
    },
  })
}
