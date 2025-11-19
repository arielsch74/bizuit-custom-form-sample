/**
 * Webhook Endpoint: /api/forms/reload
 *
 * Este endpoint recibe notificaciones cuando se publica un nuevo form.
 * GitHub Actions llama este endpoint después de publicar a npm/BD.
 */

import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { formRegistry } from '@/lib/form-registry'
import { clearFormCache } from '@/lib/form-loader'

/**
 * SECURITY: Verifica el webhook secret usando comparación timing-safe
 *
 * Previene timing attacks usando timingSafeEqual de Node.js crypto
 *
 * @param request - NextRequest con header x-webhook-secret
 * @returns true si el secret es válido, false si no
 * @throws Error si WEBHOOK_SECRET no está configurado o es débil
 */
function verifyWebhookSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-webhook-secret')
  const expectedSecret = process.env.WEBHOOK_SECRET

  // SECURITY: Rechazar si no está configurado
  if (!expectedSecret) {
    throw new Error(
      'WEBHOOK_SECRET environment variable is not configured. ' +
      'Generate a strong secret with: openssl rand -hex 32'
    )
  }

  // SECURITY: Rechazar si es el valor por defecto débil
  if (expectedSecret === 'dev-webhook-secret-change-in-production' ||
      expectedSecret === 'your-webhook-secret-here' ||
      expectedSecret.length < 32) {
    throw new Error(
      'WEBHOOK_SECRET is too weak or using default value. ' +
      'Generate a strong secret with: openssl rand -hex 32'
    )
  }

  if (!secret) {
    return false
  }

  // SECURITY: Timing-safe comparison para prevenir timing attacks
  try {
    const secretBuf = Buffer.from(secret, 'utf-8')
    const expectedBuf = Buffer.from(expectedSecret, 'utf-8')

    // Verificar longitud primero (timing-safe igual verifica esto)
    if (secretBuf.length !== expectedBuf.length) {
      return false
    }

    return timingSafeEqual(secretBuf, expectedBuf)
  } catch (error) {
    console.error('[Webhook Security] Error in timing-safe comparison:', error)
    return false
  }
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

    // Limpiar cache de todos los forms
    clearFormCache()

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
 * SECURITY NOTE: GET endpoint removed
 *
 * Previously allowed secret via query parameter (?secret=xxx) which is insecure:
 * - Secrets in URLs appear in server logs, browser history, referrer headers
 * - Not suitable for production security
 *
 * Use POST endpoint with x-webhook-secret header instead.
 * For manual cache reload, use admin panel or deployment scripts.
 */
