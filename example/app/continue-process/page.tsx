'use client'

import { useState, useEffect } from 'react'
import { BizuitSDKProvider, useBizuitSDK, useAuth } from '@bizuit/form-sdk'
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
import { ThemeToggle } from '@/components/theme-toggle'

function ContinueProcessForm() {
  const sdk = useBizuitSDK()
  const { validateToken, checkFormAuth, getUserInfo, isAuthenticated, user, isLoading } = useAuth()

  const [instanceId, setInstanceId] = useState('')
  const [token, setToken] = useState('')
  const [formData, setFormData] = useState<any>({})
  const [processData, setProcessData] = useState<any>(null)
  const [lockStatus, setLockStatus] = useState<'unlocked' | 'locked-by-me' | 'locked-by-other' | 'checking'>('unlocked')
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'initializing' | 'ready' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

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
      header: 'Completado por',
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
    {
      activityName: 'Solicitud Inicial',
      completedBy: 'Juan Pérez',
      completedAt: '2024-01-15 10:30',
      result: 'Aprobado',
    },
    {
      activityName: 'Revisión Técnica',
      completedBy: 'María García',
      completedAt: '2024-01-16 14:20',
      result: 'Aprobado con observaciones',
    },
  ])

  // Auto-unlock cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (sessionToken && instanceId) {
        sdk.instanceLock.unlock(
          { instanceId, activityName: 'ContinueActivity', sessionToken },
          token
        ).catch(console.error)
      }
    }
  }, [sessionToken, instanceId, token])

  const handleAuthenticate = async () => {
    try {
      setStatus('initializing')
      setError(null)

      // Validar token
      const isValid = await validateToken(token)
      if (!isValid) {
        throw new Error('Token inválido')
      }

      // Verificar permisos
      const authResult = await checkFormAuth({
        instanceId,
        userName: user?.username
      })
      if (!authResult) {
        throw new Error('No tiene permisos para continuar este proceso')
      }

      // Usuario autenticado disponible en el hook useAuth
      console.log('Usuario autenticado:', user)

      // Verificar estado del bloqueo
      setLockStatus('checking')
      const lockResult = await sdk.instanceLock.checkLockStatus(
        instanceId,
        'ContinueActivity',
        token
      )

      if (!lockResult.available) {
        setLockStatus('locked-by-other')
        throw new Error('El proceso está bloqueado por otro usuario')
      }

      // Intentar bloquear la instancia
      const lockResponse = await sdk.instanceLock.lock(
        {
          instanceId,
          activityName: 'ContinueActivity',
          operation: 1, // Continue operation
          processName: 'ContinueProcess'
        },
        token
      )

      setSessionToken(lockResponse.sessionToken || '')
      setLockStatus('locked-by-me')

      // Inicializar proceso con la instancia existente
      const result = await sdk.process.initialize({
        processName: 'ContinueProcess',
        instanceId,
        token
      })

      setProcessData(result)

      // Pre-cargar datos de parámetros y variables
      if (result.parameters) {
        setFormData({ ...result.parameters, ...result.variables })
      }

      setStatus('ready')
    } catch (err: any) {
      setError(err.message || 'Error al autenticar')
      setStatus('error')
      setLockStatus('unlocked')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sessionToken) {
      setError('No se ha establecido una sesión de bloqueo')
      return
    }

    try {
      setStatus('submitting')
      setError(null)

      // Usar withLock para asegurar el desbloqueo automático
      await sdk.instanceLock.withLock(
        {
          instanceId,
          activityName: 'ContinueActivity',
          operation: 1,
          processName: 'ContinueProcess'
        },
        token,
        async (lockSessionToken) => {
          // Ejecutar RaiseEvent para continuar el proceso
          // NOTE: This is a simplified example. In production, you need to convert
          // formData to IParameter[] format as expected by the SDK
          const result = await sdk.process.raiseEvent(
            {
              eventName: 'ContinueProcess',
              instanceId,
              parameters: [], // Convert formData to IParameter[]
            },
            [], // files
            lockSessionToken
          )

          console.log('Proceso continuado:', result)
          return result
        }
      )

      setStatus('success')
      setLockStatus('unlocked')
      setSessionToken(null)
    } catch (err: any) {
      setError(err.message || 'Error al continuar proceso')
      setStatus('error')
    }
  }

  const handleCancel = async () => {
    if (sessionToken && instanceId) {
      try {
        await sdk.instanceLock.unlock(
          { instanceId, activityName: 'ContinueActivity', sessionToken },
          token
        )
        setSessionToken(null)
        setLockStatus('unlocked')
        setStatus('idle')
      } catch (err: any) {
        setError(`Error al desbloquear: ${err.message}`)
      }
    } else {
      setStatus('idle')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (status === 'idle' || status === 'initializing') {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <div className="mb-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Volver al inicio
          </Link>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h1 className="text-3xl font-bold mb-6">Continuar Proceso</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                ID de Instancia
              </label>
              <input
                type="text"
                value={instanceId}
                onChange={(e) => setInstanceId(e.target.value)}
                placeholder="Ej: INST-12345"
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                disabled={status === 'initializing'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Token de Autenticación
              </label>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Ingrese el token JWT"
                rows={4}
                className="w-full px-3 py-2 border rounded-md font-mono text-xs bg-background text-foreground"
                disabled={status === 'initializing'}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {lockStatus === 'checking' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-md">
                Verificando estado del bloqueo...
              </div>
            )}

            {lockStatus === 'locked-by-other' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 px-4 py-3 rounded-md">
                El proceso está bloqueado por otro usuario
              </div>
            )}

            <Button
              onClick={handleAuthenticate}
              disabled={!instanceId || !token || status === 'initializing'}
              className="w-full"
            >
              {status === 'initializing' ? 'Autenticando y Bloqueando...' : 'Autenticar y Bloquear Instancia'}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-md space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Bloqueo Pesimista:</strong> Esta funcionalidad implementa bloqueo pesimista
              para garantizar que solo un usuario pueda editar la instancia a la vez.
            </p>
            <p className="text-sm text-muted-foreground">
              El bloqueo se liberará automáticamente al enviar el formulario o cancelar la edición.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'ready') {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Volver al inicio
          </Link>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Continuar Proceso</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Instancia: {instanceId}
              </p>
            </div>
            <div className="text-right">
              {isAuthenticated && user && (
                <div className="text-sm text-muted-foreground mb-1">
                  Usuario: <span className="font-medium">{user.displayName || user.username}</span>
                </div>
              )}
              {lockStatus === 'locked-by-me' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Bloqueado por ti
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sección de Actividades Completadas (Solo Lectura) */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Historial de Actividades</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Las siguientes actividades ya fueron completadas (solo lectura)
              </p>
              <BizuitDataGrid
                columns={activityColumns}
                data={activityData}
                selectable="none"
                sortable={false}
                filterable={false}
                paginated={false}
              />
            </div>

            {/* Sección de Datos Editables */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Datos Editables</h3>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Estado del Proceso
                </label>
                <BizuitCombo
                  options={statusOptions}
                  value={formData.status}
                  onChange={(value) => setFormData({ ...formData, status: value })}
                  placeholder="Seleccione un estado"
                  searchable
                />
              </div>

              {/* Asignado */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Asignar a
                </label>
                <BizuitCombo
                  options={assigneeOptions}
                  value={formData.assignedTo}
                  onChange={(value) => setFormData({ ...formData, assignedTo: value })}
                  placeholder="Seleccione un usuario"
                  searchable
                />
              </div>

              {/* Fecha de Vencimiento */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fecha de Vencimiento
                </label>
                <BizuitDateTimePicker
                  value={formData.dueDate}
                  onChange={(value) => setFormData({ ...formData, dueDate: value })}
                  mode="datetime"
                  locale="es"
                />
              </div>

              {/* Progreso */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Progreso (%)
                </label>
                <BizuitSlider
                  value={formData.progress || 0}
                  onChange={(value) => setFormData({ ...formData, progress: value })}
                  min={0}
                  max={100}
                  step={10}
                  showTooltip
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 50, label: '50%' },
                    { value: 100, label: '100%' },
                  ]}
                />
              </div>

              {/* Archivos Adicionales */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Archivos Adicionales
                </label>
                <BizuitFileUpload
                  value={formData.additionalFiles}
                  onChange={(files) => setFormData({ ...formData, additionalFiles: files })}
                  multiple
                  maxSize={10 * 1024 * 1024} // 10MB
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
              </div>

              {/* Comentarios */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Comentarios
                </label>
                <textarea
                  value={formData.comments || ''}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  placeholder="Agregue comentarios sobre esta actividad"
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                />
              </div>
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
                {status !== 'ready' ? 'Continuando Proceso...' : 'Continuar Proceso'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={status !== 'ready'}
              >
                Cancelar y Desbloquear
              </Button>
            </div>
          </form>

          {processData && (
            <div className="mt-6 p-4 bg-muted rounded-md">
              <p className="text-sm font-medium mb-2">Datos de la Instancia:</p>
              <pre className="text-xs overflow-auto max-h-64">
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
          <h2 className="text-2xl font-bold mb-2">Proceso Continuado Exitosamente</h2>
          <p className="text-muted-foreground mb-2">
            La instancia {instanceId} ha sido actualizada correctamente
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            El bloqueo ha sido liberado automáticamente
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => {
              setStatus('idle')
              setInstanceId('')
              setFormData({})
              setProcessData(null)
            }}>
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
