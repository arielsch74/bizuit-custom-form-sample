import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const FASTAPI_URL = process.env.FASTAPI_URL
if (!FASTAPI_URL) {
  throw new Error('FASTAPI_URL environment variable is required')
};

export async function POST(request: NextRequest) {
  try {
    // Get the admin_token from HttpOnly cookie
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token');

    if (!adminToken) {
      console.log('[Deployment Proxy] No admin_token cookie found');
      return NextResponse.json(
        {
          success: false,
          error: 'No autenticado. Por favor inicia sesión nuevamente.',
          detail: { message: 'Authentication required' }
        },
        { status: 401 }
      );
    }

    console.log('[Deployment Proxy] Found admin_token, forwarding to backend...');

    // Get the form data from the request
    const formData = await request.formData();

    // Forward the request to FastAPI backend with Authorization header
    const response = await fetch(`${FASTAPI_URL}/api/deployment/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken.value}`,
      },
      body: formData,
    });

    const data = await response.json();

    console.log('[Deployment Proxy] Backend response status:', response.status);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Deployment Proxy] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to proxy request to deployment API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
