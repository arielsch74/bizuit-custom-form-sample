'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBizuitAuth } from '@tyconsa/bizuit-ui-components'
import { type ILoginResponse } from '@tyconsa/bizuit-form-sdk'

interface RequireAuthProps {
  children: ReactNode
  returnUrl?: string
}

/**
 * RequireAuth Component
 *
 * Wraps content that requires authentication.
 * If user is not authenticated and no token in URL, redirects to login.
 * If token is provided in URL, auto-logs in the user.
 *
 * @example
 * ```tsx
 * <RequireAuth returnUrl="/my-page">
 *   <MyProtectedContent />
 * </RequireAuth>
 * ```
 */
export function RequireAuth({ children, returnUrl }: RequireAuthProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, login: setAuthData } = useBizuitAuth()
  const [mounted, setMounted] = useState(false)
  const [urlTokenProcessed, setUrlTokenProcessed] = useState(false)

  // Get token from URL
  const urlToken = searchParams.get('token')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Process URL token if provided (auto-login from Bizuit BPM)
  useEffect(() => {
    if (mounted && urlToken && !urlTokenProcessed) {
      setUrlTokenProcessed(true)

      // Create mock user object from URL token
      const mockUserFromToken: ILoginResponse = {
        Token: urlToken,
        User: {
          Username: 'bizuit-user',
          UserID: 0,
          DisplayName: 'Usuario Bizuit',
        },
        ExpirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      }

      setAuthData(mockUserFromToken)
    }
  }, [mounted, urlToken, urlTokenProcessed, setAuthData])

  // Redirect to login if not authenticated and no URL token
  useEffect(() => {
    if (!mounted || urlToken) return

    // Small delay to let AuthProvider restore session from localStorage
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        const params = new URLSearchParams()
        if (returnUrl) {
          params.set('redirect', returnUrl)
        }
        router.push(`/login?${params.toString()}`)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [mounted, isAuthenticated, urlToken, router, returnUrl])

  // Don't render until mounted to avoid hydration errors
  if (!mounted) {
    return null
  }

  // Don't render children until authenticated or URL token is processed
  if (!isAuthenticated && !urlToken) {
    return null
  }

  return <>{children}</>
}
