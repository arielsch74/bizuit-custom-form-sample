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
    // Fetch runtime config from API
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setConfig({
          ...data,
          isLoading: false,
        })

        // Store in sessionStorage for quick access
        sessionStorage.setItem('runtime-config', JSON.stringify(data))
      })
      .catch((error) => {
        console.error('Failed to load runtime config:', error)

        // Try to use cached config
        const cached = sessionStorage.getItem('runtime-config')
        if (cached) {
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