/**
 * Configuración centralizada de la aplicación
 *
 * Las URLs de la API se obtienen de variables de entorno.
 * Ver .env.example para la configuración.
 */

import type { IBizuitConfig } from '@tyconsa/bizuit-form-sdk'

/**
 * Configuración del SDK de Bizuit
 *
 * IMPORTANTE: Todas las variables de entorno deben estar configuradas en .env.local
 * No hay valores por defecto - la aplicación fallará si las variables no están configuradas
 */

// Verificar que las variables requeridas estén configuradas
if (!process.env.NEXT_PUBLIC_BIZUIT_FORMS_API_URL) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_BIZUIT_FORMS_API_URL. Please configure it in .env.local')
}
if (!process.env.NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL. Please configure it in .env.local')
}
if (!process.env.NEXT_PUBLIC_BIZUIT_TIMEOUT) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_BIZUIT_TIMEOUT. Please configure it in .env.local')
}

export const bizuitConfig: IBizuitConfig = {
  formsApiUrl: process.env.NEXT_PUBLIC_BIZUIT_FORMS_API_URL,
  dashboardApiUrl: process.env.NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL,
  timeout: parseInt(process.env.NEXT_PUBLIC_BIZUIT_TIMEOUT),
}

/**
 * URLs base de la API
 *
 * IMPORTANTE: Actualiza estas URLs en tu archivo .env.local
 * según tu entorno.
 *
 * La URL base debe terminar en /api (sin /forms o /dashboard)
 * Los endpoints específicos se agregan en el SDK.
 *
 * Ejemplo:
 * NEXT_PUBLIC_BIZUIT_FORMS_API_URL=https://test.bizuit.com/arielschbizuitdashboardapi/api
 * NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=https://test.bizuit.com/arielschbizuitdashboardapi/api
 */
export const API_CONFIG = {
  FORMS_API: bizuitConfig.formsApiUrl,
  DASHBOARD_API: bizuitConfig.dashboardApiUrl,
  TIMEOUT: bizuitConfig.timeout,
} as const

/**
 * Verifica si la configuración de la API está usando valores por defecto
 */
export const isUsingDefaultConfig = (): boolean => {
  return !process.env.NEXT_PUBLIC_BIZUIT_FORMS_API_URL ||
         !process.env.NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL
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
