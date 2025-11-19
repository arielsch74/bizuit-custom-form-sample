/**
 * useAuthErrorHandler Hook
 *
 * Maneja automáticamente errores 401 (Unauthorized) haciendo logout
 * y redirigiendo al usuario a la página de login.
 *
 * @example
 * ```tsx
 * const handleAuthError = useAuthErrorHandler()
 *
 * try {
 *   await sdk.process.getParameters(...)
 * } catch (error) {
 *   handleAuthError(error) // Auto-logout si es 401
 *   // Continuar con manejo normal del error
 * }
 * ```
 */

'use client'

import { useRouter } from 'next/navigation'
import { useBizuitAuth } from '@tyconsa/bizuit-ui-components'
import { useCallback } from 'react'

export function useAuthErrorHandler() {
  const router = useRouter()
  const { logout } = useBizuitAuth()

  const handleAuthError = useCallback((error: any, redirectPath?: string) => {
    // Check if it's a 401 error
    const is401 = error?.statusCode === 401 ||
                  error?.status === 401 ||
                  error?.response?.status === 401 ||
                  (error?.code && error.code.toUpperCase() === 'UNAUTHORIZED')

    if (is401) {
      console.warn('[Auth] Token expirado o inválido detectado. Cerrando sesión...')

      // Clear auth data
      logout()

      // Redirect to login with return URL
      const currentPath = redirectPath || window.location.pathname + window.location.search
      const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`

      console.log('[Auth] Redirigiendo a:', loginUrl)
      router.push(loginUrl)

      return true // Indica que se manejó el error 401
    }

    return false // No es un error 401
  }, [logout, router])

  return handleAuthError
}
