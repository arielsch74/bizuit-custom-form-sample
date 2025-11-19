'use client'

import { useState } from 'react'
import { useBizuitSDK, type IBizuitProcessParameter } from '@tyconsa/bizuit-form-sdk'
import { DynamicFormField, Button, useBizuitAuth, useTranslation, BizuitCard } from '@tyconsa/bizuit-ui-components'
import { RequireAuth } from '@/components/require-auth'
import { LiveCodeEditor } from '@/components/live-code-editor'
import Link from 'next/link'

/**
 * EJEMPLO 7: Form Service - Selective Field Mapping & Transformations
 *
 * Este ejemplo demuestra la característica MÁS PODEROSA del FormService:
 * 1. Mapeo selectivo de campos (fieldMapping)
 * 2. Transformaciones de valores (parseFloat, formatDate, uppercase, etc.)
 * 3. Parámetros adicionales no vinculados al formulario (additionalParameters)
 * 4. Helper createParameters() para construcción flexible
 *
 * CASOS DE USO REALES:
 * ====================
 * ✅ Agregar campos de auditoría automáticamente (createdBy, createdDate, modifiedBy)
 * ✅ Convertir tipos de datos (string → number, string → date, string → boolean)
 * ✅ Transformar valores antes de enviar (uppercase, lowercase, trim, format)
 * ✅ Mapear nombres de campos UI a nombres de parámetros BPM diferentes
 * ✅ Enviar solo un SUBCONJUNTO de campos del formulario
 * ✅ Agregar parámetros calculados (ej: total = cantidad * precio)
 *
 * VS. PROCESS SERVICE (Ejemplo 1):
 * =================================
 * Process Service requiere:
 * - Construir manualmente el array de parámetros
 * - Aplicar transformaciones en tu código manualmente
 * - Agregar campos adicionales manualmente
 * - Más código boilerplate
 *
 * Form Service simplifica:
 * - Declaras fieldMapping con transformaciones
 * - Declaras additionalParameters
 * - Todo se convierte automáticamente
 */
