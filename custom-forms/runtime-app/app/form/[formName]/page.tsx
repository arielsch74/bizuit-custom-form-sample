'use client'

import { use, useEffect, useState } from 'react'
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
  const [FormComponent, setFormComponent] = useState<React.ComponentType<any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formMetadata, setFormMetadata] = useState<any>(null)
  const [dashboardParams, setDashboardParams] = useState<DashboardParameters | null>(null)

  const loadForm = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log(`[Dynamic Form Page] Loading form: ${formName}`)

      // 0. Check if loaded from Dashboard and validate token
      if (isFromDashboard()) {
        console.log('[Dynamic Form Page] 🎫 Detected Dashboard parameters')

        const validation = await getDashboardParameters()

        if (!validation.valid) {
          throw new Error(`Dashboard token validation failed: ${validation.error}`)
        }

        console.log('[Dynamic Form Page] ✅ Dashboard token validated:', validation.parameters)
        setDashboardParams(validation.parameters || null)
      } else {
        console.log('[Dynamic Form Page] ℹ️ Not loaded from Dashboard (direct access)')
      }

      // 1. Fetch metadata from API (simula consulta a BD)
      const metadataResponse = await fetch(`/api/custom-forms/${formName}/metadata`)

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
      const component = await loadDynamicFormCached(formName, {
        version: metadata.currentVersion
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
  }, [formName])

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
