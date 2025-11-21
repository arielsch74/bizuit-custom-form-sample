'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface RuntimeConfig {
  basePath: string
  apiUrl: string
  environment: string
  isLoading: boolean
}

const RuntimeConfigContext = createContext<RuntimeConfig>({
  basePath: '',
  apiUrl: '',
  environment: 'development',
  isLoading: true,
})

export function RuntimeConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<RuntimeConfig>({
    basePath: '',
    apiUrl: '',
    environment: 'development',
    isLoading: true,
  })

  useEffect(() => {
    // Always fetch fresh config from API on mount
    // This ensures we get the latest basePath if it changed
    // For the initial config fetch, we need to get basePath from __NEXT_DATA__ directly
    // to avoid circular dependency
    const getInitialBasePath = () => {
      if (typeof window !== 'undefined') {
        // Method 1: Try __NEXT_DATA__ (older Next.js versions)
        try {
          const nextData = (window as any).__NEXT_DATA__
          if (nextData) {
            return nextData.p || nextData.basePath || ''
          }
        } catch {}

        // Method 2: Parse from HTML script tags (Next.js 15 streaming format)
        try {
          const scripts = document.querySelectorAll('script')
          for (const script of scripts) {
            const content = script.textContent || ''
            const match = content.match(/"p":"([^"]+)"/)
            if (match && match[1]) {
              return match[1]
            }
          }
        } catch {}

        // Method 3: Check NEXT_PUBLIC_BASE_PATH from build
        if (process.env.NEXT_PUBLIC_BASE_PATH) {
          return process.env.NEXT_PUBLIC_BASE_PATH
        }
      }
      return ''
    }

    const basePath = getInitialBasePath()
    const configUrl = basePath ? `${basePath}/api/config` : '/api/config'

    fetch(configUrl)
      .then((res) => res.json())
      .then((data) => {
        setConfig({
          ...data,
          isLoading: false,
        })

        // Update sessionStorage with fresh config
        sessionStorage.setItem('runtime-config', JSON.stringify(data))
      })
      .catch((error) => {
        console.error('Failed to load runtime config:', error)

        // Only use cached config as fallback if API fails
        const cached = sessionStorage.getItem('runtime-config')
        if (cached) {
          console.warn('Using cached runtime config due to API error')
          setConfig({
            ...JSON.parse(cached),
            isLoading: false,
          })
        } else {
          setConfig((prev) => ({ ...prev, isLoading: false }))
        }
      })
  }, [])

  return (
    <RuntimeConfigContext.Provider value={config}>
      {children}
    </RuntimeConfigContext.Provider>
  )
}

export function useRuntimeConfig() {
  return useContext(RuntimeConfigContext)
}

/**
 * Get basePath for URL construction
 * This can be used before the context is loaded
 */
export function getRuntimeBasePath(): string {
  // Try sessionStorage first for quick access
  const cached = sessionStorage.getItem('runtime-config')
  if (cached) {
    try {
      const config = JSON.parse(cached)
      return config.basePath || ''
    } catch {}
  }

  // Fallback to empty string
  return ''
}