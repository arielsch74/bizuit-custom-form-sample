/**
 * Configuración centralizada de la aplicación
 *
 * Las URLs de la API se obtienen de variables de entorno.
 * Ver .env.example para la configuración.
 */

import type { IBizuitConfig } from '@bizuit/form-sdk'

/**
 * Configuración del SDK de Bizuit
 */
export const bizuitConfig: IBizuitConfig = {
  formsApiUrl: process.env.NEXT_PUBLIC_BIZUIT_FORMS_API_URL || 'https://api.bizuit.com/forms',
  dashboardApiUrl: process.env.NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL || 'https://api.bizuit.com/dashboard',
  timeout: parseInt(process.env.NEXT_PUBLIC_BIZUIT_TIMEOUT || '30000'),
}

/**
 * URLs base de la API
 *
 * IMPORTANTE: Actualiza estas URLs en tu archivo .env.local
 * según tu entorno:
 *
 * Desarrollo:
 * NEXT_PUBLIC_BIZUIT_FORMS_API_URL=http://localhost:5000/api/forms
 * NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=http://localhost:5000/api/dashboard
 *
 * Producción:
 * NEXT_PUBLIC_BIZUIT_FORMS_API_URL=https://tu-servidor.com/api/forms
 * NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=https://tu-servidor.com/api/dashboard
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
