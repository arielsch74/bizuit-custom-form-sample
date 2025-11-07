'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  BizuitSDKProvider,
  useBizuitSDK,
  type ILoginResponse,
  formDataToParameters,
  parametersToFormData,
  isParameterRequired,
  filterContinueParameters,
  loadInstanceDataForContinue,
  type IBizuitProcessParameter
} from '@bizuit/form-sdk'
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
import { AppToolbar } from '@/components/app-toolbar'

function ContinueProcessForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sdk = useBizuitSDK()
  const { t } = useTranslation()
  const { isAuthenticated, token: authToken, user, login: setAuthData } = useBizuitAuth()

  // Get URL parameters
  const urlToken = searchParams.get('token')
  const urlInstanceId = searchParams.get('instanceId')

  const [instanceId, setInstanceId] = useState(urlInstanceId || '')
  const [eventName, setEventName] = useState('')
  const [processName, setProcessName] = useState('')
  const [formData, setFormData] = useState<any>({})
  const [processData, setProcessData] = useState<any>(null)
  const [processParameters, setProcessParameters] = useState<IBizuitProcessParameter[]>([])
  const [lockStatus, setLockStatus] = useState<'unlocked' | 'locked-by-me' | 'locked-by-other' | 'checking'>('unlocked')
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'initializing' | 'ready' | 'submitting' | 'success' | 'error'>('idle')
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

      const mockUserFromToken: ILoginResponse = {
        Token: urlToken,
        User: {
          Username: 'bizuit-user',
          UserID: 0,
          DisplayName: 'Usuario Bizuit',
        },
        ExpirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }

      setAuthData(mockUserFromToken)
    }
  }, [mounted, urlToken, urlTokenProcessed, setAuthData])

  // Redirect to login if not authenticated and no URL token
  // Wait a bit to allow AuthProvider to load from localStorage
  useEffect(() => {
    if (!mounted || urlToken) return

    // Small delay to let AuthProvider restore session from localStorage
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        const params = new URLSearchParams()
        const returnUrl = `/continue-process${urlInstanceId ? `?instanceId=${encodeURIComponent(urlInstanceId)}` : ''}`
        params.set('redirect', returnUrl)
        router.push(`/login?${params.toString()}`)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [mounted, isAuthenticated, urlToken, router, urlInstanceId])

  // Auto-load instance data if we have instanceId from URL
  useEffect(() => {
    if (mounted && activeToken && urlInstanceId && status === 'idle') {
      loadInstanceData()
    }
  }, [mounted, activeToken, urlInstanceId, status])

  /**
   * Render form field based on parameter type
   * Same as start-process but now includes variables
   */
  const renderFormField = (param: IBizuitProcessParameter) => {
    const isRequired = !param.isVariable && isParameterRequired(param)
    const label = `${param.name}${isRequired ? ' *' : param.isVariable ? ' (variable)' : ' (opcional)'}`

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

  // Opciones de ejemplo
  const statusOptions = [
    { value: 'pending', label: 'Pendiente', group: 'Estado' },
    { value: 'in-progress', label: 'En Progreso', group: 'Estado' },
    { value: 'completed', label: 'Completado', group: 'Estado' },
    { value: 'cancelled', label: 'Cancelado', group: 'Estado' },
  ]

  const assigneeOptions = [
    { value: 'user1', label: 'Juan Pérez', group: 'Asignado a' },
    { value: 'user2', label: 'María García', group: 'Asignado a' },
    { value: 'user3', label: 'Carlos López', group: 'Asignado a' },
  ]

  // Columnas para actividades completadas (solo lectura)
  const activityColumns = [
    {
      accessorKey: 'activityName',
      header: 'Actividad',
    },
    {
      accessorKey: 'completedBy',
      header: 'Completado Por',
    },
    {
      accessorKey: 'completedAt',
      header: 'Fecha',
    },
    {
      accessorKey: 'result',
      header: 'Resultado',
    },
  ]

  const [activityData] = useState([
    { activityName: 'Inicio', completedBy: 'Sistema', completedAt: '2024-01-15 10:00', result: 'OK' },
    { activityName: 'Validación', completedBy: 'Juan Pérez', completedAt: '2024-01-15 11:30', result: 'Aprobado' },
    { activityName: 'Revisión', completedBy: 'María García', completedAt: '2024-01-15 14:00', result: 'Aprobado' },
  ])

  const loadInstanceData = async () => {
    if (!activeToken) {
      const redirectUrl = `/login?redirect=/continue-process${instanceId ? `?instanceId=${encodeURIComponent(instanceId)}` : ''}`
      router.push(redirectUrl)
      return
    }

    if (!instanceId) {
      setError('El ID de instancia es requerido')
      return
    }

    try {
      setStatus('loading')
      setError(null)

      console.log('[ContinueProcess] Loading instance data for:', instanceId)

      // Use SDK helper to load all data
      const result = await loadInstanceDataForContinue(sdk, instanceId, activeToken)

      console.log('[ContinueProcess] Result:', result)

      // Update all state from helper result
      setProcessData(result.instanceData)
      setProcessName(result.processName)
      setEventName(result.eventName)
      setProcessParameters(result.formParameters)
      setFormData(result.formData)

      setStatus('ready')
    } catch (err: any) {
      console.error('[ContinueProcess] Error loading instance data:', err)
      setError(err.message || 'Error al cargar los datos de la instancia')
      setStatus('error')
    }
  }

  const handleAuthenticateAndLock = async () => {
    if (!activeToken) {
      const redirectUrl = `/login?redirect=/continue-process${instanceId ? `?instanceId=${encodeURIComponent(instanceId)}` : ''}`
      router.push(redirectUrl)
      return
    }

    if (!instanceId) {
      setError('El ID de instancia es requerido')
      return
    }

    try {
      setStatus('initializing')
      setError(null)

      // Lock instance with pessimistic locking
      const result = await sdk.process.acquireLock({
        instanceId,
        token: activeToken
      })

      setSessionToken(result.sessionToken)
      setProcessData(result.processData)
      setLockStatus('locked-by-me')
      setStatus('ready')
    } catch (err: any) {
      setError(err.message || 'Error al bloquear la instancia')
      setStatus('error')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!activeToken) {
      const redirectUrl = `/login?redirect=/continue-process${instanceId ? `?instanceId=${encodeURIComponent(instanceId)}` : ''}`
      router.push(redirectUrl)
      return
    }

    // Validate we have an event name
    if (!eventName) {
      setError('No se pudo determinar el nombre del evento. Por favor recargue los datos de la instancia.')
      return
    }

    try {
      setStatus('submitting')
      setError(null)

      console.log('[ContinueProcess] Submitting with:', {
        instanceId,
        eventName,
        parametersCount: formDataToParameters(formData).length
      })

      // Submit changes using the event name from instance data
      const result = await sdk.process.continueInstance(
        {
          instanceId,
          eventName, // Use dynamic event name from instance data
          parameters: formDataToParameters(formData),
        },
        formData.files || [], // Pass the files from formData
        activeToken // Pass the authentication token
      )

      console.log('[ContinueProcess] Result:', result)

      // Store the result
      setProcessData(result)
      setLockStatus('unlocked')
      setStatus('success')
    } catch (err: any) {
      console.error('[ContinueProcess] Error:', err)
      setError(err.message || 'Error al actualizar la instancia')
      setStatus('error')
    }
  }

  const handleCancel = async () => {
    if (sessionToken) {
      try {
        // Release lock without submitting
        await sdk.process.releaseLock({
          instanceId,
          sessionToken
        })
        setLockStatus('unlocked')
        setSessionToken(null)
        setStatus('idle')
      } catch (err: any) {
        console.error('Error al liberar bloqueo:', err)
      }
    } else {
      setStatus('idle')
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

  if (status === 'idle' || status === 'loading' || status === 'initializing') {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <AppToolbar />

        <div className="mb-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            {t('nav.backToHome')}
          </Link>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h1 className="text-3xl font-bold mb-6">{t('continueProcess.title')}</h1>

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

          {status === 'loading' && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>⏳ Cargando datos de la instancia...</strong>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('continueProcess.instanceId')}
              </label>
              <input
                type="text"
                value={instanceId}
                onChange={(e) => setInstanceId(e.target.value)}
                placeholder={t('continueProcess.instanceId.placeholder')}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                disabled={status === 'loading' || status === 'initializing' || !!urlInstanceId}
              />
              {urlInstanceId && (
                <p className="text-xs text-muted-foreground mt-1">
                  ID de instancia recibido desde URL
                </p>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {status === 'idle' && (
              <Button
                onClick={loadInstanceData}
                disabled={!instanceId}
                className="w-full"
              >
                Cargar Datos de Instancia
              </Button>
            )}

            {(status === 'loading' || status === 'initializing') && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-md space-y-2">
            <p className="text-sm font-medium">{t('continueProcess.pessimisticLocking')}</p>
            <p className="text-sm text-muted-foreground">
              {t('continueProcess.pessimisticLocking.description')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('continueProcess.pessimisticLocking.release')}
            </p>
            {!urlToken && !urlInstanceId && (
              <p className="text-sm text-muted-foreground mt-3">
                <strong>URL de ejemplo:</strong> <code className="text-xs bg-background px-1 py-0.5 rounded">
                  /continue-process?token=TU_TOKEN&instanceId=INSTANCE_ID
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
            <h1 className="text-3xl font-bold">Continuar Proceso</h1>
            <div className="flex items-center gap-4">
              {lockStatus === 'locked-by-me' && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Bloqueado por ti</span>
                </div>
              )}
              {user && (
                <div className="text-sm text-muted-foreground">
                  Usuario: <span className="font-medium">{user.DisplayName || user.Username}</span>
                </div>
              )}
            </div>
          </div>

          {/* Process Info */}
          <div className="mb-6 p-4 bg-muted/50 rounded-md">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Instance ID:</span>
                <p className="font-mono text-xs mt-1">{instanceId}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Process Name:</span>
                <p className="font-semibold mt-1">{processName || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Event Name:</span>
                <p className="font-semibold mt-1">{eventName || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Parameters:</span>
                <p className="font-semibold mt-1">{processParameters.length} campos</p>
              </div>
            </div>
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
                  {status !== 'ready' ? 'Guardando Cambios...' : 'Guardar y Continuar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStatus('idle')
                    setInstanceId('')
                    setProcessName('')
                    setEventName('')
                    setProcessParameters([])
                    setFormData({})
                    setProcessData(null)
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No se encontraron parámetros editables para este proceso.
              </p>
              <Button
                onClick={() => {
                  setStatus('idle')
                  setInstanceId('')
                  setProcessName('')
                  setEventName('')
                  setProcessParameters([])
                  setFormData({})
                  setProcessData(null)
                }}
                className="mt-4"
              >
                Volver
              </Button>
            </div>
          )}

          {processData && (
            <div className="mt-6 p-4 bg-muted rounded-md">
              <p className="text-sm font-medium mb-2">Datos de la Instancia:</p>
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
          <h2 className="text-2xl font-bold mb-2">Instancia Actualizada Exitosamente</h2>
          <p className="text-muted-foreground mb-6">
            Los cambios han sido guardados y el bloqueo ha sido liberado
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setStatus('idle')}>
              Continuar Otra Instancia
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

export default function ContinueProcessPage() {
  return (
    <BizuitSDKProvider config={bizuitConfig}>
      <ContinueProcessForm />
    </BizuitSDKProvider>
  )
}
