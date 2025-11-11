'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  BizuitSDKProvider,
  formDataToParameters,
  loadInstanceDataForContinue,
  type IBizuitProcessParameter,
  parseBizuitUrlParam,
  createAuthFromUrlToken,
  formatBizuitError
} from '@tyconsa/bizuit-form-sdk'
import { useBizuitAuth, useTranslation, DynamicFormField, Button } from '@tyconsa/bizuit-ui-components'
import { useBizuitSDKWithAuth } from '@/hooks/use-bizuit-sdk-with-auth'
import Link from 'next/link'
import { bizuitConfig } from '@/lib/config'

function ContinueProcessForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get URL parameters using SDK utility (handles &amp; encoding from Bizuit BPM)
  const urlToken = parseBizuitUrlParam('token', searchParams)
  const urlInstanceId = parseBizuitUrlParam('instanceId', searchParams)
  const urlEventName = parseBizuitUrlParam('eventName', searchParams)
  const urlProcessName = parseBizuitUrlParam('processName', searchParams)
  const urlUserName = parseBizuitUrlParam('UserName', searchParams)
  const sdk = useBizuitSDKWithAuth() // ✅ Ahora con manejo automático de 401
  const { t } = useTranslation()
  const { isAuthenticated, token: authToken, user, login: setAuthData } = useBizuitAuth()
  const [instanceId, setInstanceId] = useState(urlInstanceId || '')
  const [eventName, setEventName] = useState('')
  const [processName, setProcessName] = useState('')
  const [formData, setFormData] = useState<any>({})
  const [processData, setProcessData] = useState<any>(null)
  const [processParameters, setProcessParameters] = useState<IBizuitProcessParameter[]>([])
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

      // Use SDK utility to create auth data from URL token
      const authData = createAuthFromUrlToken(urlToken, urlUserName, 1440)

      setAuthData(authData)
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

    if (!eventName) {
      setError('El nombre del evento es requerido')
      return
    }

    try {
      setStatus('loading')
      setError(null)

      if (process.env.NODE_ENV === 'development') {
        console.log('[ContinueProcess] Loading instance data for:', { instanceId, eventName })
      }

      // Use SDK helper to load all data
      // The helper will get instance data and extract parameters automatically
      const result = await loadInstanceDataForContinue(sdk, instanceId, activeToken)

      if (process.env.NODE_ENV === 'development') {
        console.log('[ContinueProcess] Result:', result)
      }

      // Update all state from helper result
      setProcessData(result.instanceData)
      setProcessParameters(result.formParameters)
      setFormData(result.formData)

      // processName is not returned by API, but we don't need it for continue
      setProcessName(result.processName || 'N/A')

      setStatus('ready')
    } catch (err: any) {
      // Note: 401 errors are handled automatically by useBizuitSDKWithAuth()
      // which will logout and redirect to login

      // Only log detailed errors in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.warn('[ContinueProcess] Error loading instance data:', err)
      }

      const friendlyMessage = formatBizuitError(err, 'load')
      setError(friendlyMessage)
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

      // Only send parameters that are in formParameters (excludes metadata like initiatedBy, LoggedUser, etc.)
      // Create a filtered formData with only the editable parameters
      const filteredFormData: Record<string, any> = {}
      processParameters.forEach(param => {
        if (formData[param.name] !== undefined) {
          filteredFormData[param.name] = formData[param.name]
        }
      })

      if (process.env.NODE_ENV === 'development') {
        console.log('[ContinueProcess] Submitting with:', {
          instanceId,
          eventName,
          allParametersCount: formDataToParameters(formData).length,
          filteredParametersCount: formDataToParameters(filteredFormData).length,
          parameterNames: Object.keys(filteredFormData)
        })
      }

      // Submit changes using the event name from instance data
      // IMPORTANT: Only send filtered parameters (excludes metadata)
      const result = await sdk.process.continueInstance(
        {
          instanceId,
          eventName, // Use dynamic event name from instance data
          parameters: formDataToParameters(filteredFormData), // Use filtered data
        },
        formData.files || [], // Pass the files from formData
        activeToken // Pass the authentication token
      )

      if (process.env.NODE_ENV === 'development') {
        console.log('[ContinueProcess] Result:', result)
      }

      // Store the result
      setProcessData(result)
      setStatus('success')
    } catch (err: any) {
      // Note: 401 errors are handled automatically by useBizuitSDKWithAuth()
      // which will logout and redirect to login

      if (process.env.NODE_ENV === 'development') {
        console.warn('[ContinueProcess] Error submitting:', err)
      }

      const friendlyMessage = formatBizuitError(err, 'submit')
      setError(friendlyMessage)
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

  if (status === 'idle' || status === 'loading' || status === 'initializing' || status === 'error') {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/" className="text-sm text-primary hover:underline">
            {t('ui.backToHome')}
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

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('ui.eventName')}
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Ej: ContinueEvent"
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                disabled={status === 'loading' || status === 'initializing'}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('ui.eventNameDescription')}
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {(status === 'idle' || status === 'error') && (
              <Button
                onClick={loadInstanceData}
                disabled={!instanceId || !eventName}
                className="w-full"
              >
                {status === 'error' ? t('ui.retry') : t('ui.loadInstanceData')}
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
                <strong>{t('ui.exampleUrl')}:</strong> <code className="text-xs bg-background px-1 py-0.5 rounded">
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
        <div className="mb-6">
          <Link href="/" className="text-sm text-primary hover:underline">
            {t('ui.backToHome')}
          </Link>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Continuar Proceso</h1>
            {user && (
              <div className="text-sm text-muted-foreground">
                {t('ui.user')} <span className="font-medium">{user.DisplayName || user.Username}</span>
              </div>
            )}
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
              {processParameters.map((param) => (
                <DynamicFormField
                  key={param.name}
                  parameter={param}
                  value={formData[param.name]}
                  onChange={(value) => setFormData({ ...formData, [param.name]: value })}
                />
              ))}

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
                  {status !== 'ready' ? t('ui.savingChanges') : t('ui.saveAndContinue')}
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
                  {t('ui.cancel')}
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
              <p className="text-sm font-medium mb-2">{t('ui.instanceData')}:</p>
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
