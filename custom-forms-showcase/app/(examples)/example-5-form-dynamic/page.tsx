'use client'

import { useState } from 'react'
import { useBizuitSDK, type IBizuitProcessParameter } from '@tyconsa/bizuit-form-sdk'
import { DynamicFormField, Button, useBizuitAuth, useTranslation, BizuitCard } from '@tyconsa/bizuit-ui-components'
import { RequireAuth } from '@/components/require-auth'
import Link from 'next/link'

/**
 * EJEMPLO 5: Form Service - Dynamic Form (High-Level API)
 *
 * Este ejemplo demuestra cómo usar el FormService (API de alto nivel) para:
 * 1. Preparar un formulario de inicio (prepareStartForm)
 * 2. Iniciar un proceso enviando TODOS los campos automáticamente (startProcess)
 *
 * DIFERENCIAS CON PROCESS SERVICE (Ejemplo 1):
 * ===============================================
 *
 * Process Service (Ejemplo 1 - Bajo Nivel):
 * - Más control manual sobre cada paso
 * - Requieres llamar a getParameters() manualmente
 * - Construyes los parámetros con formDataToParameters()
 * - Llamas a process.start() directamente
 * - Más código, más flexibilidad
 *
 * Form Service (Este Ejemplo - Alto Nivel):
 * - API simplificada con métodos que encapsulan workflows comunes
 * - prepareStartForm() obtiene parámetros Y prepara formData automáticamente
 * - startProcess() maneja la conversión de campos a parámetros
 * - Menos código, casos de uso comunes cubiertos
 * - Helpers adicionales (createParameters, field mapping, locks)
 *
 * CUÁNDO USAR FORM SERVICE:
 * =========================
 * ✅ Formularios estándar de inicio/continuación de procesos
 * ✅ Necesitas mapeo selectivo de campos a parámetros
 * ✅ Quieres agregar parámetros adicionales (usuario, fecha, etc.)
 * ✅ Trabajas con locks de instancia
 * ✅ Prefieres menos código boilerplate
 *
 * CUÁNDO USAR PROCESS SERVICE:
 * ============================
 * ✅ Necesitas control total sobre el flujo
 * ✅ Casos de uso no estándar (ej: iniciar múltiples procesos en paralelo)
 * ✅ Integraciones complejas con lógica personalizada
 * ✅ Optimizaciones específicas de rendimiento
 */
