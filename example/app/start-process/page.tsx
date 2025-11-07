'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BizuitSDKProvider, useBizuitSDK, BizuitAuthService, type ILoginResponse } from '@bizuit/form-sdk'
import { useBizuitAuth, useTranslation } from '@bizuit/ui-components'
import {
  BizuitCombo,
  BizuitDateTimePicker,
  BizuitFileUpload,
  BizuitSlider,
  BizuitDataGrid
} from '@bizuit/ui-components'
import { Button } from '@bizuit/ui-components'
import Link from 'next/link'
import { bizuitConfig } from '@/lib/config'
import { formDataToParameters } from '@/lib/form-utils'
import { AppToolbar } from '@/components/app-toolbar'

function StartProcessForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sdk = useBizuitSDK()
  const { t } = useTranslation()
  const { isAuthenticated, token: authToken, user, login: setAuthData } = useBizuitAuth()

  // Get URL parameters
  const urlToken = searchParams.get('token')
  const urlEventName = searchParams.get('eventName')

  const [eventName, setEventName] = useState(urlEventName || '')
  const [formData, setFormData] = useState<any>({})
  const [processData, setProcessData] = useState<any>(null)
  const [status, setStatus] = useState<'idle' | 'initializing' | 'ready' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [urlTokenProcessed, setUrlTokenProcessed] = useState(false)

  // The actual token to use: URL token takes precedence over auth context
  const activeToken = urlToken || authToken

  useEffect(() => {
    setMounted(true)
  }, [])

  // Process URL token if provided (auto-login from Bizuit BPM)
  useEffect(() => {
    if (mounted && urlToken && !urlTokenProcessed) {
      setUrlTokenProcessed(true)

      // If we have a URL token, we need to validate it and extract user info
      // For now, we'll create a mock user object
      // In production, you might want to call an endpoint to validate the token and get user info
      const mockUserFromToken: ILoginResponse = {
        Token: urlToken,
        User: {
          Username: 'bizuit-user',
          UserID: 0,
          DisplayName: 'Usuario Bizuit',
        },
        ExpirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      }

      setAuthData(mockUserFromToken)
    }
  }, [mounted, urlToken, urlTokenProcessed, setAuthData])

  // Redirect to login if not authenticated and no URL token
  // Wait a bit to allow AuthProvider to load from localStorage
  useEffect(() => {
    console.log('[StartProcess] Auth check:', { mounted, isAuthenticated, urlToken, activeToken })

    if (!mounted || urlToken) return

    // Small delay to let AuthProvider restore session from localStorage
    const timer = setTimeout(() => {
      console.log('[StartProcess] After delay - isAuthenticated:', isAuthenticated)
      if (!isAuthenticated) {
        const params = new URLSearchParams()
        const returnUrl = `/start-process${urlEventName ? `?eventName=${encodeURIComponent(urlEventName)}` : ''}`
        params.set('redirect', returnUrl)
        console.log('[StartProcess] Redirecting to login:', `/login?${params.toString()}`)
        router.push(`/login?${params.toString()}`)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [mounted, isAuthenticated, urlToken, router, urlEventName, activeToken])

  // Auto-set status to ready if we have eventName from URL
  useEffect(() => {
    if (mounted && activeToken && urlEventName && status === 'idle') {
      setStatus('ready')
    }
  }, [mounted, activeToken, urlEventName, status])

  // Opciones de ejemplo para el combo
  const priorityOptions = [
    { value: 'low', label: 'Baja', group: 'Prioridad' },
    { value: 'medium', label: 'Media', group: 'Prioridad' },
    { value: 'high', label: 'Alta', group: 'Prioridad' },
    { value: 'urgent', label: 'Urgente', group: 'Prioridad' },
  ]

  const categoryOptions = [
    { value: 'sales', label: 'Ventas', group: 'Categoría' },
    { value: 'support', label: 'Soporte', group: 'Categoría' },
    { value: 'development', label: 'Desarrollo', group: 'Categoría' },
    { value: 'hr', label: 'Recursos Humanos', group: 'Categoría' },
  ]

  // Columnas de ejemplo para el DataGrid
  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      accessorKey: 'value',
      header: 'Valor',
    },
  ]

  const [gridData] = useState([
    { id: 1, name: 'Item 1', value: 100 },
    { id: 2, name: 'Item 2', value: 200 },
    { id: 3, name: 'Item 3', value: 300 },
  ])

  const handleStartProcess = () => {
    if (!activeToken) {
      const redirectUrl = `/login?redirect=/start-process${eventName ? `?eventName=${encodeURIComponent(eventName)}` : ''}`
      router.push(redirectUrl)
      return
    }

    if (!eventName) {
      setError('El nombre del evento es requerido')
      return
    }

    // Simply set status to ready to show the form
    setStatus('ready')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!activeToken) {
      const redirectUrl = `/login?redirect=/start-process${eventName ? `?eventName=${encodeURIComponent(eventName)}` : ''}`
      router.push(redirectUrl)
      return
    }

    try {
      setStatus('submitting')
      setError(null)

      // Execute RaiseEvent to create process instance
      const result = await sdk.process.raiseEvent(
        {
          eventName: eventName,
          parameters: formDataToParameters(formData),
        },
        formData.files || [], // Pass the files from formData
        activeToken // Pass the authentication token
      )

      console.log('Proceso iniciado:', result)
      setStatus('success')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar proceso')
      setStatus('error')
    }
  }

  if (!mounted || (!isAuthenticated && !urlToken)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('login.redirecting')}</p>
        </div>
      </div>
    )
  }

  if (status === 'idle' || status === 'initializing') {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <AppToolbar />

        <div className="mb-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            {t('nav.backToHome')}
          </Link>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h1 className="text-3xl font-bold mb-6">{t('startProcess.title')}</h1>

          {user && (
            <div className="mb-4 p-3 bg-muted/50 rounded-md">
              <p className="text-sm">
                <strong>{t('login.username')}:</strong> {user.DisplayName || user.Username}
              </p>
            </div>
          )}

          {urlToken && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>✓ Token recibido desde URL</strong> (Modo Bizuit BPM)
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('startProcess.processId')} / Nombre del Evento
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Ej: NombreDelEvento"
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                disabled={status === 'initializing' || !!urlEventName}
              />
              {urlEventName && (
                <p className="text-xs text-muted-foreground mt-1">
                  Nombre del evento recibido desde URL
                </p>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              onClick={handleStartProcess}
              disabled={!eventName}
              className="w-full"
            >
              {t('startProcess.authenticate')}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>{t('startProcess.note')}</strong> {t('startProcess.note.description')}
            </p>
            {!urlToken && !urlEventName && (
              <p className="text-sm text-muted-foreground mt-2">
                <strong>URL de ejemplo:</strong> <code className="text-xs bg-background px-1 py-0.5 rounded">
                  /start-process?token=TU_TOKEN&eventName=NombreDelEvento
                </code>
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (status === 'ready') {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <AppToolbar />

        <div className="mb-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            {t('nav.backToHome')}
          </Link>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Formulario de Proceso</h1>
            {user && (
              <div className="text-sm text-muted-foreground">
                Usuario: <span className="font-medium">{user.DisplayName || user.Username}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Combo Simple */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Prioridad
              </label>
              <BizuitCombo
                options={priorityOptions}
                value={formData.priority}
                onChange={(value) => setFormData({ ...formData, priority: value })}
                placeholder="Seleccione una prioridad"
                searchable
              />
            </div>

            {/* Combo Múltiple */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Categorías
              </label>
              <BizuitCombo
                options={categoryOptions}
                value={formData.categories}
                onChange={(value) => setFormData({ ...formData, categories: value })}
                placeholder="Seleccione categorías"
                multiSelect
                searchable
              />
            </div>

            {/* Date Time Picker */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Fecha de Inicio
              </label>
              <BizuitDateTimePicker
                value={formData.startDate}
                onChange={(value) => setFormData({ ...formData, startDate: value })}
                mode="datetime"
                locale="es"
              />
            </div>

            {/* Slider */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Presupuesto (en miles)
              </label>
              <BizuitSlider
                value={formData.budget || 50}
                onChange={(value) => setFormData({ ...formData, budget: value })}
                min={0}
                max={100}
                step={5}
                showTooltip
                marks={[
                  { value: 0, label: '0' },
                  { value: 50, label: '50K' },
                  { value: 100, label: '100K' },
                ]}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Documentos Adjuntos
              </label>
              <BizuitFileUpload
                value={formData.files}
                onChange={(files) => setFormData({ ...formData, files })}
                multiple
                maxSize={5 * 1024 * 1024} // 5MB
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />
            </div>

            {/* Data Grid */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Datos del Proceso
              </label>
              <BizuitDataGrid
                columns={columns}
                data={gridData}
                selectable="multiple"
                sortable
                filterable
                paginated
                onSelectionChange={(selected) =>
                  setFormData({ ...formData, selectedItems: selected })
                }
              />
            </div>

            {/* Campo de texto simple */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ingrese una descripción del proceso"
                rows={4}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={status !== 'ready'}
                className="flex-1"
              >
                {status !== 'ready' ? 'Iniciando Proceso...' : 'Iniciar Proceso'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStatus('idle')}
              >
                Cancelar
              </Button>
            </div>
          </form>

          {processData && (
            <div className="mt-6 p-4 bg-muted rounded-md">
              <p className="text-sm font-medium mb-2">Datos del Proceso Inicializado:</p>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(processData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <AppToolbar />

        <div className="border rounded-lg p-6 bg-card text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Proceso Iniciado Exitosamente</h2>
          <p className="text-muted-foreground mb-6">
            El proceso ha sido creado correctamente en el BPMS Bizuit
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setStatus('idle')}>
              Iniciar Otro Proceso
            </Button>
            <Link href="/">
              <Button variant="outline">
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function StartProcessPage() {
  return (
    <BizuitSDKProvider config={bizuitConfig}>
      <StartProcessForm />
    </BizuitSDKProvider>
  )
}
