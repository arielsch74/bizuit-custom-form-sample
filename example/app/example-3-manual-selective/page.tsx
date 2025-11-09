'use client'

import { useState } from 'react'
import { useBizuitSDK, buildParameters, formDataToParameters } from '@tyconsa/bizuit-form-sdk'
import { Button, useBizuitAuth } from '@tyconsa/bizuit-ui-components'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { RequireAuth } from '@/components/require-auth'
import Link from 'next/link'

/**
 * EJEMPLO 3: Campos Manuales + Mapeo Selectivo (RECOMENDADO)
 *
 * Este ejemplo demuestra cómo:
 * 1. Crear campos de formulario manualmente en código
 * 2. Tener control total sobre la UI y validaciones
 * 3. ELEGIR selectivamente qué campos enviar usando buildParameters()
 * 4. Aplicar transformaciones a los valores antes de enviar
 *
 * Ventajas:
 * - Control total sobre el diseño del formulario
 * - Envía SOLO los campos necesarios
 * - Transforma valores antes de enviar (uppercase, decimales, etc.)
 * - Mapea campos del formulario a nombres diferentes en Bizuit
 * - Distingue entre parámetros y variables
 * - Mejor performance (menos datos enviados)
 *
 * Esta es la MEJOR PRÁCTICA para formularios personalizados.
 */
