'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { ILoginResponse } from '@bizuit/form-sdk'

export interface BizuitAuthContextType {
  token: string | null
  user: ILoginResponse['User'] | null
  expirationDate: string | null
  isAuthenticated: boolean
  login: (loginResponse: ILoginResponse) => void
  logout: () => void
  checkAuth: () => boolean
}

const BizuitAuthContext = createContext<BizuitAuthContextType | undefined>(undefined)

const TOKEN_STORAGE_KEY = 'bizuit-auth-token'
const USER_STORAGE_KEY = 'bizuit-auth-user'
const EXPIRATION_STORAGE_KEY = 'bizuit-auth-expiration'

export interface BizuitAuthProviderProps {
  children: ReactNode
  tokenStorageKey?: string
  userStorageKey?: string
  expirationStorageKey?: string
}

/**
 * BizuitAuthProvider
 * Manages authentication state and localStorage persistence
 *
 * @example
 * ```tsx
 * import { BizuitAuthProvider, useBizuitAuth } from '@bizuit/ui-components'
 *
 * // In your root layout:
 * <BizuitAuthProvider>
 *   {children}
 * </BizuitAuthProvider>
 *
 * // In your components:
 * const { isAuthenticated, user, token, login, logout } = useBizuitAuth()
 * ```
 */
export function BizuitAuthProvider({
  children,
  tokenStorageKey = TOKEN_STORAGE_KEY,
  userStorageKey = USER_STORAGE_KEY,
  expirationStorageKey = EXPIRATION_STORAGE_KEY,
}: BizuitAuthProviderProps) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<ILoginResponse['User'] | null>(null)
  const [expirationDate, setExpirationDate] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load auth data from localStorage on mount
    const storedToken = localStorage.getItem(tokenStorageKey)
    const storedUser = localStorage.getItem(userStorageKey)
    const storedExpiration = localStorage.getItem(expirationStorageKey)

    if (storedToken && storedUser && storedExpiration) {
      // Check if token is expired
      const expDate = new Date(storedExpiration)
      if (expDate > new Date()) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        setExpirationDate(storedExpiration)
      } else {
        // Token expired, clear storage
        localStorage.removeItem(tokenStorageKey)
        localStorage.removeItem(userStorageKey)
        localStorage.removeItem(expirationStorageKey)
      }
    }

    setMounted(true)
  }, [tokenStorageKey, userStorageKey, expirationStorageKey])

  const login = (loginResponse: ILoginResponse) => {
    const { Token, User, ExpirationDate } = loginResponse

    console.log('[BizuitAuth] Login successful, saving to state and localStorage:', {
      token: Token?.substring(0, 20) + '...',
      user: User,
      expiration: ExpirationDate
    })

    setToken(Token)
    setUser(User)
    setExpirationDate(ExpirationDate)

    localStorage.setItem(tokenStorageKey, Token)
    localStorage.setItem(userStorageKey, JSON.stringify(User))
    localStorage.setItem(expirationStorageKey, ExpirationDate)

    console.log('[BizuitAuth] State updated, isAuthenticated will be:', true)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setExpirationDate(null)

    localStorage.removeItem(tokenStorageKey)
    localStorage.removeItem(userStorageKey)
    localStorage.removeItem(expirationStorageKey)
  }

  const checkAuth = (): boolean => {
    if (!token || !expirationDate) {
      return false
    }

    const expDate = new Date(expirationDate)
    if (expDate <= new Date()) {
      logout()
      return false
    }

    return true
  }

  const value: BizuitAuthContextType = {
    token,
    user,
    expirationDate,
    isAuthenticated: !!token && checkAuth(),
    login,
    logout,
    checkAuth,
  }

  // Prevent rendering until mounted to avoid hydration errors
  if (!mounted) {
    return null
  }

  return <BizuitAuthContext.Provider value={value}>{children}</BizuitAuthContext.Provider>
}

/**
 * useBizuitAuth hook
 * Access authentication state and methods
 *
 * @throws Error if used outside BizuitAuthProvider
 */
export function useBizuitAuth() {
  const context = useContext(BizuitAuthContext)
  if (context === undefined) {
    throw new Error('useBizuitAuth must be used within a BizuitAuthProvider')
  }
  return context
}
