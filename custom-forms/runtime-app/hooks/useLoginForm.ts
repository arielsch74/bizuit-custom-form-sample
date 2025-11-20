'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api-client'

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
      // Use Next.js API route instead of calling backend directly
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success && data.token) {
        // Store cookies client-side (IIS reverse proxy strips Set-Cookie headers)
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/'
        const maxAge = 60 * 60 * 24 // 24 hours in seconds
        const expires = new Date(Date.now() + maxAge * 1000).toUTCString()

        // Set admin_token cookie (not HttpOnly because we can't set that from JS)
        document.cookie = `admin_token=${data.token}; path=${basePath}; expires=${expires}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`

        // Set admin_user_data cookie
        document.cookie = `admin_user_data=${encodeURIComponent(JSON.stringify(data.user))}; path=${basePath}; expires=${expires}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`

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
