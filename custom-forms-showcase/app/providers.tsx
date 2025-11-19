'use client'

import { BizuitThemeProvider, BizuitAuthProvider } from "@tyconsa/bizuit-ui-components"
import { BizuitSDKProvider } from "@tyconsa/bizuit-form-sdk"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Get basePath from environment (e.g., /BIZUITCustomForms in production)
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

  // SDK v2.0.0+: Build full URL with basePath (single URL for all endpoints)
  const baseApiUrl = process.env.NEXT_PUBLIC_BIZUIT_API_URL || '/api/bizuit'
  const apiUrl = basePath + baseApiUrl

  console.log('[Providers] Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
    basePath,
    BIZUIT_API_URL: process.env.NEXT_PUBLIC_BIZUIT_API_URL,
    apiUrl
  })

  return (
    <BizuitSDKProvider
      config={{
        apiUrl,
      }}
    >
      <BizuitThemeProvider
        defaultTheme="system"
        defaultColorTheme="orange"
        defaultLanguage="es"
      >
        <BizuitAuthProvider>
          {children}
        </BizuitAuthProvider>
      </BizuitThemeProvider>
    </BizuitSDKProvider>
  )
}
