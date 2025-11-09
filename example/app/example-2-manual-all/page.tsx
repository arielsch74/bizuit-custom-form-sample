'use client'

import { useState } from 'react'
import { useBizuitSDK, formDataToParameters } from '@tyconsa/bizuit-form-sdk'
import { Button, useBizuitAuth } from '@tyconsa/bizuit-ui-components'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { RequireAuth } from '@/components/require-auth'
import Link from 'next/link'

/**
 * EJEMPLO 2: Campos Manuales + Enviar Todos
 *
 * Este ejemplo demuestra cómo:
 * 1. Crear campos de formulario manualmente en código
 * 2. Tener control total sobre la UI y validaciones
 * 3. Enviar TODOS los campos al proceso usando formDataToParameters()
 *
 * Ventajas:
 * - Control total sobre el diseño del formulario
 * - Validaciones personalizadas
 * - Labels, placeholders y mensajes personalizados
 * - Mejor experiencia de usuario
 *
 * Desventajas:
 * - Más código para escribir y mantener
 * - Cambios en el proceso requieren cambios en el código
 * - Envía todos los campos (no selectivo)
 */
function Example2ManualAllContent() {
  const sdk = useBizuitSDK()
  const { token } = useBizuitAuth()

  // Estado del formulario con campos definidos manualmente
  const [formData, setFormData] = useState({
    pEmpleado: '',
    pLegajo: '',
    pMonto: '',
    pCategoria: 'Viajes',
    pDescripcion: '',
    pFechaSolicitud: new Date().toISOString().split('T')[0],
    pAprobado: false,
    // Campos adicionales que también se enviarán
    pComentarios: '',
    pPrioridad: 'Media'
  })

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setStatus('submitting')
      setError(null)

      // Parámetros visibles del formulario
      const visibleParameters = formDataToParameters(formData)

      // Parámetros ocultos/calculados
      const hiddenParameters = formDataToParameters({
        // Datos de auditoría
        submittedBy: token ? 'user123' : 'anonymous',
        submittedAt: new Date().toISOString(),
        submittedFrom: 'web-form',

        // Cálculos automáticos
        montoConIVA: parseFloat(formData.pMonto || '0') * 1.21,
        esMontoAlto: parseFloat(formData.pMonto || '0') > 10000,

        // Metadata
        formVersion: '2.0.0',
        deviceInfo: navigator.userAgent,
      })

      // Combinar todos los parámetros
      const allParameters = [...visibleParameters, ...hiddenParameters]

      console.log('Enviando parámetros:', {
        visible: visibleParameters.length,
        hidden: hiddenParameters.length,
        total: allParameters.length,
        all: allParameters
      })

      const response = await sdk.process.raiseEvent({
        eventName: 'AprobacionGastos',
        parameters: allParameters
      }, undefined, token)

      setResult(response)
      setStatus('success')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar proceso')
      setStatus('error')
    }
  }

  const handleReset = () => {
    setFormData({
      pEmpleado: '',
      pLegajo: '',
      pMonto: '',
      pCategoria: 'Viajes',
      pDescripcion: '',
      pFechaSolicitud: new Date().toISOString().split('T')[0],
      pAprobado: false,
      pComentarios: '',
      pPrioridad: 'Media'
    })
    setStatus('idle')
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

      <h1 className="text-3xl font-bold mb-2">Ejemplo 2: Campos Manuales + Enviar Todos</h1>
      <p className="text-muted-foreground mb-6">
        Los campos se crean manualmente con control total de la UI, se envían todos los valores
      </p>

      <div className="grid gap-6">
        {(status === 'idle' || status === 'submitting') && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Formulario Manual */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Solicitud de Reembolso de Gastos</h2>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Empleado */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nombre del Empleado *
                  </label>
                  <input
                    type="text"
                    value={formData.pEmpleado}
                    onChange={(e) => handleChange('pEmpleado', e.target.value)}
                    placeholder="Juan Pérez"
                    required
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                  />
                </div>

                {/* Legajo */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Número de Legajo *
                  </label>
                  <input
                    type="text"
                    value={formData.pLegajo}
                    onChange={(e) => handleChange('pLegajo', e.target.value)}
                    placeholder="12345"
                    required
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                  />
                </div>

                {/* Monto */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Monto Solicitado * (AR$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pMonto}
                    onChange={(e) => handleChange('pMonto', e.target.value)}
                    placeholder="1500.00"
                    required
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Categoría de Gasto *
                  </label>
                  <select
                    value={formData.pCategoria}
                    onChange={(e) => handleChange('pCategoria', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                  >
                    <option value="Viajes">Viajes</option>
                    <option value="Comidas">Comidas</option>
                    <option value="Alojamiento">Alojamiento</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fecha de Solicitud *
                  </label>
                  <input
                    type="date"
                    value={formData.pFechaSolicitud}
                    onChange={(e) => handleChange('pFechaSolicitud', e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                  />
                </div>

                {/* Prioridad */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Prioridad
                  </label>
                  <select
                    value={formData.pPrioridad}
                    onChange={(e) => handleChange('pPrioridad', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              {/* Descripción */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Descripción del Gasto *
                </label>
                <textarea
                  value={formData.pDescripcion}
                  onChange={(e) => handleChange('pDescripcion', e.target.value)}
                  placeholder="Describa el motivo del gasto..."
                  required
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                />
              </div>

              {/* Comentarios */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Comentarios Adicionales
                </label>
                <textarea
                  value={formData.pComentarios}
                  onChange={(e) => handleChange('pComentarios', e.target.value)}
                  placeholder="Comentarios opcionales..."
                  rows={2}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                />
              </div>

              {/* Checkbox */}
              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="aprobado"
                  checked={formData.pAprobado}
                  onChange={(e) => handleChange('pAprobado', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="aprobado" className="text-sm font-medium">
                  Pre-aprobado por supervisor inmediato
                </label>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="flex-1"
                >
                  {status === 'submitting' ? 'Enviando...' : 'Enviar Solicitud'}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Limpiar
                </Button>
              </div>
            </Card>

            {/* Preview */}
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Vista Previa: Parámetros a Enviar</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
                    ✅ Parámetros visibles del formulario ({Object.keys(formData).length}):
                  </p>
                  <pre className="bg-muted p-3 rounded-md overflow-auto text-xs max-h-64">
                    {JSON.stringify(formDataToParameters(formData), null, 2)}
                  </pre>
                </div>

                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                    🔒 Parámetros ocultos/calculados (7):
                  </p>
                  <pre className="bg-muted p-3 rounded-md overflow-auto text-xs max-h-48">
                    {JSON.stringify(formDataToParameters({
                      submittedBy: token ? 'user123' : 'anonymous',
                      submittedAt: new Date().toISOString(),
                      submittedFrom: 'web-form',
                      montoConIVA: parseFloat(formData.pMonto || '0') * 1.21,
                      esMontoAlto: parseFloat(formData.pMonto || '0') > 10000,
                      formVersion: '2.0.0',
                      deviceInfo: '...(user agent)',
                    }), null, 2)}
                  </pre>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    💡 Total: {Object.keys(formData).length + 7} parámetros ({Object.keys(formData).length} visibles + 7 ocultos)
                  </p>
                </div>

                <p className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ Nota: Este ejemplo envía TODOS los campos (visibles + ocultos)
                </p>
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
              <h2 className="text-2xl font-bold mb-2">Solicitud Enviada</h2>
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
                Nueva Solicitud
              </Button>
            </div>
          </Card>
        )}

        {/* Documentación */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-3">💡 Cómo funciona este ejemplo</h3>

          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">1. Definir campos manualmente:</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto">
{`const [formData, setFormData] = useState({
  pEmpleado: '',
  pMonto: '',
  pCategoria: 'Viajes',
  // ... más campos
})`}</pre>
            </div>

            <div>
              <h4 className="font-medium mb-1">2. Crear inputs con control total de UI:</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto">
{`<input
  type="text"
  value={formData.pEmpleado}
  onChange={(e) => handleChange('pEmpleado', e.target.value)}
  placeholder="Juan Pérez"
  required
/>`}</pre>
            </div>

            <div>
              <h4 className="font-medium mb-1">3. Agregar parámetros ocultos/calculados:</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto">
{`// Parámetros visibles del formulario
const visibleParameters = formDataToParameters(formData)

// Parámetros que NO están en el formulario
const hiddenParameters = formDataToParameters({
  submittedBy: 'user123',
  submittedAt: new Date().toISOString(),
  montoConIVA: parseFloat(formData.pMonto) * 1.21,
  esMontoAlto: formData.pMonto > 10000,
  formVersion: '2.0.0'
})`}</pre>
            </div>

            <div>
              <h4 className="font-medium mb-1">4. Combinar y enviar TODOS los campos:</h4>
              <pre className="bg-background p-3 rounded text-xs overflow-auto">
{`// Combinar parámetros visibles + ocultos
const allParameters = [...visibleParameters, ...hiddenParameters]

await sdk.process.raiseEvent({
  eventName: 'AprobacionGastos',
  parameters: allParameters // Envía TODO
})`}</pre>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm">
              <strong>✅ Ideal para:</strong> Formularios con UI personalizada, validaciones específicas, mejor UX
            </p>
            <p className="text-sm mt-2">
              <strong>❌ Limitación:</strong> Envía TODOS los campos incluso si algunos no son necesarios para el proceso
            </p>
            <p className="text-sm mt-2 text-primary">
              <strong>💡 Ver Ejemplo 3</strong> para aprender cómo enviar solo campos específicos
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function Example2ManualAllPage() {
  return (
    <RequireAuth returnUrl="/example-2-manual-all">
      <Example2ManualAllContent />
    </RequireAuth>
  )
}
