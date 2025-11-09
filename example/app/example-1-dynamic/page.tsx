'use client'

import { useState } from 'react'
import { useBizuitSDK, formDataToParameters, type IBizuitProcessParameter } from '@tyconsa/bizuit-form-sdk'
import { DynamicFormField, Button, useBizuitAuth } from '@tyconsa/bizuit-ui-components'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { RequireAuth } from '@/components/require-auth'
import Link from 'next/link'

/**
 * EJEMPLO 1: Campos Dinámicos desde API
 *
 * Este ejemplo demuestra cómo:
 * 1. Obtener parámetros dinámicamente desde la API de Bizuit
 * 2. Generar campos de formulario automáticamente usando DynamicFormField
 * 3. Enviar TODOS los campos al proceso usando formDataToParameters()
 *
 * Ventajas:
 * - No necesitas conocer los parámetros de antemano
 * - Los campos se generan automáticamente según el tipo de dato
 * - Funciona con cualquier proceso sin cambios de código
 *
 * Desventajas:
 * - Menos control sobre la UI
 * - Envía todos los campos (no selectivo)
 * - No permite transformaciones personalizadas
 */
function Example1DynamicContent() {
  const sdk = useBizuitSDK()
  const { token } = useBizuitAuth()

  const [processName, setProcessName] = useState('DemoFlow')
  const [parameters, setParameters] = useState<IBizuitProcessParameter[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  // Paso 1: Obtener parámetros del proceso desde API
  const handleLoadParameters = async () => {
    try {
      setStatus('loading')
      setError(null)

      // Llamada API para obtener parámetros
      const params = await sdk.process.getProcessParameters(processName, '', token)

      // Filtrar solo parámetros de entrada (In y Optional)
      const inputParams = params.filter(p =>
        !p.isSystemParameter &&
        !p.isVariable &&
        (p.parameterDirection === 1 || p.parameterDirection === 3) // In o Optional
      )

      setParameters(inputParams)
      setStatus('ready')

      // Inicializar formData con valores por defecto
      const initialData: Record<string, any> = {}
      inputParams.forEach(param => {
        initialData[param.name] = param.value || ''
      })
      setFormData(initialData)
    } catch (err: any) {
      setError(err.message || 'Error al cargar parámetros')
      setStatus('error')
    }
  }

  // Paso 2: Enviar proceso con TODOS los campos + parámetros ocultos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setStatus('submitting')
      setError(null)

      // formDataToParameters() convierte TODO el formData a parámetros
      const visibleParameters = formDataToParameters(formData)

      // NUEVO: Agregar parámetros ocultos/calculados que NO están en el formulario
      const hiddenParameters = formDataToParameters({
        // Datos del usuario autenticado
        userId: token ? 'user123' : 'anonymous',
        userEmail: 'user@example.com',

        // Timestamps y fechas
        submittedAt: new Date().toISOString(),
        submittedDate: new Date().toLocaleDateString('es-AR'),

        // Información del entorno
        appVersion: '1.0.0',
        environment: process.env.NODE_ENV || 'development',

        // Valores calculados
        totalFields: parameters.length,
        formHash: Math.random().toString(36).substring(7),

        // Constantes de negocio
        defaultPriority: 'medium',
        defaultStatus: 'pending',
      })

      // Combinar parámetros visibles + ocultos
      const parametersToSend = [...visibleParameters, ...hiddenParameters]

      console.log('Enviando parámetros:', {
        visible: visibleParameters.length,
        hidden: hiddenParameters.length,
        total: parametersToSend.length,
        all: parametersToSend
      })

      // Iniciar proceso
      const response = await sdk.process.raiseEvent({
        eventName: processName,
        parameters: parametersToSend
      }, undefined, token)

      setResult(response)
      setStatus('success')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar proceso')
      setStatus('error')
    }
  }

  const handleReset = () => {
    setStatus('idle')
    setParameters([])
    setFormData({})
    setResult(null)
    setError(null)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Volver al inicio
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Ejemplo 1: Campos Dinámicos</h1>
      <p className="text-muted-foreground mb-6">
        Los campos se generan automáticamente desde la API de Bizuit y se envían todos los valores
      </p>

      <div className="grid gap-6">
        {/* Configuración Inicial */}
        {status === 'idle' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Configuración</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre del Proceso
                </label>
                <input
                  type="text"
                  value={processName}
                  onChange={(e) => setProcessName(e.target.value)}
                  placeholder="Ej: DemoFlow"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                />
              </div>

              <Button onClick={handleLoadParameters} className="w-full">
                Cargar Parámetros del Proceso
              </Button>
            </div>
          </Card>
        )}

        {/* Loading */}
        {status === 'loading' && (
          <Card className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando parámetros...</p>
          </Card>
        )}

        {/* Formulario Dinámico */}
        {status === 'ready' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Formulario: {processName}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {parameters.length} campos generados automáticamente
              </p>

              <div className="space-y-4">
                {parameters.map((param) => (
                  <DynamicFormField
                    key={param.name}
                    parameter={param}
                    value={formData[param.name]}
                    onChange={(value) => setFormData({ ...formData, [param.name]: value })}
                  />
                ))}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button type="submit" className="flex-1">
                  Iniciar Proceso
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Cancelar
                </Button>
              </div>
            </Card>

            {/* Preview de Parámetros */}
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Vista Previa: Parámetros a Enviar</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    ✅ Parámetros visibles del formulario ({parameters.length}):
                  </p>
                  <pre className="bg-muted p-3 rounded-md overflow-auto text-xs">
                    {JSON.stringify(formDataToParameters(formData), null, 2)}
                  </pre>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    🔒 Parámetros ocultos/calculados (8):
                  </p>
                  <pre className="bg-muted p-3 rounded-md overflow-auto text-xs">
                    {JSON.stringify(formDataToParameters({
                      userId: token ? 'user123' : 'anonymous',
                      userEmail: 'user@example.com',
                      submittedAt: new Date().toISOString(),
                      submittedDate: new Date().toLocaleDateString('es-AR'),
                      appVersion: '1.0.0',
                      environment: process.env.NODE_ENV || 'development',
                      totalFields: parameters.length,
                      formHash: '...(generado al enviar)',
                      defaultPriority: 'medium',
                      defaultStatus: 'pending',
                    }), null, 2)}
                  </pre>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    💡 Total: {parameters.length + 10} parámetros ({parameters.length} visibles + 10 ocultos)
                  </p>
                </div>
              </div>
            </Card>
          </form>
        )}

        {/* Success */}
        {status === 'success' && result && (
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Proceso Iniciado</h2>
              <p className="text-muted-foreground">
                Instance ID: <code className="text-xs bg-muted px-2 py-1 rounded">{result.instanceId}</code>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Respuesta del Servidor:</h3>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>

              <Button onClick={handleReset} className="w-full">
                Iniciar Otro Proceso
              </Button>
            </div>
          </Card>
        )}

        {/* Error */}
        {status === 'error' && (
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Error</h2>
              <p className="text-destructive">{error}</p>
            </div>

            <Button onClick={handleReset} className="w-full">
              Volver a Intentar
            </Button>
          </Card>
        )}

        {/* Documentación */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-3">💡 Cómo funciona este ejemplo</h3>

          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">1. Obtener parámetros dinámicamente:</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto">
{`const params = await sdk.process.getProcessParameters(
  'NombreProceso',
  '',
  token
)`}</pre>
            </div>

            <div>
              <h4 className="font-medium mb-1">2. Generar campos automáticamente:</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto">
{`{parameters.map((param) => (
  <DynamicFormField
    key={param.name}
    parameter={param}
    value={formData[param.name]}
    onChange={(value) =>
      setFormData({ ...formData, [param.name]: value })
    }
  />
))}`}</pre>
            </div>

            <div>
              <h4 className="font-medium mb-1">3. Enviar todos los campos + parámetros ocultos:</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto">
{`// Parámetros del formulario
const visibleParameters = formDataToParameters(formData)

// Parámetros ocultos/calculados
const hiddenParameters = formDataToParameters({
  userId: 'user123',
  submittedAt: new Date().toISOString(),
  appVersion: '1.0.0',
  // ... más parámetros ocultos
})

// Combinar ambos
const allParameters = [...visibleParameters, ...hiddenParameters]

await sdk.process.raiseEvent({
  eventName: 'NombreProceso',
  parameters: allParameters
}, undefined, token)`}</pre>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm">
              <strong>✅ Ideal para:</strong> Formularios genéricos, prototipos rápidos, cuando no conoces los parámetros de antemano
            </p>
            <p className="text-sm mt-2">
              <strong>❌ No ideal para:</strong> UI personalizada, validaciones complejas, mapeo selectivo de campos
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function Example1DynamicPage() {
  return (
    <RequireAuth returnUrl="/example-1-dynamic">
      <Example1DynamicContent />
    </RequireAuth>
  )
}
