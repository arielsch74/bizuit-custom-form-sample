'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BizuitCard, Button } from '@tyconsa/bizuit-ui-components'
import { formRegistry, initializeFormRegistry, FormMetadata } from '@/lib/form-registry'

export default function FormsListPage() {
  const [forms, setForms] = useState<FormMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'deprecated'>('active')

  const loadForms = async () => {
    try {
      setLoading(true)

      // Inicializar registry con forms de ejemplo
      // TODO: Usar API real cuando esté disponible
      await initializeFormRegistry({
        staticForms: [
          {
            formName: 'aprobacion-gastos',
            packageName: '@bizuit-forms/aprobacion-gastos',
            version: '1.0.0',
            processName: 'AprobacionGastos',
            description: 'Formulario de aprobación de gastos corporativos',
            author: 'Bizuit Team',
            status: 'active',
            createdAt: '2025-01-11T00:00:00.000Z',
            updatedAt: '2025-01-11T00:00:00.000Z',
          },
          {
            formName: 'solicitud-vacaciones',
            packageName: '@bizuit-forms/solicitud-vacaciones',
            version: '1.0.0',
            processName: 'SolicitudVacaciones',
            description: 'Solicitud de vacaciones y licencias',
            author: 'HR Team',
            status: 'active',
            createdAt: '2025-01-11T00:00:00.000Z',
            updatedAt: '2025-01-11T00:00:00.000Z',
          },
          {
            formName: 'onboarding-empleado',
            packageName: '@bizuit-forms/onboarding-empleado',
            version: '1.0.0',
            processName: 'OnboardingEmpleado',
            description: 'Onboarding de nuevos empleados (multi-step)',
            author: 'HR Team',
            status: 'active',
            createdAt: '2025-01-11T00:00:00.000Z',
            updatedAt: '2025-01-11T00:00:00.000Z',
          },
        ],
      })

      // Obtener forms según filtro
      let filteredForms: FormMetadata[]
      if (filter === 'active') {
        filteredForms = formRegistry.getActiveForms()
      } else if (filter === 'all') {
        filteredForms = formRegistry.getAllForms()
      } else {
        filteredForms = formRegistry.getAllForms().filter(f => f.status === filter)
      }

      setForms(filteredForms)

    } catch (error: any) {
      console.error('[Forms List] Error loading forms:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadForms()
  }, [filter])

  const getStatusColor = (status: FormMetadata['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'deprecated':
        return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Custom Forms</h1>
              <p className="text-muted-foreground mt-1">
                Browse and access all available forms
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">← Back to Home</Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {(['all', 'active', 'inactive', 'deprecated'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:bg-accent'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading forms...</p>
          </div>
        )}

        {/* Forms Grid */}
        {!loading && forms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <BizuitCard key={form.formName} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold">{form.formName}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(form.status)}`}>
                    {form.status}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {form.description}
                </p>

                <div className="space-y-2 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Process:</span>
                    <span>{form.processName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Version:</span>
                    <span className="font-mono">{form.version}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Author:</span>
                    <span>{form.author}</span>
                  </div>
                </div>

                {form.status === 'active' ? (
                  <Link href={`/form/${form.formName}`}>
                    <Button className="w-full">
                      Open Form
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full">
                    Unavailable
                  </Button>
                )}
              </BizuitCard>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && forms.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No forms found</h3>
            <p className="text-muted-foreground">
              {filter === 'all'
                ? 'No forms are available'
                : `No ${filter} forms available`}
            </p>
          </div>
        )}

        {/* Stats */}
        {!loading && forms.length > 0 && (
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground text-center">
              Showing <span className="font-semibold">{forms.length}</span> {filter} forms
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
