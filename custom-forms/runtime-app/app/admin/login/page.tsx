'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLoginForm } from '@/hooks/useLoginForm'
import { apiFetch } from '@/lib/api-client'
import { AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [checking, setChecking] = useState(true)
  const [showExpiredMessage, setShowExpiredMessage] = useState(false)
  const { username, password, loading, error, setUsername, setPassword, handleLogin } = useLoginForm('/admin')

  useEffect(() => {
    // Check if redirected due to expired session
    const expired = searchParams.get('expired') === 'true'
    if (expired) {
      setShowExpiredMessage(true)
      // Clean URL by removing the expired parameter
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams])

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      try {
        // Use apiFetch to ensure basePath is added (Next.js doesn't add it for client fetch)
        const response = await apiFetch('/api/auth/session', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          if (data.authenticated) {
            // Already logged in, redirect to admin
            router.push('/admin')
            return
          }
        }
      } catch (error) {
        // Not authenticated, show login form
      } finally {
        setChecking(false)
      }
    }

    checkAuth()
  }, [router])

  // Show loading while checking auth
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 dark:text-slate-400">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-700">
        <h1 className="text-3xl font-bold text-white dark:text-white mb-2 text-center">
          Admin Login
        </h1>
        <p className="text-slate-400 dark:text-slate-400 mb-8 text-center">
          BIZUIT Custom Forms
        </p>

        {showExpiredMessage && (
          <div className="mb-6 bg-orange-900/20 border border-orange-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-orange-400 mb-1">
                  Sesión Expirada
                </p>
                <p className="text-sm text-orange-300">
                  Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 dark:text-slate-300 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-700 dark:bg-slate-700 border border-slate-600 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white dark:text-white placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 dark:text-slate-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-700 dark:bg-slate-700 border border-slate-600 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white dark:text-white placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 bg-orange-900/20 border border-orange-700 rounded-lg p-4">
          <p className="text-sm text-orange-400">
            <strong>Nota:</strong> Usa tus credenciales de BIZUIT Dashboard.
          </p>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-slate-400 hover:text-orange-500 underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
