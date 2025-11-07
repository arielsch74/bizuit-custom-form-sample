'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BizuitLogin, useBizuitAuth, useTranslation } from '@bizuit/ui-components'
import { BizuitAuthService } from '@bizuit/form-sdk'
import { bizuitConfig } from '@/lib/config'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const { login: setAuthData, isAuthenticated } = useBizuitAuth()
  const [mounted, setMounted] = useState(false)

  const redirectTo = searchParams.get('redirect') || '/'
  const authService = new BizuitAuthService(bizuitConfig)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Redirect if already authenticated
    if (mounted && isAuthenticated) {
      router.push(redirectTo)
    }
  }, [mounted, isAuthenticated, router, redirectTo])

  if (!mounted || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {!mounted ? (
            <div className="h-8 w-32 bg-muted animate-pulse rounded mx-auto" />
          ) : (
            <h2 className="text-xl font-semibold">{t('login.redirecting')}</h2>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            {t('nav.backToHome')}
          </Link>
        </div>

        <BizuitLogin
          authService={authService}
          onLoginSuccess={(loginResponse) => {
            setAuthData(loginResponse)
            router.push(redirectTo)
          }}
          onLoginError={(error) => {
            console.error('Login error:', error)
          }}
        />
      </div>
    </div>
  )
}
