'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  BizuitSDKProvider,
  useBizuitSDK,
  BizuitAuthService,
  type ILoginResponse,
  formDataToParameters,
  filterFormParameters,
  isParameterRequired,
  type IBizuitProcessParameter
} from '@tyconsa/bizuit-form-sdk'
import { useBizuitAuth, useTranslation } from '@tyconsa/bizuit-ui-components'
import { useAuthErrorHandler } from '@/hooks/use-auth-error-handler'
import { useBizuitSDKWithAuth } from '@/hooks/use-bizuit-sdk-with-auth'
import {
  BizuitCombo,
  BizuitDateTimePicker,
  BizuitFileUpload,
  BizuitSlider,
  BizuitDataGrid
} from '@tyconsa/bizuit-ui-components'
import { Button } from '@tyconsa/bizuit-ui-components'
import Link from 'next/link'
import { bizuitConfig } from '@/lib/config'

function StartProcessForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sdk = useBizuitSDKWithAuth() // Ahora con manejo automático de 401
  const { t } = useTranslation()
  const { isAuthenticated, token: authToken, user, login: setAuthData } = useBizuitAuth()
  const handleAuthError = useAuthErrorHandler()

  // Get URL parameters
  const urlToken = searchParams.get('token')
  const urlEventName = searchParams.get('eventName')

  const [eventName, setEventName] = useState(urlEventName || '')
  const [formData, setFormData] = useState<any>({})
  const [processData, setProcessData] = useState<any>(null)
  const [processParameters, setProcessParameters] = useState<IBizuitProcessParameter[]>([])
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

  const handleStartProcess = async () => {
    if (!activeToken) {
      const redirectUrl = `/login?redirect=/start-process${eventName ? `?eventName=${encodeURIComponent(eventName)}` : ''}`
      router.push(redirectUrl)
      return
    }

    if (!eventName) {
      setError('El nombre del evento es requerido')
      return
    }

    try {
      setStatus('initializing')
      setError(null)

      console.log('[StartProcess] Fetching process parameters for:', eventName)

      // Fetch process parameters from API
      const allParameters = await sdk.process.getProcessParameters(eventName, '', activeToken)

      console.log('[StartProcess] All parameters received:', allParameters)

      // Check if we got a valid response
      if (!Array.isArray(allParameters)) {
        throw new Error('La respuesta del API no es un array de parámetros')
      }

      // Filter to show only input and optional parameters (not output or variables)
      const formParameters = filterFormParameters(allParameters)

      console.log('[StartProcess] Filtered form parameters:', formParameters)

      setProcessParameters(formParameters)
      setStatus('ready')
    } catch (err: any) {
      console.error('[StartProcess] Error fetching parameters:', err)

      // Note: 401 errors are handled automatically by useBizuitSDKWithAuth()
      // which will logout and redirect to login

      let errorMessage = 'Error al obtener los parámetros del proceso'

      if (err.message) {
        errorMessage = err.message
      }

      // Check if it's a 404 error
      if (err.status === 404 || (err.message && err.message.includes('404'))) {
        errorMessage = `El proceso "${eventName}" no existe o no tiene parámetros definidos. Verifique el nombre del proceso.`
      }

      setError(errorMessage)
      setStatus('error')
    }
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

      // Parámetros del formulario
      const visibleParameters = formDataToParameters(formData)

      // Parámetros ocultos/calculados
      const hiddenParameters = formDataToParameters({
        initiatedBy: activeToken ? 'authenticated-user' : 'anonymous',
        initiatedAt: new Date().toISOString(),
        initiatedFrom: 'start-process-page',
        browserInfo: navigator.userAgent.substring(0, 100),
        formVersion: '1.0.0',
      })

      // Combinar parámetros
      const allParameters = [...visibleParameters, ...hiddenParameters]

      console.log('Parámetros a enviar:', {
        visible: visibleParameters.length,
        hidden: hiddenParameters.length,
        total: allParameters.length
      })

      // Execute RaiseEvent to create process instance
      const result = await sdk.process.raiseEvent(
        {
          eventName: eventName,
          parameters: allParameters,
        },
        formData.files || [], // Pass the files from formData
        activeToken // Pass the authentication token
      )

      console.log('Proceso iniciado:', result)

      // Store the process result (includes instanceId, status, tyconParameters)
      setProcessData(result)
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
        <div className="mb-6">
          <Link href="/" className="text-sm text-primary hover:underline">
            ← Volver al inicio
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

  // Helper function to render form fields based on parameter type
  const renderFormField = (param: IBizuitProcessParameter) => {
    const isRequired = isParameterRequired(param)
    const label = `${param.name}${isRequired ? ' *' : ' (opcional)'}`

    // Determine field type based on parameter metadata
    const paramType = param.type.toLowerCase()

    // String types
    if (paramType === 'string' || paramType === 'text') {
      return (
        <div key={param.name}>
          <label className="block text-sm font-medium mb-2">
            {label}
          </label>
          <input
            type="text"
            value={formData[param.name] || ''}
            onChange={(e) => setFormData({ ...formData, [param.name]: e.target.value })}
            placeholder={`Ingrese ${param.name}`}
            required={isRequired}
            className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
          />
        </div>
      )
    }

    // Numeric types
    if (paramType === 'int' || paramType === 'integer' || paramType === 'number' || paramType === 'decimal' || paramType === 'double') {
      return (
        <div key={param.name}>
          <label className="block text-sm font-medium mb-2">
            {label}
          </label>
          <input
            type="number"
            value={formData[param.name] || ''}
            onChange={(e) => setFormData({ ...formData, [param.name]: e.target.value })}
            placeholder={`Ingrese ${param.name}`}
            required={isRequired}
            className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
          />
        </div>
      )
    }

    // Boolean types
    if (paramType === 'bool' || paramType === 'boolean') {
      return (
        <div key={param.name} className="flex items-center gap-3">
          <input
            type="checkbox"
            id={param.name}
            checked={formData[param.name] || false}
            onChange={(e) => setFormData({ ...formData, [param.name]: e.target.checked })}
            className="w-4 h-4 border rounded"
          />
          <label htmlFor={param.name} className="text-sm font-medium">
            {label}
          </label>
        </div>
      )
    }

    // Date/DateTime types
    if (paramType === 'date' || paramType === 'datetime' || paramType === 'timestamp') {
      return (
        <div key={param.name}>
          <label className="block text-sm font-medium mb-2">
            {label}
          </label>
          <BizuitDateTimePicker
            value={formData[param.name]}
            onChange={(value) => setFormData({ ...formData, [param.name]: value })}
            mode={paramType === 'date' ? 'date' : 'datetime'}
            locale="es"
          />
        </div>
      )
    }

    // Default to text input for unknown types
    return (
      <div key={param.name}>
        <label className="block text-sm font-medium mb-2">
          {label}
          <span className="text-xs text-muted-foreground ml-2">({param.type})</span>
        </label>
        <input
          type="text"
          value={formData[param.name] || ''}
          onChange={(e) => setFormData({ ...formData, [param.name]: e.target.value })}
          placeholder={`Ingrese ${param.name}`}
          required={isRequired}
          className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
        />
      </div>
    )
  }

  if (status === 'ready') {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/" className="text-sm text-primary hover:underline">
            ← Volver al inicio
          </Link>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Formulario de Proceso: {eventName}</h1>
            {user && (
              <div className="text-sm text-muted-foreground">
                Usuario: <span className="font-medium">{user.DisplayName || user.Username}</span>
              </div>
            )}
          </div>

          {processParameters.length > 0 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Render dynamic form fields based on process parameters */}
              {processParameters.map((param) => renderFormField(param))}

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
                  onClick={() => {
                    setStatus('idle')
                    setProcessParameters([])
                    setFormData({})
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No se encontraron parámetros de entrada para este proceso.
              </p>
              <Button
                onClick={() => {
                  setStatus('idle')
                  setProcessParameters([])
                }}
                className="mt-4"
              >
                Volver
              </Button>
            </div>
          )}

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

          {processData && (
            <div className="mb-6 p-4 bg-muted rounded-md text-left">
              <p className="text-sm font-medium mb-2">Información del Proceso:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Instance ID:</span>
                  <span className="font-mono text-xs">{processData.instanceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold">{processData.status}</span>
                </div>
                {processData.tyconParameters && (
                  <div className="mt-3">
                    <p className="text-muted-foreground mb-1">Parámetros de Retorno:</p>
                    <pre className="text-xs bg-background p-2 rounded overflow-auto">
                      {JSON.stringify(processData.tyconParameters, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Button onClick={() => {
              setStatus('idle')
              setProcessData(null)
              setFormData({})
              setProcessParameters([])
            }}>
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
