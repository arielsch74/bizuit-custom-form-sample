/**
 * Webhook Endpoint: /api/forms/reload
 *
 * Este endpoint recibe notificaciones cuando se publica un nuevo form.
 * GitHub Actions llama este endpoint después de publicar a npm/BD.
 */

import { NextRequest, NextResponse } from 'next/server'
import { formRegistry } from '@/lib/form-registry'
import { clearFormCache } from '@/lib/form-loader'

/**
 * Verifica el webhook secret para seguridad
 */
function verifyWebhookSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-webhook-secret')
  const expectedSecret = process.env.WEBHOOK_SECRET

  if (!expectedSecret) {
    console.warn('[Webhook] WEBHOOK_SECRET not configured')
    return false
  }

  return secret === expectedSecret
}

/**
 * POST /api/forms/reload
 *
 * Body esperado:
 * {
 *   "formName": "aprobacion-gastos",
 *   "packageName": "@empresa/aprobacion-gastos",
 *   "version": "1.0.1",
 *   "action": "published" | "updated" | "deleted"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    if (!verifyWebhookSecret(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid webhook secret' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { formName, packageName, version, action } = body

    console.log('[Webhook] Received reload request:', {
      formName,
      packageName,
      version,
      action,
    })

    // Validar campos requeridos
    if (!formName || !packageName || !version) {
      return NextResponse.json(
        { error: 'Missing required fields: formName, packageName, version' },
        { status: 400 }
      )
    }

    // Limpiar cache del form específico
    clearFormCache(packageName)

    // Recargar registry desde API (si está configurado)
    const apiUrl = process.env.CUSTOM_FORMS_API_URL
    if (apiUrl) {
      try {
        await formRegistry.loadFromAPI(`${apiUrl}/api/custom-forms`)
        console.log('[Webhook] ✅ Registry reloaded from API')
      } catch (error: any) {
        console.error('[Webhook] Failed to reload from API:', error)
        // No fallar el webhook por esto
      }
    }

    // Si la acción es "deleted", remover del registry
    if (action === 'deleted') {
      formRegistry.removeForm(formName)
    }

    return NextResponse.json({
      success: true,
      message: `Form ${formName} cache cleared and registry reloaded`,
      formName,
      packageName,
      version,
      action,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('[Webhook] Error processing reload:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/forms/reload?secret=xxx
 *
 * Permite recargar manualmente el registry (útil para debugging)
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const secret = url.searchParams.get('secret')

    // Verificar secret via query param
    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid secret' },
        { status: 401 }
      )
    }

    // Limpiar todo el cache
    clearFormCache()

    // Recargar registry
    const apiUrl = process.env.CUSTOM_FORMS_API_URL
    if (apiUrl) {
      await formRegistry.loadFromAPI(`${apiUrl}/api/custom-forms`)
    }

    const stats = formRegistry.getStats()

    return NextResponse.json({
      success: true,
      message: 'Form cache cleared and registry reloaded',
      stats,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('[Webhook] Error in manual reload:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
