/**
 * useBizuitSDKWithAuth Hook
 *
 * Wrapper del SDK de Bizuit que maneja automáticamente errores 401
 * haciendo logout y redirect a login cuando el token expira.
 *
 * Este hook debe usarse en lugar de useBizuitSDK() en componentes
 * que necesitan manejo automático de autenticación.
 *
 * @example
 * ```tsx
 * // Antes:
 * const sdk = useBizuitSDK()
 * await sdk.process.getParameters(...)
 *
 * // Ahora:
 * const sdk = useBizuitSDKWithAuth()
 * await sdk.process.getParameters(...) // Auto-logout en 401
 * ```
 */

'use client'

import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'
import { useAuthErrorHandler } from './use-auth-error-handler'
import { useMemo } from 'react'

export function useBizuitSDKWithAuth() {
  const originalSDK = useBizuitSDK()
  const handleAuthError = useAuthErrorHandler()

  // Create a wrapper that intercepts all SDK method calls
  const wrappedSDK = useMemo(() => {
    const wrapAsyncMethod = (fn: Function, context: any) => {
      return async function(this: any, ...args: any[]) {
        try {
          return await fn.apply(context, args)
        } catch (error: any) {
          // Check if it's a 401 error
          const handled = handleAuthError(error)
          if (handled) {
            // Error was a 401, logout and redirect happened
            // Re-throw to let caller know the operation failed
            throw new Error('Sesión expirada. Redirigiendo a login...')
          }
          // Not a 401, re-throw original error
          throw error
        }
      }
    }

    const wrapObject = (obj: any): any => {
      if (!obj || typeof obj !== 'object') {
        return obj
      }

      // Use Proxy to intercept property access
      return new Proxy(obj, {
        get(target, prop) {
          const value = target[prop]

          // If it's a function, wrap it
          if (typeof value === 'function') {
            return wrapAsyncMethod(value, target)
          }

          // If it's an object, wrap it recursively
          if (value && typeof value === 'object') {
            return wrapObject(value)
          }

          return value
        }
      })
    }

    return wrapObject(originalSDK)
  }, [originalSDK, handleAuthError])

  return wrappedSDK
}