function Example7FormSelectiveContent() {
  const { t } = useTranslation()
  const sdk = useBizuitSDK()
  const { token, user } = useBizuitAuth()

  const [processName, setProcessName] = useState('ExpenseRequest')
  const [parameters, setParameters] = useState<IBizuitProcessParameter[]>([])

  // FormData: solo los campos que el usuario ve
  const [formData, setFormData] = useState<Record<string, any>>({
    description: '',
    amountStr: '', // String en el form, pero lo convertiremos a number
    category: 'Travel',
    urgent: false
  })

  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [sentParameters, setSentParameters] = useState<any[]>([])

  // Paso 1: Cargar parámetros del proceso (igual que siempre)
  const handlePrepareForm = async () => {
    try {
      setStatus('loading')
      setError(null)
      setResult(null)

      console.log('📋 [FormService] Preparando formulario para:', processName)

      const prepared = await sdk.forms.prepareStartForm({
        processName,
        token
      })

      console.log('✅ [FormService] Formulario preparado')

      setParameters(prepared.parameters)
      setStatus('ready')
    } catch (error: any) {
      console.error('❌ Error preparando formulario:', error)
      setError(error.message || 'Error al preparar formulario')
      setStatus('error')
    }
  }

  // Paso 2: Enviar con field mapping selectivo y transformaciones
  const handleSubmit = async () => {
    try {
      setStatus('submitting')
      setError(null)

      console.log('📤 [FormService] Iniciando proceso con field mapping selectivo')

      // ✨ MAGIA DEL FORM SERVICE: Field Mapping + Transformations
      const response = await sdk.forms.startProcess({
        processName,
        formData, // Solo los campos del formulario

        // 🎯 Field Mapping: Qué campos enviar y cómo transformarlos
        fieldMapping: {
          // Mapeo simple: campo form → parámetro BPM (mismo nombre)
          description: 'description',
          category: 'category',
          urgent: 'urgent',

          // Mapeo con transformación: string → number
          amountStr: {
            parameterName: 'amount', // ¡Nombre diferente!
            transform: (value: string) => parseFloat(value) || 0
          }
        },

        // 🚀 Additional Parameters: Campos NO en el formulario
        additionalParameters: sdk.forms.createParameters({
          // Auditoría automática
          requestedBy: user?.username || 'system',
          requestedDate: new Date().toISOString(),

          // Campos calculados
          status: 'Pending',
          approvalRequired: parseFloat(formData.amountStr || '0') > 1000,

          // Metadata
          source: 'CustomFormsShowcase',
          version: '2.0.0'
        }),

        token
      })

      console.log('✅ [FormService] Proceso iniciado:', response)

      // Para mostrar QUÉ parámetros se enviaron realmente
      const sentParams = [
        { name: 'description', value: formData.description, source: 'formData (mapped)' },
        { name: 'category', value: formData.category, source: 'formData (mapped)' },
        { name: 'urgent', value: formData.urgent, source: 'formData (mapped)' },
        { name: 'amount', value: parseFloat(formData.amountStr) || 0, source: 'formData (transformed from amountStr)' },
        { name: 'requestedBy', value: user?.username || 'system', source: 'additionalParameters' },
        { name: 'requestedDate', value: new Date().toISOString(), source: 'additionalParameters' },
        { name: 'status', value: 'Pending', source: 'additionalParameters' },
        { name: 'approvalRequired', value: parseFloat(formData.amountStr || '0') > 1000, source: 'additionalParameters (calculated)' },
        { name: 'source', value: 'CustomFormsShowcase', source: 'additionalParameters' },
        { name: 'version', value: '2.0.0', source: 'additionalParameters' }
      ]

      setSentParameters(sentParams)
      setResult(response)
      setStatus('success')
    } catch (error: any) {
      console.error('❌ Error iniciando proceso:', error)
      setError(error.message || 'Error al iniciar proceso')
      setStatus('error')
    }
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← {t('ui.back')}
        </Link>
        <h1 className="text-4xl font-bold mb-2">Form Service - Selective Field Mapping</h1>
        <p className="text-gray-600 text-lg">
          Mapeo selectivo, transformaciones y parámetros adicionales automáticos
        </p>
      </div>

      <div className="space-y-8">
        {/* Info Card: Qué es Field Mapping */}
        <BizuitCard
          title="🎯 Field Mapping: La característica más poderosa"
          description="Controla exactamente QUÉ se envía y CÓMO se transforma"
        >
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h3 className="font-semibold mb-3">✨ ¿Por qué es tan poderoso?</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-purple-600 dark:text-purple-400 mb-2">🎨 Mapeo Selectivo</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Envía SOLO los campos que necesitas</li>
                    <li>• Ignora campos del formulario automáticamente</li>
                    <li>• Mapea nombres diferentes (UI vs BPM)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-blue-600 dark:text-blue-400 mb-2">🔄 Transformaciones</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• string → number (parseFloat)</li>
                    <li>• Formato de fechas (toISOString)</li>
                    <li>• uppercase, lowercase, trim</li>
                    <li>• Funciones personalizadas</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-green-600 dark:text-green-400 mb-2">🚀 Parámetros Adicionales</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Auditoría (createdBy, createdDate)</li>
                    <li>• Campos calculados</li>
                    <li>• Metadata del sistema</li>
                    <li>• No están en el formulario</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Casos de uso reales */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">💼 Casos de Uso Reales</h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <p className="font-semibold mb-1">📝 Formulario de Gastos:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Campo "Monto" (string) → parámetro "amount" (number)</li>
                    <li>• Agregar automáticamente: requestedBy, requestedDate</li>
                    <li>• Calcular: approvalRequired = amount &gt; 1000</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">👤 Registro de Usuario:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Campo "email" → lowercase automático</li>
                    <li>• Agregar: createdDate, registrationSource</li>
                    <li>• Omitir: passwordConfirm (solo validación UI)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">📅 Solicitud de Vacaciones:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Campo "desde/hasta" → toISOString()</li>
                    <li>• Calcular: totalDays = diferencia de fechas</li>
                    <li>• Agregar: employeeId, managerId automático</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-1">🛒 Orden de Compra:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Campo "cantidad" (string) → quantity (number)</li>
                    <li>• Calcular: total = cantidad * precio</li>
                    <li>• Agregar: orderDate, orderNumber generado</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </BizuitCard>

        {/* Paso 1: Seleccionar proceso */}
        <BizuitCard
          title="1️⃣ Seleccionar Proceso"
          description="Elige el proceso para cargar sus parámetros"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre del Proceso</label>
              <input
                type="text"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="ExpenseRequest"
                disabled={status === 'loading' || status === 'ready'}
              />
            </div>

            <Button
              onClick={handlePrepareForm}
              disabled={status === 'loading' || status === 'ready' || !processName}
              variant="primary"
              className="w-full"
            >
              {status === 'loading' ? 'Cargando...' : 'Cargar Parámetros'}
            </Button>

            {error && status === 'error' && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        </BizuitCard>

        {/* Paso 2: Formulario SIMPLIFICADO (solo 4 campos) */}
        {status === 'ready' && (
          <BizuitCard
            title="2️⃣ Completar Formulario (Solo 4 Campos)"
            description="Nota: El formulario tiene SOLO 4 campos, pero enviaremos 10 parámetros al proceso"
          >
            <div className="space-y-4">
              {/* Campo: Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Descripción del Gasto
                  <span className="text-xs text-gray-500 ml-2">(se enviará como "description")</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  rows={3}
                  placeholder="Ej: Viaje a conferencia técnica en Madrid"
                />
              </div>

              {/* Campo: Amount (string) → se convertirá a number */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Monto (en texto)
                  <span className="text-xs text-purple-600 dark:text-purple-400 ml-2">
                    ✨ Se transformará a number y se enviará como "amount"
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.amountStr}
                  onChange={(e) => handleFieldChange('amountStr', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="1500.50"
                />
              </div>

              {/* Campo: Category */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Categoría
                  <span className="text-xs text-gray-500 ml-2">(se enviará como "category")</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                >
                  <option value="Travel">Viaje</option>
                  <option value="Food">Comida</option>
                  <option value="Equipment">Equipamiento</option>
                  <option value="Other">Otro</option>
                </select>
              </div>

              {/* Campo: Urgent */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.urgent}
                  onChange={(e) => handleFieldChange('urgent', e.target.checked)}
                  className="w-4 h-4"
                  id="urgent-checkbox"
                />
                <label htmlFor="urgent-checkbox" className="text-sm font-medium">
                  ¿Es urgente?
                  <span className="text-xs text-gray-500 ml-2">(se enviará como "urgent")</span>
                </label>
              </div>

              {/* Preview: Parámetros adicionales que se agregarán automáticamente */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">🚀 Parámetros que se agregarán automáticamente:</h4>
                <div className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                  <div className="grid grid-cols-2 gap-2">
                    <div><code className="bg-muted px-1 rounded">requestedBy</code>: {user?.username || 'system'}</div>
                    <div><code className="bg-muted px-1 rounded">requestedDate</code>: {new Date().toISOString().substring(0, 19)}</div>
                    <div><code className="bg-muted px-1 rounded">status</code>: Pending</div>
                    <div><code className="bg-muted px-1 rounded">approvalRequired</code>: {parseFloat(formData.amountStr || '0') > 1000 ? 'true' : 'false'}</div>
                    <div><code className="bg-muted px-1 rounded">source</code>: CustomFormsShowcase</div>
                    <div><code className="bg-muted px-1 rounded">version</code>: 2.0.0</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={status === 'submitting'}
                  variant="primary"
                  className="w-full"
                >
                  {status === 'submitting' ? 'Enviando...' : 'Iniciar Proceso'}
                </Button>
              </div>
            </div>
          </BizuitCard>
        )}

        {/* Resultado: Mostrar QUÉ se envió */}
        {result && sentParameters.length > 0 && (
          <BizuitCard
            title="✅ Proceso Iniciado - Parámetros Enviados"
            description="Comparación: 4 campos en el formulario → 10 parámetros enviados al proceso"
          >
            <div className="space-y-4">
              {/* Tabla de parámetros enviados */}
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold mb-3">📊 Parámetros Enviados al Proceso:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-green-300 dark:border-green-700">
                        <th className="text-left py-2 px-3 font-semibold">Parámetro</th>
                        <th className="text-left py-2 px-3 font-semibold">Valor</th>
                        <th className="text-left py-2 px-3 font-semibold">Origen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sentParameters.map((param, idx) => (
                        <tr key={idx} className="border-b border-green-200 dark:border-green-800">
                          <td className="py-2 px-3">
                            <code className="bg-muted px-1 rounded text-xs">{param.name}</code>
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-xs">{JSON.stringify(param.value)}</span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-xs text-gray-600 dark:text-gray-400">{param.source}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resultado del proceso */}
              <div className="bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                <h4 className="font-semibold mb-2">🔍 Respuesta del Proceso:</h4>
                <pre className="text-xs overflow-auto max-h-64">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          </BizuitCard>
        )}

        {/* Código de ejemplo */}
        <BizuitCard
          title="💻 Código - FormService con Field Mapping"
          description="Mapeo selectivo + transformaciones + parámetros adicionales"
        >
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm"><code>{`// ✨ FORM SERVICE: Field Mapping + Transformations
const response = await sdk.forms.startProcess({
  processName: 'ExpenseRequest',

  // Formulario: Solo 4 campos
  formData: {
    description: 'Viaje a conferencia',
    amountStr: '1500.50', // ← STRING
    category: 'Travel',
    urgent: false
  },

  // 🎯 Field Mapping: Qué enviar y cómo transformar
  fieldMapping: {
    description: 'description',    // Mapeo simple
    category: 'category',          // Mapeo simple
    urgent: 'urgent',              // Mapeo simple

    // Mapeo con transformación
    amountStr: {
      parameterName: 'amount',     // ¡Nombre diferente!
      transform: (value: string) => parseFloat(value) || 0  // STRING → NUMBER
    }
  },

  // 🚀 Additional Parameters: NO están en el formulario
  additionalParameters: sdk.forms.createParameters({
    // Auditoría
    requestedBy: user?.username || 'system',
    requestedDate: new Date().toISOString(),

    // Campos calculados
    status: 'Pending',
    approvalRequired: parseFloat(formData.amountStr) > 1000,

    // Metadata
    source: 'CustomFormsShowcase',
    version: '2.0.0'
  }),

  token
})

// RESULTADO: 10 parámetros enviados al proceso
// - 4 del formulario (con 1 transformado)
// - 6 adicionales automáticos`}</code></pre>
          </div>
        </BizuitCard>

        {/* Comparación con ProcessService */}
        <BizuitCard
          title="📊 Comparación: FormService vs ProcessService"
          description="Mismo resultado, MUCHO menos código"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-green-600 dark:text-green-400">
                ✅ FormService (Este ejemplo)
              </h3>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-xs">
                <pre>{`// Declarativo y conciso
const response = await sdk.forms.startProcess({
  processName,
  formData,

  fieldMapping: {
    description: 'description',
    amountStr: {
      parameterName: 'amount',
      transform: parseFloat
    }
    // ...
  },

  additionalParameters: sdk.forms.createParameters({
    requestedBy: user?.username,
    requestedDate: new Date().toISOString(),
    status: 'Pending',
    // ...
  }),

  token
})`}</pre>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                📏 ~20 líneas, declarativo
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-amber-600 dark:text-amber-400">
                ⚙️ ProcessService (Ejemplo 1)
              </h3>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-xs">
                <pre>{`// Imperativo y verboso
const params = await sdk.process.getParameters(
  processName, '', token
)

// Construir parámetros manualmente
const parameters = [
  { name: 'description', value: formData.description },
  { name: 'amount', value: parseFloat(formData.amountStr) || 0 },
  { name: 'category', value: formData.category },
  { name: 'urgent', value: formData.urgent },
  { name: 'requestedBy', value: user?.username || 'system' },
  { name: 'requestedDate', value: new Date().toISOString() },
  { name: 'status', value: 'Pending' },
  { name: 'approvalRequired', value: parseFloat(formData.amountStr) > 1000 },
  { name: 'source', value: 'CustomFormsShowcase' },
  { name: 'version', value: '2.0.0' }
]

const response = await sdk.process.start({
  processName,
  parameters
}, undefined, token)`}</pre>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                📏 ~35 líneas, imperativo, propenso a errores
              </p>
            </div>
          </div>
        </BizuitCard>

        {/* Casos de uso avanzados */}
        <BizuitCard
          title="🚀 Casos de Uso Avanzados"
          description="Transformaciones personalizadas y lógica compleja"
        >
          <div className="space-y-4">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <h4 className="font-semibold mb-2 text-purple-400">1️⃣ Transformación de Fechas</h4>
              <pre className="text-xs"><code>{`fieldMapping: {
  startDate: {
    parameterName: 'startDate',
    transform: (value: string) => new Date(value).toISOString()
  },
  endDate: {
    parameterName: 'endDate',
    transform: (value: string) => {
      const date = new Date(value)
      date.setHours(23, 59, 59) // Fin del día
      return date.toISOString()
    }
  }
}`}</code></pre>
            </div>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <h4 className="font-semibold mb-2 text-blue-400">2️⃣ Normalización de Texto</h4>
              <pre className="text-xs"><code>{`fieldMapping: {
  email: {
    parameterName: 'email',
    transform: (value: string) => value.toLowerCase().trim()
  },
  companyName: {
    parameterName: 'companyName',
    transform: (value: string) => value.toUpperCase().trim()
  }
}`}</code></pre>
            </div>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <h4 className="font-semibold mb-2 text-green-400">3️⃣ Cálculos Complejos</h4>
              <pre className="text-xs"><code>{`// En additionalParameters puedes hacer cálculos basados en formData
additionalParameters: sdk.forms.createParameters({
  // Calcular total con IVA
  totalWithTax: parseFloat(formData.subtotal) * 1.21,

  // Calcular días entre fechas
  totalDays: Math.ceil(
    (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime())
    / (1000 * 60 * 60 * 24)
  ),

  // Determinar prioridad basada en monto
  priority: parseFloat(formData.amount) > 5000 ? 'High' : 'Normal'
})`}</code></pre>
            </div>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <h4 className="font-semibold mb-2 text-amber-400">4️⃣ Arrays y Objetos JSON</h4>
              <pre className="text-xs"><code>{`fieldMapping: {
  // Convertir string separado por comas a array
  tags: {
    parameterName: 'tags',
    transform: (value: string) => value.split(',').map(t => t.trim())
  },

  // Convertir objeto a JSON string
  metadata: {
    parameterName: 'metadata',
    transform: (value: any) => JSON.stringify(value)
  }
}`}</code></pre>
            </div>
          </div>
        </BizuitCard>

        {/* Live Code Editor */}
        <div className="mb-8">
          <LiveCodeEditor
            title="⚡ Playground Interactivo - Field Mapping & Transformations"
            description="Experimenta con field mapping selectivo, transformaciones y parámetros adicionales. La característica MÁS PODEROSA de FormService."
            files={{
              '/App.js': `import { useState } from 'react';
import './styles.css';

/**
 * 🎯 FIELD MAPPING - LA CARACTERÍSTICA MÁS PODEROSA
 *
 * FormService permite:
 * 1. Mapeo selectivo: Envía SOLO los campos que necesitas
 * 2. Transformaciones: Convierte valores (string → number, dates, etc.)
 * 3. Parámetros adicionales: Agrega campos de auditoría automáticamente
 * 4. Nombres diferentes: Campo UI "amountStr" → parámetro BPM "amount"
 *
 * CASO DE USO REAL: Formulario de Gastos
 * - 4 campos en el formulario
 * - 10 parámetros enviados al proceso
 * - Transformación: string → number
 * - Auditoría: requestedBy, requestedDate, source, version
 * - Cálculos: approvalRequired = amount > 1000
 */

// 🔧 Mock del SDK FormService
const mockFormService = {
  prepareStartForm: async ({ processName }) => {
    await new Promise(r => setTimeout(r, 800));

    const mockParameters = [
      { name: 'description', dataType: 'string', value: '', required: true },
      { name: 'amountStr', dataType: 'string', value: '', required: true },
      { name: 'category', dataType: 'string', value: 'Travel', required: true },
      { name: 'urgent', dataType: 'boolean', value: false, required: false }
    ];

    const formData = {};
    mockParameters.forEach(p => {
      formData[p.name] = p.value;
    });

    return { parameters: mockParameters, formData };
  },

  /**
   * startProcess() con fieldMapping + additionalParameters
   * Esta es la MAGIA de FormService
   */
  startProcess: async ({ processName, formData, fieldMapping, additionalParameters }) => {
    await new Promise(r => setTimeout(r, 1000));

    // Aplicar fieldMapping (simulado)
    const mappedParams = {};

    // description: mapeo simple (mismo nombre)
    mappedParams.description = formData.description;

    // category: mapeo simple
    mappedParams.category = formData.category;

    // urgent: mapeo simple
    mappedParams.urgent = formData.urgent;

    // amountStr → amount: TRANSFORMACIÓN (string → number)
    mappedParams.amount = parseFloat(formData.amountStr) || 0;

    // Agregar parámetros adicionales
    const allParams = {
      ...mappedParams,
      ...additionalParameters
    };

    return {
      success: true,
      instanceId: \`INST-\${Math.random().toString(36).substr(2, 9)}\`,
      processName: processName,
      totalParametersSent: Object.keys(allParams).length,
      formFieldsCount: Object.keys(formData).length,
      parameters: allParams,
      timestamp: new Date().toISOString()
    };
  },

  // Helper para crear parámetros
  createParameters: (params) => params
};

function FieldMappingDemo() {
  const [processName] = useState('ExpenseRequest');
  const [currentUser] = useState({ username: 'juan.perez' });
  const [step, setStep] = useState('idle');

  const [parameters, setParameters] = useState([]);
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePrepareForm = async () => {
    try {
      setStep('loading');
      setError(null);

      console.log('📋 [FormService] Preparando formulario...');

      const prepared = await mockFormService.prepareStartForm({
        processName: processName
      });

      console.log('✅ Formulario preparado');

      setParameters(prepared.parameters);
      setFormData(prepared.formData);
      setStep('ready');
    } catch (err) {
      setError(err.message);
      setStep('idle');
    }
  };

  const handleSubmit = async () => {
    try {
      setStep('submitting');
      setError(null);

      console.log('📤 [FormService] Iniciando proceso con field mapping...');

      // ✨ FIELD MAPPING: Mapeo selectivo + transformaciones
      const fieldMapping = {
        description: 'description',    // Mapeo simple
        category: 'category',          // Mapeo simple
        urgent: 'urgent',              // Mapeo simple

        // Transformación: amountStr (string) → amount (number)
        amountStr: {
          parameterName: 'amount',
          transform: (value) => parseFloat(value) || 0
        }
      };

      // ✨ ADDITIONAL PARAMETERS: Campos NO en el formulario
      const additionalParameters = mockFormService.createParameters({
        // Auditoría automática
        requestedBy: currentUser.username,
        requestedDate: new Date().toISOString(),

        // Campos calculados
        status: 'Pending',
        approvalRequired: parseFloat(formData.amountStr || '0') > 1000,

        // Metadata
        source: 'CustomFormsShowcase',
        version: '2.0.0'
      });

      console.log('Field Mapping:', fieldMapping);
      console.log('Additional Parameters:', additionalParameters);

      const response = await mockFormService.startProcess({
        processName,
        formData,
        fieldMapping,
        additionalParameters
      });

      console.log('✅ Proceso iniciado:', response);

      setResult(response);
      setStep('success');
    } catch (err) {
      setError(err.message);
      setStep('ready');
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const reset = () => {
    setStep('idle');
    setParameters([]);
    setFormData({});
    setResult(null);
    setError(null);
  };

  return (
    <div className="app-container">
      <div className="card header-card">
        <h1>🎯 Field Mapping Demo</h1>
        <p className="subtitle">4 campos en el form → 10 parámetros al proceso</p>
      </div>

      {/* PASO 1: Preparar */}
      {step === 'idle' && (
        <div className="card">
          <h2>1️⃣ Preparar Formulario</h2>
          <p>Proceso: <strong>{processName}</strong></p>
          <button onClick={handlePrepareForm} className="btn-primary">
            Preparar Formulario
          </button>
        </div>
      )}

      {step === 'loading' && (
        <div className="card loading">
          <div className="spinner"></div>
          <p>Cargando parámetros...</p>
        </div>
      )}

      {/* PASO 2: Completar Formulario */}
      {step === 'ready' && (
        <div className="card">
          <h2>2️⃣ Completar Formulario (4 campos)</h2>
          <p className="info">
            ℹ️ Nota: Solo 4 campos en el formulario, pero se enviarán 10 parámetros al proceso
          </p>

          <div className="form-grid">
            <div className="form-field">
              <label>
                Descripción del Gasto
                <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Ej: Viaje a conferencia"
              />
              <span className="field-hint">→ se enviará como "description"</span>
            </div>

            <div className="form-field">
              <label>
                Monto (en texto)
                <span className="required">*</span>
              </label>
              <input
                type="text"
                value={formData.amountStr || ''}
                onChange={(e) => handleFieldChange('amountStr', e.target.value)}
                placeholder="1500.50"
              />
              <span className="field-hint transform">
                ✨ transformación → "amount" (number)
              </span>
            </div>

            <div className="form-field">
              <label>
                Categoría
                <span className="required">*</span>
              </label>
              <select
                value={formData.category || 'Travel'}
                onChange={(e) => handleFieldChange('category', e.target.value)}
              >
                <option value="Travel">Viaje</option>
                <option value="Food">Comida</option>
                <option value="Equipment">Equipamiento</option>
                <option value="Other">Otro</option>
              </select>
              <span className="field-hint">→ se enviará como "category"</span>
            </div>

            <div className="form-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.urgent || false}
                  onChange={(e) => handleFieldChange('urgent', e.target.checked)}
                />
                ¿Es urgente?
              </label>
              <span className="field-hint">→ se enviará como "urgent"</span>
            </div>
          </div>

          {/* Preview de parámetros adicionales */}
          <div className="additional-params-preview">
            <h3>🚀 Parámetros que se agregarán automáticamente (6 adicionales):</h3>
            <div className="params-grid">
              <div className="param-item">
                <span className="param-name">requestedBy</span>
                <span className="param-value">{currentUser.username}</span>
              </div>
              <div className="param-item">
                <span className="param-name">requestedDate</span>
                <span className="param-value">{new Date().toISOString().substring(0, 19)}</span>
              </div>
              <div className="param-item">
                <span className="param-name">status</span>
                <span className="param-value">Pending</span>
              </div>
              <div className="param-item calculated">
                <span className="param-name">approvalRequired</span>
                <span className="param-value">
                  {parseFloat(formData.amountStr || '0') > 1000 ? 'true' : 'false'}
                </span>
                <span className="calculated-badge">calculado</span>
              </div>
              <div className="param-item">
                <span className="param-name">source</span>
                <span className="param-value">CustomFormsShowcase</span>
              </div>
              <div className="param-item">
                <span className="param-name">version</span>
                <span className="param-value">2.0.0</span>
              </div>
            </div>
          </div>

          <div className="button-group">
            <button onClick={reset} className="btn-secondary">
              ← Volver
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              Iniciar Proceso con Field Mapping
            </button>
          </div>
        </div>
      )}

      {step === 'submitting' && (
        <div className="card loading">
          <div className="spinner"></div>
          <p>Iniciando proceso...</p>
        </div>
      )}

      {/* PASO 3: Resultado */}
      {step === 'success' && result && (
        <div className="card success">
          <h2>✅ Proceso Iniciado - Field Mapping Exitoso</h2>

          <div className="magic-banner">
            <h3>✨ La Magia del Field Mapping</h3>
            <div className="magic-stats">
              <div className="stat">
                <div className="stat-number">{result.formFieldsCount}</div>
                <div className="stat-label">Campos en formulario</div>
              </div>
              <div className="stat-arrow">→</div>
              <div className="stat highlight">
                <div className="stat-number">{result.totalParametersSent}</div>
                <div className="stat-label">Parámetros enviados</div>
              </div>
            </div>
          </div>

          <div className="result-details">
            <div className="detail-row">
              <span className="label">Instance ID:</span>
              <span className="value">{result.instanceId}</span>
            </div>
            <div className="detail-row">
              <span className="label">Timestamp:</span>
              <span className="value">{new Date(result.timestamp).toLocaleString()}</span>
            </div>
          </div>

          <div className="parameters-sent">
            <h3>📦 Parámetros Enviados al Proceso:</h3>
            <div className="params-table">
              {Object.entries(result.parameters).map(([key, value]) => (
                <div key={key} className="param-row">
                  <span className="param-key">{key}</span>
                  <span className="param-type">
                    {typeof value === 'number' ? 'number' :
                     typeof value === 'boolean' ? 'boolean' : 'string'}
                  </span>
                  <span className="param-val">{JSON.stringify(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={reset} className="btn-primary">
            🔄 Iniciar Nuevo Proceso
          </button>
        </div>
      )}

      {error && (
        <div className="card error">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={reset} className="btn-secondary">
            Reintentar
          </button>
        </div>
      )}

      {/* Info Cards */}
      <div className="card info-card">
        <h3>🎯 Ventajas de Field Mapping</h3>
        <ul>
          <li>✅ <strong>Mapeo selectivo:</strong> Envía solo los campos necesarios</li>
          <li>✅ <strong>Transformaciones:</strong> Convierte tipos automáticamente</li>
          <li>✅ <strong>Nombres diferentes:</strong> UI "amountStr" → BPM "amount"</li>
          <li>✅ <strong>Parámetros adicionales:</strong> Auditoría sin tocar el form</li>
          <li>✅ <strong>Campos calculados:</strong> approvalRequired basado en amount</li>
        </ul>
      </div>

      <div className="card comparison-card">
        <h3>📊 Sin Field Mapping vs Con Field Mapping</h3>
        <div className="comparison-grid">
          <div className="comparison-side">
            <h4>❌ Sin Field Mapping</h4>
            <pre className="code-block">{\\`// Construcción manual
const params = [
  { name: 'description',
    value: formData.description },
  { name: 'amount',
    value: parseFloat(formData.amountStr) },
  { name: 'category',
    value: formData.category },
  { name: 'urgent',
    value: formData.urgent },
  { name: 'requestedBy',
    value: user.username },
  { name: 'requestedDate',
    value: new Date().toISOString() },
  { name: 'status',
    value: 'Pending' },
  { name: 'approvalRequired',
    value: parseFloat(formData.amountStr) > 1000 },
  { name: 'source',
    value: 'CustomFormsShowcase' },
  { name: 'version',
    value: '2.0.0' }
]

await sdk.process.start({
  processName,
  parameters: params
}, token)\\`}</pre>
            <p className="code-note">~25 líneas, propenso a errores</p>
          </div>

          <div className="comparison-side">
            <h4>✅ Con Field Mapping</h4>
            <pre className="code-block">{\\`// Declarativo y conciso
await sdk.forms.startProcess({
  processName,
  formData,

  fieldMapping: {
    description: 'description',
    category: 'category',
    urgent: 'urgent',
    amountStr: {
      parameterName: 'amount',
      transform: parseFloat
    }
  },

  additionalParameters:
    sdk.forms.createParameters({
      requestedBy: user.username,
      requestedDate: new Date().toISOString(),
      status: 'Pending',
      approvalRequired:
        parseFloat(formData.amountStr) > 1000,
      source: 'CustomFormsShowcase',
      version: '2.0.0'
    }),

  token
})\\`}</pre>
            <p className="code-note">~15 líneas, más legible</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FieldMappingDemo;`,
              '/styles.css': `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  min-height: 100vh;
  padding: 20px;
}

.app-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-card h1 {
  color: white;
  font-size: 32px;
  margin-bottom: 8px;
}

.header-card .subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
}

.card h1 {
  color: #1a202c;
  font-size: 28px;
  margin-bottom: 8px;
}

.card h2 {
  color: #2d3748;
  font-size: 20px;
  margin-bottom: 16px;
}

.card h3 {
  color: #4a5568;
  font-size: 16px;
  margin-bottom: 12px;
}

.subtitle {
  color: #718096;
  font-size: 14px;
}

.info {
  background: #e0f2fe;
  border-left: 4px solid #0ea5e9;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  color: #075985;
  font-size: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.required {
  color: #e53e3e;
  margin-left: 4px;
}

.form-field input[type="text"],
.form-field select {
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-field input:focus,
.form-field select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.field-hint {
  font-size: 11px;
  color: #718096;
  font-style: italic;
}

.field-hint.transform {
  color: #7c3aed;
  font-weight: 600;
}

.additional-params-preview {
  background: #fef3c7;
  border: 2px solid #fbbf24;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
}

.additional-params-preview h3 {
  color: #92400e;
  font-size: 14px;
  margin-bottom: 12px;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.param-item {
  background: white;
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.param-item.calculated {
  background: #f0fdf4;
  border: 1px solid #86efac;
}

.param-name {
  font-size: 11px;
  font-weight: 600;
  color: #78350f;
}

.param-value {
  font-size: 13px;
  color: #1c1917;
  font-family: 'Courier New', monospace;
}

.calculated-badge {
  font-size: 9px;
  background: #22c55e;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  align-self: flex-start;
  margin-top: 2px;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.loading {
  text-align: center;
  padding: 40px;
  background: #f7fafc;
}

.spinner {
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success {
  border-left: 6px solid #48bb78;
}

.success h2 {
  color: #22543d;
}

.magic-banner {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.magic-banner h3 {
  color: #92400e;
  font-size: 18px;
  margin-bottom: 16px;
}

.magic-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.stat {
  background: white;
  border-radius: 8px;
  padding: 12px 24px;
}

.stat.highlight {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
}

.stat.highlight .stat-number {
  color: white;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.stat.highlight .stat-label {
  color: rgba(255, 255, 255, 0.9);
}

.stat-arrow {
  font-size: 28px;
  color: #f59e0b;
  font-weight: 700;
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.label {
  font-weight: 600;
  color: #4a5568;
}

.value {
  color: #2d3748;
  font-family: 'Courier New', monospace;
}

.parameters-sent {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.parameters-sent h3 {
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 12px;
}

.params-table {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.param-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  font-size: 12px;
}

.param-key {
  font-weight: 600;
  color: #374151;
}

.param-type {
  background: #e0e7ff;
  color: #3730a3;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
}

.param-val {
  font-family: 'Courier New', monospace;
  color: #059669;
  text-align: right;
}

.error {
  border-left: 6px solid #f56565;
}

.error h3 {
  color: #c53030;
}

.info-card {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 2px solid #60a5fa;
}

.info-card h3 {
  color: #1e40af;
  margin-bottom: 12px;
}

.info-card ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-card li {
  color: #1e3a8a;
  font-size: 14px;
  padding-left: 8px;
}

.info-card strong {
  color: #1e40af;
}

.comparison-card {
  background: #fafafa;
}

.comparison-card h3 {
  text-align: center;
  color: #1f2937;
  margin-bottom: 20px;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.comparison-side {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.comparison-side h4 {
  font-size: 14px;
  margin-bottom: 12px;
  text-align: center;
}

.code-block {
  background: #1e293b;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  font-size: 10px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  line-height: 1.5;
  margin-bottom: 8px;
}

.code-note {
  font-size: 11px;
  color: #6b7280;
  text-align: center;
  font-style: italic;
}`
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default function Example7FormSelective() {
  return (
    <RequireAuth>
      <Example7FormSelectiveContent />
    </RequireAuth>
  )
}
