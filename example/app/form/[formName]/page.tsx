'use client'

import { use, useEffect, useState } from 'react'
import { FormContainer } from '@/components/FormContainer'
import { FormLoadingState } from '@/components/FormLoadingState'
import { FormErrorBoundary } from '@/components/FormErrorBoundary'
import { loadDynamicFormCached } from '@/lib/form-loader'
import { formRegistry, initializeFormRegistry } from '@/lib/form-registry'

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

  const loadForm = async () => {
    try {
      setLoading(true)
      setError(null)

      // Inicializar registry si es necesario
      await initializeFormRegistry({
        // TODO: En producción, usar API real del backend
        // apiUrl: process.env.NEXT_PUBLIC_CUSTOM_FORMS_API_URL,
        // Por ahora usamos forms estáticos de ejemplo
        staticForms: [
          {
            formName: 'aprobacion-gastos',
            packageName: '@tyconsa/bizuit-form-aprobacion-gastos',
            version: '1.0.0',
            processName: 'AprobacionGastos',
            description: 'Formulario de aprobación de gastos',
            author: 'Bizuit Team',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          // Agregar más forms aquí cuando estén disponibles
        ],
      })

      // Buscar metadata del form
      const formMetadata = formRegistry.getForm(formName)

      if (!formMetadata) {
        throw new Error(`Form "${formName}" not found in registry`)
      }

      if (formMetadata.status !== 'active') {
        throw new Error(`Form "${formName}" is ${formMetadata.status}`)
      }

      console.log(`[Dynamic Form] Loading ${formName}`, formMetadata)

      // Cargar form dinámicamente desde CDN
      const component = await loadDynamicFormCached(
        formMetadata.packageName,
        formMetadata.version
      )

      setFormComponent(() => component)

    } catch (err: any) {
      console.error(`[Dynamic Form] Error loading ${formName}:`, err)
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
  const formMetadata = formRegistry.getForm(formName)

  return (
    <FormContainer
      formName={formName}
      formVersion={formMetadata?.version}
    >
      <FormComponent />
    </FormContainer>
  )
}
