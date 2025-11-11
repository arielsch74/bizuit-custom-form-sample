'use client'

import { BizuitThemeProvider, BizuitAuthProvider } from "@tyconsa/bizuit-ui-components"
import { BizuitSDKProvider } from "@tyconsa/bizuit-form-sdk"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Get base path from Next.js config (only in production)
  const basePath = process.env.NODE_ENV === 'production' ? '/BIZUITCustomForms' : ''

  // Build full URLs with basePath for production
  const baseFormsUrl = process.env.NEXT_PUBLIC_BIZUIT_FORMS_API_URL || '/api/bizuit'
  const baseDashboardUrl = process.env.NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL || '/api/bizuit'

  const formsApiUrl = basePath + baseFormsUrl
  const dashboardApiUrl = basePath + baseDashboardUrl

  console.log('[Providers] Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    basePath,
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
