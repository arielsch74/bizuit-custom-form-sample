'use client'

import { use, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { FormContainer } from '@/components/FormContainer'
import { FormLoadingState } from '@/components/FormLoadingState'
import { FormErrorBoundary } from '@/components/FormErrorBoundary'
import { loadDynamicFormCached } from '@/lib/form-loader'
import { getDashboardParameters, DashboardParameters } from '@/lib/dashboard-params'
import { validateIframeOrigin } from '@/lib/iframe-origin-validator'

interface Props {
  params: Promise<{
    formName: string
  }>
}

/**
 * Standalone Form Loader (/formsa/*)
 *
 * This loader is for standalone forms that:
 * - MUST be loaded inside an iframe (blocks direct browser access)
 * - MUST be from an allowed origin (configurable via NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS)
 * - Does NOT require Dashboard token (optional)
 * - Does NOT check NEXT_PUBLIC_ALLOW_DEV_MODE
 *
 * Use cases:
 * - Embedding forms in external applications
 * - Integration with third-party platforms
 * - Standalone form rendering in trusted contexts
 *
 * Security:
 * - Origin validation via iframe-origin-validator
 * - CSP frame-ancestors headers (configured in next.config.js)
 * - Middleware validation (optional, configured in middleware.ts)
 */
export default function StandaloneDynamicFormPage({ params }: Props) {
  const { formName } = use(params)
  const searchParams = useSearchParams()
  const [FormComponent, setFormComponent] = useState<React.ComponentType<any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formMetadata, setFormMetadata] = useState<any>(null)
  const [dashboardParams, setDashboardParams] = useState<DashboardParameters | null>(null)

  const loadForm = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get version from URL query parameter
      const versionParam = searchParams?.get('version') || null

      console.log(`[Standalone Form Page] Loading form: ${formName}${versionParam ? ` (version: ${versionParam})` : ''}`)

      // 🔒 SECURITY: Validate iframe origin (CRITICAL - always runs)
      const iframeValidation = validateIframeOrigin()

      if (!iframeValidation.isInIframe) {
        throw new Error(
          '🚫 Access Denied: Standalone forms can only be loaded inside an iframe. ' +
          'Direct browser access is not allowed.'
        )
      }

      if (!iframeValidation.isAllowedOrigin) {
        throw new Error(
          `🚫 Access Denied: ${iframeValidation.error || 'Parent origin not allowed'}. ` +
          `Contact administrator to add your domain to the allowed list.`
        )
      }

      console.log(`[Standalone Form Page] ✅ Iframe validation passed - origin: ${iframeValidation.parentOrigin}`)

      // Optional: Try to get Dashboard parameters if provided
      // (Not required for standalone forms, but if present, we'll use them)
      try {
        const validation = await getDashboardParameters()
        if (validation.valid && validation.parameters) {
          console.log('[Standalone Form Page] ✅ Dashboard token provided and validated:', validation.parameters)
          setDashboardParams(validation.parameters)
        }
      } catch (err) {
        // Dashboard params are optional for standalone loader
        console.log('[Standalone Form Page] ℹ️ No Dashboard parameters provided (optional)')
      }

      // 1. Fetch metadata from API
      const metadataResponse = await fetch(`/api/custom-forms/${formName}/metadata`)

      if (!metadataResponse.ok) {
        throw new Error(`Form "${formName}" not found`)
      }

      const metadata = await metadataResponse.json()
      setFormMetadata(metadata)

      console.log(`[Standalone Form Page] ✅ Metadata loaded:`, metadata)

      // 2. Verify form is active
      if (metadata.status !== 'active') {
        throw new Error(`Form "${formName}" is ${metadata.status}`)
      }

      // 3. Load form dynamically
      const versionToLoad = versionParam || metadata.currentVersion
      console.log(`[Standalone Form Page] Loading version: ${versionToLoad} (from ${versionParam ? 'URL param' : 'metadata'})`)

      const component = await loadDynamicFormCached(formName, {
        version: versionToLoad
      })

      setFormComponent(() => component)

      console.log(`[Standalone Form Page] ✅ Form component loaded and ready to render`)

    } catch (err: any) {
      console.error(`[Standalone Form Page] ❌ Error loading ${formName}:`, err)
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formName, searchParams])

  // Loading state
  if (loading) {
    return <FormLoadingState formName={formName} />
  }

  // Error state
  if (error || !FormComponent) {
    return (
      <FormErrorBoundary
        error={error || 'Failed to load form component'}
        formName={formName}
        onRetry={loadForm}
      />
    )
  }

  // Success - render form
  return (
    <FormContainer
      formName={formName}
      formVersion={formMetadata?.currentVersion}
    >
      {/* Render form with Dashboard parameters (if any) */}
      <FormComponent dashboardParams={dashboardParams} />
    </FormContainer>
  )
}
