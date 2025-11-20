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
      // This allows the server to set HttpOnly cookies
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Important: include cookies in request
      })

      const data = await response.json()

      if (data.success) {
        // No need to store tokens in localStorage - they're in HttpOnly cookies!
        // Cookies are automatically sent with future requests
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
