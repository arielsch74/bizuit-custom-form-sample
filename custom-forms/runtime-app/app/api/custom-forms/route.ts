import { NextResponse } from 'next/server'

/**
 * API endpoint that proxies to Python FastAPI backend
 * GET /api/custom-forms
 *
 * Calls: GET http://localhost:8000/forms
 */
export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_CUSTOM_FORMS_API_URL || 'http://localhost:8000'

  try {
    console.log(`[Custom Forms API] Fetching forms from: ${backendUrl}/forms`)

    const response = await fetch(`${backendUrl}/forms`, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // Don't cache, always fetch fresh data
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }

    const forms = await response.json()

    console.log(`[Custom Forms API] ✅ Loaded ${forms.length} forms from database`)

    return NextResponse.json(forms, {
      headers: {
        'Cache-Control': 'public, max-age=60' // 1 min cache
      }
    })
  } catch (error: any) {
    console.error(`[Custom Forms API] ❌ Error fetching forms:`, error.message)

    return NextResponse.json(
      {
        error: 'Failed to fetch forms from database',
        message: error.message,
        forms: [] // Return empty array on error
      },
      {
        status: 500
      }
    )
  }
}
