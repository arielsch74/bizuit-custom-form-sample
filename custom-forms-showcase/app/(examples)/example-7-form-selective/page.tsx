'use client'

import { useState } from 'react'
import { useBizuitSDK, type IBizuitProcessParameter } from '@tyconsa/bizuit-form-sdk'
import { DynamicFormField, Button, useBizuitAuth, useTranslation, BizuitCard } from '@tyconsa/bizuit-ui-components'
import { RequireAuth } from '@/components/require-auth'
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

      const prepared = await sdk.form.prepareStartForm({
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
      const response = await sdk.form.startProcess({
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
        additionalParameters: sdk.form.createParameters({
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
const response = await sdk.form.startProcess({
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
  additionalParameters: sdk.form.createParameters({
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
const response = await sdk.form.startProcess({
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

  additionalParameters: sdk.form.createParameters({
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
additionalParameters: sdk.form.createParameters({
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
