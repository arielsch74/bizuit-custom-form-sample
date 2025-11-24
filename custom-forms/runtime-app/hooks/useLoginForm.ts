'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api-client'
import { getTenantId } from '@/lib/navigation'

interface LoginFormState {
  username: string
  password: string
  loading: boolean
  error: string
}

interface LoginFormHandlers {
  setUsername: (value: string) => void
  setPassword: (value: string) => void
  handleLogin: (e: React.FormEvent) => Promise<void>
}

export type UseLoginFormReturn = LoginFormState & LoginFormHandlers

/**
 * Custom hook for handling login form logic
 * Centralizes authentication logic to avoid duplication across login pages
 */
export function useLoginForm(redirectPath: string = '/admin'): UseLoginFormReturn {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // SECURITY: Get tenant ID for multi-tenant isolation
      const tenantId = getTenantId()

      // Use apiFetch to ensure basePath is added (Next.js doesn't add it for client fetch)
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          tenant_id: tenantId  // SECURITY: Send tenant ID to backend
        }),
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success && data.token) {
        // Store cookies client-side (IIS reverse proxy strips Set-Cookie headers)
        // Get basePath dynamically (same method as apiFetch)
        const getBasePath = () => {
          try {
            const scripts = document.querySelectorAll('script')
            for (const script of scripts) {
              const content = script.textContent || ''
              const match = content.match(/\\"p\\":\\"(\/[^\\]+)\\"/)
              if (match && match[1]) return match[1]
            }
          } catch {}
          return process.env.NEXT_PUBLIC_BASE_PATH || '/'
        }

        const basePath = getBasePath()
        const maxAge = 60 * 60 * 24 // 24 hours in seconds
        const expires = new Date(Date.now() + maxAge * 1000).toUTCString()

        // SECURITY: Prefix cookies with tenant ID for multi-tenant isolation
        const cookiePrefix = tenantId !== 'default' ? `${tenantId}_` : ''

        // Set admin_token cookie (not HttpOnly because we can't set that from JS)
        document.cookie = `${cookiePrefix}admin_token=${data.token}; path=${basePath}; expires=${expires}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`

        // Set admin_user_data cookie
        document.cookie = `${cookiePrefix}admin_user_data=${encodeURIComponent(JSON.stringify(data.user))}; path=${basePath}; expires=${expires}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`

        router.push(redirectPath)
      } else {
        setError(data.error || 'Credenciales inválidas')
      }
    } catch (err: any) {
      setError('Error de conexión: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    username,
    password,
    loading,
    error,
    setUsername,
    setPassword,
    handleLogin,
  }
}
