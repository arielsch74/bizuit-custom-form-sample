'use client'

import { BizuitThemeProvider, BizuitAuthProvider } from "@tyconsa/bizuit-ui-components"
import { BizuitSDKProvider } from "@tyconsa/bizuit-form-sdk"

export function Providers({ children }: { children: React.ReactNode }) {
  // Get basePath from environment (e.g., /BIZUITCustomForms in production)
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

  // SDK v2.0.0+: Build full URL with basePath (single URL for all endpoints)
  const baseApiUrl = process.env.NEXT_PUBLIC_BIZUIT_API_URL || '/api/bizuit'
  const apiUrl = basePath + baseApiUrl

  return (
    <BizuitSDKProvider
      config={{
        apiUrl,
      }}
    >
      <BizuitThemeProvider
        defaultTheme="light"
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
