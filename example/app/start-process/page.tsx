'use client'

import { useState } from 'react'
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

// Configuración del SDK (en producción, estos valores vendrían de variables de entorno)
const sdkConfig = {
  formsApiUrl: process.env.NEXT_PUBLIC_BIZUIT_FORMS_API_URL || 'https://api.bizuit.com/forms',
  dashboardApiUrl: process.env.NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL || 'https://api.bizuit.com/dashboard',
  timeout: 30000,
}

function StartProcessForm() {
  const sdk = useBizuitSDK()
  const { validateToken, checkFormAuth, getUserInfo, isAuthenticated, user, isLoading } = useAuth()

  const [processId, setProcessId] = useState('')
  const [token, setToken] = useState('')
  const [formData, setFormData] = useState<any>({})
  const [processData, setProcessData] = useState<any>(null)
  const [status, setStatus] = useState<'idle' | 'initializing' | 'ready' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

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

  const handleAuthenticate = async () => {
    try {
      setStatus('initializing')
      setError(null)

      // Validar token
      const isValid = await validateToken(token)
      if (!isValid) {
        throw new Error('Token inválido')
      }

      // Verificar permisos para el formulario
      const authResult = await checkFormAuth({
        processName: processId,
        userName: user?.username
      })
      if (!authResult) {
        throw new Error('No tiene permisos para iniciar este proceso')
      }

      // Obtener información del usuario (opcional - si necesitas más detalles del usuario)
      // const userInfo = await getUserInfo(token, userName)
      // console.log('Usuario autenticado:', userInfo)

      // Inicializar proceso
      const result = await sdk.process.initialize({
        processName: processId,
        token
      })

      setProcessData(result)
      setStatus('ready')
    } catch (err: any) {
      setError(err.message || 'Error al autenticar')
      setStatus('error')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setStatus('submitting')
      setError(null)

      // Ejecutar RaiseEvent para crear la instancia del proceso
      // NOTE: This is a simplified example. In production, you need to convert
      // formData to IParameter[] format as expected by the SDK
      const result = await sdk.process.raiseEvent(
        {
          eventName: 'StartProcess',
          parameters: [], // Convert formData to IParameter[]
        },
        [] // files
      )

      console.log('Proceso iniciado:', result)
      setStatus('success')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar proceso')
      setStatus('error')
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
        <div className="mb-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Volver al inicio
          </Link>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h1 className="text-3xl font-bold mb-6">Iniciar Proceso</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                ID del Proceso
              </label>
              <input
                type="text"
                value={processId}
                onChange={(e) => setProcessId(e.target.value)}
                placeholder="Ej: PROC-001"
                className="w-full px-3 py-2 border rounded-md"
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
                className="w-full px-3 py-2 border rounded-md font-mono text-xs"
                disabled={status === 'initializing'}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              onClick={handleAuthenticate}
              disabled={!processId || !token || status === 'initializing'}
              className="w-full"
            >
              {status === 'initializing' ? 'Autenticando...' : 'Autenticar e Inicializar'}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Nota:</strong> En un entorno real, el token vendría como parámetro de la URL
              desde el BPMS Bizuit. Esta pantalla es solo para propósitos de demostración.
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
            <h1 className="text-3xl font-bold">Formulario de Proceso</h1>
            {isAuthenticated && user && (
              <div className="text-sm text-muted-foreground">
                Usuario: <span className="font-medium">{user.displayName || user.username}</span>
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
                className="w-full px-3 py-2 border rounded-md"
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
    <BizuitSDKProvider config={sdkConfig}>
      <StartProcessForm />
    </BizuitSDKProvider>
  )
}