function Example5FormDynamicContent() {
  const { t } = useTranslation()
  const sdk = useBizuitSDK()
  const { token } = useBizuitAuth()

  const [processName, setProcessName] = useState('DemoFlow')
  const [parameters, setParameters] = useState<IBizuitProcessParameter[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  // Paso 1: Preparar formulario usando FormService (Alto Nivel)
  const handlePrepareForm = async () => {
    try {
      setStatus('loading')
      setError(null)
      setResult(null)

      console.log('📋 [FormService] Preparando formulario para:', processName)

      // ✨ FormService.prepareStartForm() hace TODO en una sola llamada:
      // - Llama a process.initialize() internamente
      // - Filtra parámetros de entrada
      // - Prepara formData con valores por defecto
      const prepared = await sdk.form.prepareStartForm({
        processName,
        token
      })

      console.log('✅ [FormService] Formulario preparado:', {
        parametersCount: prepared.parameters.length,
        formDataKeys: Object.keys(prepared.formData)
      })

      setParameters(prepared.parameters)
      setFormData(prepared.formData)
      setStatus('ready')
    } catch (error: any) {
      console.error('❌ Error preparando formulario:', error)
      setError(error.message || 'Error al preparar formulario')
      setStatus('error')
    }
  }

  // Paso 2: Enviar formulario usando FormService (Alto Nivel)
  const handleSubmit = async () => {
    try {
      setStatus('submitting')
      setError(null)

      console.log('📤 [FormService] Iniciando proceso con formData:', formData)

      // ✨ FormService.startProcess() simplifica el envío:
      // - Convierte formData a parámetros automáticamente
      // - No necesitas llamar a formDataToParameters()
      // - Maneja files, parámetros adicionales, etc.
      const response = await sdk.form.startProcess({
        processName,
        formData, // ✨ Envía TODOS los campos automáticamente
        token
      })

      console.log('✅ [FormService] Proceso iniciado:', response)

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
        <h1 className="text-4xl font-bold mb-2">Form Service - Dynamic Form</h1>
        <p className="text-gray-600 text-lg">
          API de alto nivel para formularios dinámicos con todos los campos
        </p>
      </div>

      <div className="space-y-8">
        {/* Info Card: Qué es FormService */}
        <BizuitCard
          title="ℹ️ ¿Qué es Form Service?"
          description="API de alto nivel que simplifica workflows comunes de formularios"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">✨ FormService vs ProcessService</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-green-600 dark:text-green-400 mb-2">✅ FormService (Este ejemplo)</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• <code className="text-xs bg-muted px-1 rounded">prepareStartForm()</code> - Todo en una llamada</li>
                    <li>• <code className="text-xs bg-muted px-1 rounded">startProcess(formData)</code> - Conversión automática</li>
                    <li>• Menos código, casos comunes cubiertos</li>
                    <li>• Helpers para field mapping y locks</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-amber-600 dark:text-amber-400 mb-2">⚙️ ProcessService (Ejemplo 1)</p>
                  <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• <code className="text-xs bg-muted px-1 rounded">getParameters()</code> + manual filtering</li>
                    <li>• <code className="text-xs bg-muted px-1 rounded">formDataToParameters()</code> + <code className="text-xs bg-muted px-1 rounded">start()</code></li>
                    <li>• Más código, control total</li>
                    <li>• Para casos avanzados/no estándar</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </BizuitCard>

        {/* Paso 1: Seleccionar proceso */}
        <BizuitCard
          title="1️⃣ Seleccionar Proceso"
          description="Elige el proceso y prepara el formulario con FormService.prepareStartForm()"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre del Proceso</label>
              <input
                type="text"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="DemoFlow"
                disabled={status === 'loading' || status === 'ready'}
              />
            </div>

            <Button
              onClick={handlePrepareForm}
              disabled={status === 'loading' || status === 'ready' || !processName}
              variant="primary"
              className="w-full"
            >
              {status === 'loading' ? 'Cargando...' : 'Cargar Formulario'}
            </Button>

            {error && status === 'error' && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        </BizuitCard>

        {/* Paso 2: Formulario dinámico */}
        {status === 'ready' && parameters.length > 0 && (
          <BizuitCard
            title="2️⃣ Completar Formulario"
            description={`${parameters.length} campos cargados dinámicamente desde el proceso`}
          >
            <div className="space-y-4">
              {parameters.map((param) => (
                <DynamicFormField
                  key={param.name}
                  parameter={param}
                  value={formData[param.name]}
                  onChange={(value) => handleFieldChange(param.name, value)}
                />
              ))}

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

        {/* Resultado */}
        {result && (
          <BizuitCard
            title="✅ Proceso Iniciado Exitosamente"
            description="Resultado de FormService.startProcess()"
          >
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </BizuitCard>
        )}

        {/* Código de ejemplo */}
        <BizuitCard
          title="💻 Código - FormService (Alto Nivel)"
          description="Mucho menos código que ProcessService gracias a los helpers"
        >
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm"><code>{`// 1️⃣ Preparar formulario (TODO en una llamada)
const { parameters, formData } = await sdk.form.prepareStartForm({
  processName: 'DemoFlow',
  token
})

// FormService hace automáticamente:
// - await sdk.process.initialize({ processName, token })
// - Filtra parámetros de entrada
// - Convierte parámetros a formData con defaults

// 2️⃣ Iniciar proceso (conversión automática de formData)
const result = await sdk.form.startProcess({
  processName: 'DemoFlow',
  formData, // ✨ TODOS los campos se envían automáticamente
  token
})

// FormService hace automáticamente:
// - const params = formDataToParameters(formData)
// - await sdk.process.start({ processName, parameters: params }, token)
`}</code></pre>
          </div>
        </BizuitCard>

        {/* Comparación con ProcessService */}
        <BizuitCard
          title="📊 Comparación: FormService vs ProcessService"
          description="Mismo resultado, menos código"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-green-600 dark:text-green-400">✅ FormService (Este ejemplo)</h3>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-xs">
                <pre>{`// Solo 2 llamadas
const prepared = await sdk.form
  .prepareStartForm({
    processName,
    token
  })

const result = await sdk.form
  .startProcess({
    processName,
    formData,
    token
  })`}</pre>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                📏 ~15 líneas de código
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-amber-600 dark:text-amber-400">⚙️ ProcessService (Ejemplo 1)</h3>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-xs">
                <pre>{`// Múltiples pasos manuales
const params = await sdk.process
  .getParameters(processName, '', token)

const inputParams = params.filter(p =>
  !p.isSystemParameter &&
  (p.direction === 'In' ||
   p.direction === 'Optional')
)

const formData = {}
inputParams.forEach(p => {
  formData[p.name] = p.value
})

const allParams = formDataToParameters(
  formData
)

const result = await sdk.process
  .start({
    processName,
    parameters: allParams
  }, undefined, token)`}</pre>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                📏 ~30 líneas de código
              </p>
            </div>
          </div>
        </BizuitCard>
      </div>
    </div>
  )
}

export default function Example5FormDynamic() {
  return (
    <RequireAuth>
      <Example5FormDynamicContent />
    </RequireAuth>
  )
}
