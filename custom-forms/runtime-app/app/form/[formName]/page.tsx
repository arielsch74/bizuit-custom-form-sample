'use client'

import { use, useEffect, useState } from 'react'
import { FormContainer } from '@/components/FormContainer'
import { FormLoadingState } from '@/components/FormLoadingState'
import { FormErrorBoundary } from '@/components/FormErrorBoundary'
import { loadDynamicFormCached, invalidateFormCache } from '@/lib/form-loader'
import { useFormHotReload } from '@/hooks/useFormHotReload'
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

  // Hot reload: detectar nuevas versiones y recargar automáticamente
  const { hasUpdate, latestVersion } = useFormHotReload({
    formName,
    currentVersion: formMetadata?.currentVersion || '0.0.0',
    pollingInterval: 10000, // 10 segundos
    enabled: !!formMetadata, // Solo activar después de cargar metadata inicial
    onVersionChange: (newVersion) => {
      console.log(`[Hot Reload] 🔥 Nueva versión detectada: ${formMetadata?.currentVersion} → ${newVersion}`)
      console.log('[Hot Reload] Invalidando cache y recargando form...')

      // Invalidar cache
      invalidateFormCache(formName)

      // Recargar form con nueva versión
      loadForm()
    }
  })

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
      {hasUpdate && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 9999,
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          🔥 Nueva versión cargada: {latestVersion}
        </div>
      )}

      {/* Render form with Dashboard parameters (if any) */}
      <FormComponent dashboardParams={dashboardParams} />
    </FormContainer>
  )
}
