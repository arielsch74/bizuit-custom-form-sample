'use client'

import { use, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { FormContainer } from '@/components/FormContainer'
import { FormLoadingState } from '@/components/FormLoadingState'
import { FormErrorBoundary } from '@/components/FormErrorBoundary'
import { loadDynamicFormCached } from '@/lib/form-loader'
import { getDashboardParameters, DashboardParameters, isFromDashboard } from '@/lib/dashboard-params'

interface Props {
  params: Promise<{
    formName: string
  }>
}

export default function DynamicFormPage({ params }: Props) {
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

      // Get version from URL query parameter (e.g., ?version=1.1.5)
      const versionParam = searchParams?.get('version') || null

      console.log(`[Dynamic Form Page] Loading form: ${formName}${versionParam ? ` (version: ${versionParam})` : ''}`)

      // 0. Security: Check if loaded from Dashboard with token 's'
      const fromDashboard = isFromDashboard()

      // Fetch runtime configuration (allows different deployments to have different settings without rebuild)
      // Note: We need to use window.location.origin for absolute URL because client-side fetch
      // doesn't automatically apply Next.js basePath
      const configUrl = `${window.location.origin}${window.location.pathname.split('/form/')[0]}/api/config`
      console.log('[Dynamic Form Page] 🔧 Fetching config from:', configUrl)
      const configResponse = await fetch(configUrl)
      const config = await configResponse.json()
      const allowDevMode = config.allowDevMode ?? false // Default to false if not set

      // 🔒 PRODUCTION SECURITY: Require Dashboard token
      if (!fromDashboard && !allowDevMode) {
        throw new Error(
          '🚫 Access Denied: This form must be accessed through Bizuit Dashboard. ' +
          'Direct access is not allowed in production mode.'
        )
      }

      // Validate Dashboard token if present
      if (fromDashboard) {
        console.log('[Dynamic Form Page] 🎫 Detected Dashboard parameters')

        const validation = await getDashboardParameters()

        if (!validation.valid) {
          throw new Error(`Dashboard token validation failed: ${validation.error}`)
        }

        console.log('[Dynamic Form Page] ✅ Dashboard token validated:', validation.parameters)
        setDashboardParams(validation.parameters || null)
      } else {
        console.warn(
          '[Dynamic Form Page] ⚠️ DEVELOPMENT MODE: Direct access allowed. ' +
          'This should NEVER happen in production!'
        )
      }

      // 1. Fetch metadata from API (simula consulta a BD)
      const metadataUrl = `${window.location.origin}${window.location.pathname.split('/form/')[0]}/api/custom-forms/${formName}/metadata`
      const metadataResponse = await fetch(metadataUrl)

      if (!metadataResponse.ok) {
        throw new Error(`Form "${formName}" not found`)
      }

      const metadata = await metadataResponse.json()
      setFormMetadata(metadata)

      console.log(`[Dynamic Form Page] ✅ Metadata loaded:`, metadata)

      // 2. Verificar que el form esté activo
      if (metadata.status !== 'active') {
        throw new Error(`Form "${formName}" is ${metadata.status}`)
      }

      // 3. Cargar form dinámicamente desde mock API (simula BD)
      // Use version from URL query param if provided, otherwise use currentVersion from metadata
      const versionToLoad = versionParam || metadata.currentVersion
      console.log(`[Dynamic Form Page] Loading version: ${versionToLoad} (from ${versionParam ? 'URL param' : 'metadata'})`)

      const component = await loadDynamicFormCached(formName, {
        version: versionToLoad
      })

      setFormComponent(() => component)

      console.log(`[Dynamic Form Page] ✅ Form component loaded and ready to render`)

    } catch (err: any) {
      console.error(`[Dynamic Form Page] ❌ Error loading ${formName}:`, err)
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
