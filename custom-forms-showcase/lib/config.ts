/**
 * Configuración centralizada de la aplicación
 *
 * SDK v2.0.0+: Configuración simplificada con una sola URL
 * Ver .env.example para la configuración.
 */

import type { IBizuitConfig } from '@tyconsa/bizuit-form-sdk'

/**
 * Configuración del SDK de Bizuit
 *
 * SDK v2.0.0+: Usa una sola URL (apiUrl) en lugar de formsApiUrl + dashboardApiUrl
 * IMPORTANTE: Configura NEXT_PUBLIC_BIZUIT_API_URL en .env.local
 */

// Verificar que las variables requeridas estén configuradas
if (!process.env.NEXT_PUBLIC_BIZUIT_API_URL) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_BIZUIT_API_URL. Please configure it in .env.local')
}

// Get basePath from environment (e.g., /BIZUITCustomForms in production)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

// Parse timeout with fallback
const timeout = process.env.NEXT_PUBLIC_BIZUIT_TIMEOUT
  ? parseInt(process.env.NEXT_PUBLIC_BIZUIT_TIMEOUT)
  : undefined

export const bizuitConfig: IBizuitConfig = {
  apiUrl: basePath + process.env.NEXT_PUBLIC_BIZUIT_API_URL,
  timeout: timeout || 30000,
}

/**
 * URLs base de la API
 *
 * SDK v2.0.0+: Una sola URL para todas las operaciones
 *
 * IMPORTANTE: Actualiza esta URL en tu archivo .env.local según tu entorno.
 *
 * La URL base debe terminar en /api
 * Los endpoints específicos (/forms, /dashboard, etc.) se agregan automáticamente en el SDK.
 *
 * Ejemplo:
 * NEXT_PUBLIC_BIZUIT_API_URL=https://test.bizuit.com/arielschbizuitdashboardapi/api
 */
export const API_CONFIG = {
  API_URL: bizuitConfig.apiUrl,
  TIMEOUT: bizuitConfig.timeout,
} as const

/**
 * Verifica si la configuración de la API está usando valores por defecto
 */
export const isUsingDefaultConfig = (): boolean => {
  return !process.env.NEXT_PUBLIC_BIZUIT_API_URL
}

/**
 * Obtiene un mensaje de advertencia si se están usando configuraciones por defecto
 */
export const getConfigWarning = (): string | null => {
  if (isUsingDefaultConfig()) {
    return '⚠️ Usando configuración por defecto de la API. Configura las variables de entorno en .env.local'
  }
  return null
}
