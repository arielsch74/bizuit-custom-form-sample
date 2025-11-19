'use client'

import { useState, FormEvent } from 'react'
import { Button } from './ui/button'
import { useTranslation } from '../providers/use-translation'
import type { BizuitAuthService, ILoginResponse } from '@tyconsa/bizuit-form-sdk'

export interface BizuitLoginProps {
  authService: BizuitAuthService
  onLoginSuccess: (loginResponse: ILoginResponse) => void
  onLoginError?: (error: Error) => void
  className?: string
}

/**
 * BizuitLogin Component
 * Reusable login form for Bizuit authentication
 *
 * @example
 * ```tsx
 * import { BizuitLogin } from '@bizuit/ui-components'
 * import { BizuitAuthService } from '@tyconsa/bizuit-form-sdk'
 *
 * const authService = new BizuitAuthService(bizuitConfig)
 *
 * <BizuitLogin
 *   authService={authService}
 *   onLoginSuccess={(response) => {
 *     console.log('Login successful:', response)
 *     // Store token and redirect
 *   }}
 *   onLoginError={(error) => {
 *     console.error('Login failed:', error)
 *   }}
 * />
 * ```
 */
export function BizuitLogin({
  authService,
  onLoginSuccess,
  onLoginError,
  className = '',
}: BizuitLoginProps) {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const loginResponse = await authService.login({ username, password })
      onLoginSuccess(loginResponse)
    } catch (err: any) {
      const errorMessage = err.message || 'Error al iniciar sesión'
      setError(errorMessage)
      setIsLoading(false)

      if (onLoginError) {
        onLoginError(err)
      }
    }
  }

  return (
    <div className={`w-full max-w-md ${className}`}>
      <div className="bg-card border rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('login.title')}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              {t('login.username')}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('login.username.placeholder')}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              {t('login.password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.password.placeholder')}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 placeholder:text-muted-foreground"
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">{t('login.error')}</p>
              <p className="text-sm text-destructive mt-1">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('login.submitting') : t('login.submit')}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted/50 rounded-md">
          <p className="text-xs text-muted-foreground">
            <strong>{t('startProcess.note')}</strong>{' '}
            {t('startProcess.note.description')}
          </p>
        </div>
      </div>
    </div>
  )
}
