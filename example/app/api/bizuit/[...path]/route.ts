import { NextRequest, NextResponse } from 'next/server'

// This variable is read from .env.local at RUNTIME (not burned into the build)
// You can change it without rebuilding the app
const BIZUIT_API_BASE = process.env.BIZUIT_API_BASE_URL || 'https://test.bizuit.com/arielschbizuitdashboardapi/api'

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
    const path = params.path.join('/')
    const url = new URL(request.url)
    const queryString = url.search
    const targetUrl = `${BIZUIT_API_BASE}/${path}${queryString}`

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

    console.log(`[Bizuit Proxy] Headers being sent:`, {
      authorization: headers['Authorization'] || 'NOT PRESENT',
      authStartsWith: headers['Authorization'] ? `Starts with: "${headers['Authorization'].substring(0, 12)}"` : 'N/A',
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