function Example3ManualSelectiveContent() {
  const sdk = useBizuitSDK()
  const { token } = useBizuitAuth()

  // Estado del formulario - puede tener más campos de los que se envían
  const [formData, setFormData] = useState({
    // Campos que SÍ se enviarán:
    empleado: '',
    legajo: '',
    monto: '',
    categoria: 'Viajes',
    descripcion: '',
    aprobadoSupervisor: false,

    // Campos que NO se enviarán (solo para UI):
    comentariosInternos: '',
    prioridad: 'Media',
    archivoAdjunto: null as File | null,
    notificarPorEmail: true
  })

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [mappedParameters, setMappedParameters] = useState<any[]>([])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Definir el mapeo selectivo
  const parameterMapping = {
    // Campo del form → Parámetro en Bizuit (con transformación)
    'empleado': {
      parameterName: 'pEmpleado',
      transform: (val: string) => val.toUpperCase() // Convertir a mayúsculas
    },
    'legajo': {
      parameterName: 'pLegajo'
    },
    'monto': {
      parameterName: 'pMonto',
      transform: (val: string) => parseFloat(val).toFixed(2) // Formato decimal
    },
    'categoria': {
      parameterName: 'pCategoria'
    },
    'descripcion': {
      parameterName: 'pDescripcion'
    },
    'aprobadoSupervisor': {
      parameterName: 'vAprobadoSupervisor', // Variable (no parámetro)
      isVariable: true,
      transform: (val: boolean) => val ? 'SI' : 'NO' // Boolean a texto
    }
    // NOTA: comentariosInternos, prioridad, archivoAdjunto, notificarPorEmail
    // NO están en el mapping, por lo tanto NO se enviarán
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setStatus('submitting')
      setError(null)

      // buildParameters() convierte SOLO los campos mapeados del formulario
      const visibleParameters = buildParameters(parameterMapping, formData)

      // NUEVO: Agregar parámetros ocultos/calculados usando formDataToParameters()
      const hiddenData = {
        // Datos de auditoría (valor directo, NO del formData)
        submittedBy: token ? 'user123' : 'anonymous',
        submittedAt: new Date().toISOString(),
        submittedFrom: 'web-form',

        // Cálculos basados en formData
        montoConIVA: parseFloat(formData.pMonto || '0') * 1.21,
        requiereAprobacionGerente: parseFloat(formData.pMonto || '0') > 5000,

        // Metadata y constantes
        formVersion: '3.0.0',
        browserInfo: navigator.userAgent.substring(0, 50),
      }

      const hiddenParameters = formDataToParameters(hiddenData)

      // Combinar parámetros visibles + ocultos
      const allParameters = [...visibleParameters, ...hiddenParameters]
      setMappedParameters(allParameters)

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
      empleado: '',
      legajo: '',
      monto: '',
      categoria: 'Viajes',
      descripcion: '',
      aprobadoSupervisor: false,
      comentariosInternos: '',
      prioridad: 'Media',
      archivoAdjunto: null,
      notificarPorEmail: true
    })
    setStatus('idle')
    setResult(null)
    setError(null)
    setMappedParameters([])
  }

  // Preview en tiempo real de los parámetros que se enviarán
  const previewParameters = () => {
    try {
      const visibleParams = buildParameters(parameterMapping, formData)

      // Parámetros ocultos/calculados - usando formDataToParameters() para valores directos
      const hiddenData = {
        submittedBy: token ? 'user123' : 'anonymous',
        submittedAt: new Date().toISOString(),
        submittedFrom: 'web-form',
        montoConIVA: parseFloat(formData.pMonto || '0') * 1.21,
        requiereAprobacionGerente: parseFloat(formData.pMonto || '0') > 5000,
        formVersion: '3.0.0',
        browserInfo: navigator.userAgent.substring(0, 50),
      }
      const hiddenParams = formDataToParameters(hiddenData)

      return {
        visible: visibleParams,
        hidden: hiddenParams,
        all: [...visibleParams, ...hiddenParams]
      }
    } catch (err) {
      console.error('Error en previewParameters:', err)
      return { visible: [], hidden: [], all: [] }
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Volver al inicio
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">Ejemplo 3: Campos Manuales + Mapeo Selectivo ⭐</h1>
      <p className="text-muted-foreground mb-6">
        Los campos se crean manualmente con control total de la UI, se eligen selectivamente cuáles enviar con transformaciones
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Formulario */}
        {(status === 'idle' || status === 'submitting') && (
          <>
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Solicitud de Reembolso</h2>

                  <div className="space-y-4">
                    {/* Empleado */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nombre del Empleado * ✅ Se envía (en mayúsculas)
                      </label>
                      <input
                        type="text"
                        value={formData.empleado}
                        onChange={(e) => handleChange('empleado', e.target.value)}
                        placeholder="juan pérez"
                        required
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Se enviará como: pEmpleado = "{formData.empleado.toUpperCase() || 'JUAN PÉREZ'}"
                      </p>
                    </div>

                    {/* Legajo */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Número de Legajo * ✅ Se envía
                      </label>
                      <input
                        type="text"
                        value={formData.legajo}
                        onChange={(e) => handleChange('legajo', e.target.value)}
                        placeholder="12345"
                        required
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                      />
                    </div>

                    {/* Monto */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Monto Solicitado * ✅ Se envía (formato decimal)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.monto}
                        onChange={(e) => handleChange('monto', e.target.value)}
                        placeholder="1500"
                        required
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Se enviará como: pMonto = "{formData.monto ? parseFloat(formData.monto).toFixed(2) : '1500.00'}"
                      </p>
                    </div>

                    {/* Categoría */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Categoría * ✅ Se envía
                      </label>
                      <select
                        value={formData.categoria}
                        onChange={(e) => handleChange('categoria', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                      >
                        <option value="Viajes">Viajes</option>
                        <option value="Comidas">Comidas</option>
                        <option value="Alojamiento">Alojamiento</option>
                        <option value="Transporte">Transporte</option>
                      </select>
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Descripción * ✅ Se envía
                      </label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => handleChange('descripcion', e.target.value)}
                        placeholder="Describa el motivo del gasto..."
                        required
                        rows={3}
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800"
                      />
                    </div>

                    {/* Aprobado */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="aprobado"
                        checked={formData.aprobadoSupervisor}
                        onChange={(e) => handleChange('aprobadoSupervisor', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="aprobado" className="text-sm font-medium">
                        ✅ Pre-aprobado por supervisor (se envía como variable vAprobadoSupervisor)
                      </label>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium mb-3 text-amber-600 dark:text-amber-400">
                        ⚠️ Campos siguientes NO se envían a Bizuit (solo para UI):
                      </p>

                      {/* Comentarios Internos - NO se envía */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          ❌ Comentarios Internos (NO se envía)
                        </label>
                        <textarea
                          value={formData.comentariosInternos}
                          onChange={(e) => handleChange('comentariosInternos', e.target.value)}
                          placeholder="Solo para uso interno..."
                          rows={2}
                          className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 opacity-70"
                        />
                      </div>

                      {/* Prioridad - NO se envía */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          ❌ Prioridad (NO se envía)
                        </label>
                        <select
                          value={formData.prioridad}
                          onChange={(e) => handleChange('prioridad', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 opacity-70"
                        >
                          <option value="Baja">Baja</option>
                          <option value="Media">Media</option>
                          <option value="Alta">Alta</option>
                        </select>
                      </div>

                      {/* Notificar - NO se envía */}
                      <div className="flex items-center opacity-70">
                        <input
                          type="checkbox"
                          id="notificar"
                          checked={formData.notificarPorEmail}
                          onChange={(e) => handleChange('notificarPorEmail', e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="notificar" className="text-sm font-medium">
                          ❌ Notificar por email (NO se envía)
                        </label>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-destructive/10 text-destructive rounded-md">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3">
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
                  </div>
                </Card>
              </form>
            </div>

            {/* Preview en Tiempo Real */}
            <div className="space-y-6">
              <Card className="p-6 sticky top-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  Vista Previa en Tiempo Real
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Total de campos en el formulario: <strong>{Object.keys(formData).length}</strong>
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      ✅ Parámetros visibles: <strong>{previewParameters().visible.length}</strong>
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      🔒 Parámetros ocultos/calculados: <strong>{previewParameters().hidden.length}</strong>
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-bold">
                      📦 Total a enviar: <strong>{previewParameters().all.length}</strong>
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      ❌ Campos que NO se enviarán: <strong>{Object.keys(formData).length - Object.keys(parameterMapping).length}</strong>
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-2 text-green-700 dark:text-green-400">
                      ✅ Parámetros Visibles del Formulario ({previewParameters().visible.length}):
                    </h4>
                    <pre className="bg-muted p-3 rounded-md overflow-auto text-xs max-h-48">
                      {JSON.stringify(previewParameters().visible, null, 2)}
                    </pre>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-400">
                      🔒 Parámetros Ocultos/Calculados ({previewParameters().hidden.length}):
                    </h4>
                    <pre className="bg-muted p-3 rounded-md overflow-auto text-xs max-h-48">
                      {JSON.stringify(previewParameters().hidden, null, 2)}
                    </pre>
                  </div>

                  <div className="border-t pt-4 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md">
                    <h4 className="text-sm font-semibold mb-2 text-purple-700 dark:text-purple-400">
                      📦 Todos los Parámetros a Enviar ({previewParameters().all.length}):
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Esta es la combinación final que se envía a Bizuit
                    </p>
                    <pre className="bg-background p-3 rounded-md overflow-auto text-xs max-h-64">
                      {JSON.stringify(previewParameters().all, null, 2)}
                    </pre>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-2">✨ Transformaciones Aplicadas:</h4>
                    <ul className="text-xs space-y-1">
                      <li>• <code>empleado</code> → <code>MAYÚSCULAS</code></li>
                      <li>• <code>monto</code> → <code>formato decimal (.00)</code></li>
                      <li>• <code>aprobadoSupervisor</code> → <code>SI/NO</code> (variable)</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Success */}
        {status === 'success' && result && (
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h2>
                <p className="text-muted-foreground">
                  Instance ID: <code className="text-xs bg-muted px-2 py-1 rounded">{result.instanceId}</code>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Parámetros Enviados ({mappedParameters.length}):</h3>
                  <pre className="bg-muted p-4 rounded-md overflow-auto text-xs max-h-64">
                    {JSON.stringify(mappedParameters, null, 2)}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Respuesta del Servidor:</h3>
                  <pre className="bg-muted p-4 rounded-md overflow-auto text-xs max-h-64">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>

              <Button onClick={handleReset} className="w-full">
                Nueva Solicitud
              </Button>
            </Card>
          </div>
        )}
      </div>

      {/* Documentación */}
      {(status === 'idle' || status === 'submitting') && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 mt-6">
          <h3 className="font-semibold mb-3 text-lg">💡 Cómo funciona el Mapeo Selectivo</h3>

          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">1️⃣ Definir el mapeo de campos:</h4>
              <pre className="bg-background/80 p-3 rounded text-xs overflow-auto">
{`const mapping = {
  'empleado': {
    parameterName: 'pEmpleado',
    transform: (val) => val.toUpperCase()
  },
  'monto': {
    parameterName: 'pMonto',
    transform: (val) => parseFloat(val).toFixed(2)
  },
  'aprobadoSupervisor': {
    parameterName: 'vAprobadoSupervisor',
    isVariable: true,
    transform: (val) => val ? 'SI' : 'NO'
  }
  // comentariosInternos NO está aquí, no se enviará
}`}</pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">2️⃣ Construir parámetros selectivamente:</h4>
              <pre className="bg-background/80 p-3 rounded text-xs overflow-auto">
{`const parameters = buildParameters(mapping, formData)
// Solo genera parámetros para los campos del mapping`}</pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">3️⃣ Agregar parámetros ocultos/calculados:</h4>
              <pre className="bg-background/80 p-3 rounded text-xs overflow-auto">
{`// Parámetros que NO están en el formulario
const hiddenData = {
  submittedBy: 'user123',
  submittedAt: new Date().toISOString(),
  montoConIVA: parseFloat(formData.pMonto) * 1.21,
  requiereAprobacion: formData.pMonto > 5000,
  formVersion: '3.0.0'
}

const hiddenParameters = formDataToParameters(hiddenData)`}</pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">4️⃣ Combinar y enviar al proceso:</h4>
              <pre className="bg-background/80 p-3 rounded text-xs overflow-auto">
{`// Combinar parámetros visibles + ocultos
const allParameters = [...parameters, ...hiddenParameters]

await sdk.process.raiseEvent({
  eventName: 'AprobacionGastos',
  parameters: allParameters // 6 visibles + 7 ocultos = 13 total
})`}</pre>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-primary/20">
            <p className="text-sm">
              <strong className="text-primary">✅ MEJOR PRÁCTICA:</strong> Usar mapeo selectivo con buildParameters()
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>✓ Envía solo lo necesario (mejor performance)</li>
              <li>✓ Transforma valores automáticamente</li>
              <li>✓ Mapea nombres de campos diferentes</li>
              <li>✓ Distingue parámetros de variables</li>
              <li>✓ Código más limpio y mantenible</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  )
}

export default function Example3ManualSelectivePage() {
  return (
    <RequireAuth returnUrl="/example-3-manual-selective">
      <Example3ManualSelectiveContent />
    </RequireAuth>
  )
}
