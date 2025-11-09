'use client'

import { BizuitThemeProvider, BizuitAuthProvider } from "@tyconsa/bizuit-ui-components"
import { BizuitSDKProvider } from "@tyconsa/bizuit-form-sdk"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const formsApiUrl = process.env.NEXT_PUBLIC_BIZUIT_FORMS_API_URL || '/api/bizuit'
  const dashboardApiUrl = process.env.NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL || '/api/bizuit'

  console.log('[Providers] Environment variables:', {
    FORMS_API: process.env.NEXT_PUBLIC_BIZUIT_FORMS_API_URL,
    DASHBOARD_API: process.env.NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL,
    formsApiUrl,
    dashboardApiUrl
  })

  return (
    <BizuitSDKProvider
      config={{
        formsApiUrl,
        dashboardApiUrl,
      }}
    >
      <BizuitThemeProvider
        defaultTheme="system"
        defaultColorTheme="blue"
        defaultLanguage="es"
      >
        <BizuitAuthProvider>
          {children}
        </BizuitAuthProvider>
      </BizuitThemeProvider>
    </BizuitSDKProvider>
  )
}
