'use client'

import { useState } from 'react'
import { useBizuitSDK, type IBizuitProcessParameter } from '@tyconsa/bizuit-form-sdk'
import { DynamicFormField, Button, useBizuitAuth, useTranslation, BizuitCard } from '@tyconsa/bizuit-ui-components'
import { RequireAuth } from '@/components/require-auth'
import Link from 'next/link'

/**
 * EJEMPLO 6: Form Service - Continue Process with Lock Management
 *
 * Este ejemplo demuestra cómo usar el FormService para:
 * 1. Preparar un formulario de continuación con lock automático (prepareContinueForm)
 * 2. Continuar un proceso enviando TODOS los campos (continueProcess)
 * 3. Liberar locks automáticamente (releaseLock)
 *
 * VENTAJAS DEL FORM SERVICE PARA CONTINUE:
 * =========================================
 * ✅ Manejo automático de locks de instancia
 * ✅ Carga de datos de instancia + parámetros en una sola llamada
 * ✅ Conversión automática de formData a parámetros
 * ✅ Helper para liberar locks fácilmente
 *
 * VS. PROCESS SERVICE (Ejemplo 2/3):
 * ===================================
 * Process Service requiere:
 * - Llamar a getInstance() manualmente
 * - Extraer datos de variables manualmente
 * - Llamar a acquireLock() y releaseLock() manualmente
 * - Convertir formData a parámetros manualmente
 * - Más código y control manual de cada paso
 */
function Example6FormContinueContent() {
  const { t } = useTranslation()
  const sdk = useBizuitSDK()
  const { token } = useBizuitAuth()

  const [instanceId, setInstanceId] = useState('')
  const [processName, setProcessName] = useState('DemoFlow')
  const [parameters, setParameters] = useState<IBizuitProcessParameter[]>([])
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [lockInfo, setLockInfo] = useState<any>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  // Paso 1: Preparar formulario de continuación con lock
  const handlePrepareForm = async () => {
    try {
      setStatus('loading')
      setError(null)
      setResult(null)

      console.log('📋 [FormService] Preparando formulario de continuación:', {
        instanceId,
        processName
      })

      // ✨ FormService.prepareContinueForm() hace TODO:
      // - Llama a getInstance() internamente
      // - Adquiere lock automáticamente (si autoLock: true)
      // - Extrae variables y parámetros
      // - Prepara formData con valores actuales
      const prepared = await sdk.form.prepareContinueForm({
        instanceId,
        processName,
        autoLock: true, // ✨ Lock automático
        token
      })

      console.log('✅ [FormService] Formulario preparado:', {
        parametersCount: prepared.parameters.length,
        lockAcquired: !!prepared.lockInfo,
        sessionToken: prepared.lockInfo?.sessionToken
      })

      setParameters(prepared.parameters)
      setFormData(prepared.formData)
      setLockInfo(prepared.lockInfo)
      setStatus('ready')
    } catch (error: any) {
      console.error('❌ Error preparando formulario:', error)
      setError(error.message || 'Error al preparar formulario')
      setStatus('error')
    }
  }

  // Paso 2: Continuar proceso
  const handleSubmit = async () => {
    try {
      setStatus('submitting')
      setError(null)

      console.log('📤 [FormService] Continuando proceso:', {
        instanceId,
        processName,
        formData
      })

      // ✨ FormService.continueProcess() simplifica:
      // - Convierte formData a parámetros automáticamente
      // - Envía todo en una sola llamada
      const response = await sdk.form.continueProcess({
        instanceId,
        processName,
        formData, // ✨ TODOS los campos automáticamente
        token
      })

      console.log('✅ [FormService] Proceso continuado:', response)

      setResult(response)
      setStatus('success')

      // Liberar lock automáticamente después del éxito
      if (lockInfo?.sessionToken) {
        await handleReleaseLock()
      }
    } catch (error: any) {
      console.error('❌ Error continuando proceso:', error)
      setError(error.message || 'Error al continuar proceso')
      setStatus('error')
    }
  }

  // Liberar lock manualmente
  const handleReleaseLock = async () => {
    if (!lockInfo?.sessionToken) return

    try {
      console.log('🔓 [FormService] Liberando lock...')

      await sdk.form.releaseLock({
        instanceId,
        activityName: lockInfo.activityName || 'default',
        sessionToken: lockInfo.sessionToken,
        token
      })

      console.log('✅ [FormService] Lock liberado')
      setLockInfo(null)
    } catch (error: any) {
      console.error('❌ Error liberando lock:', error)
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
        <h1 className="text-4xl font-bold mb-2">Form Service - Continue Process</h1>
        <p className="text-gray-600 text-lg">
          API de alto nivel para continuar procesos con manejo automático de locks
        </p>
      </div>

      <div className="space-y-8">
        {/* Info Card */}
        <BizuitCard
          title="🔒 Lock Management con FormService"
          description="Manejo automático de locks de instancia"
        >
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">✨ Ventajas del FormService para Continue</h3>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
              <li>• <strong>prepareContinueForm()</strong> con <code className="text-xs bg-muted px-1 rounded">autoLock: true</code> adquiere el lock automáticamente</li>
              <li>• Carga datos de instancia + parámetros en UNA sola llamada</li>
              <li>• <strong>continueProcess()</strong> convierte formData → parámetros automáticamente</li>
              <li>• <strong>releaseLock()</strong> helper simple para liberar locks</li>
              <li>• Menos código que ProcessService (Ejemplo 2/3)</li>
            </ul>
          </div>
        </BizuitCard>

        {/* Paso 1: Cargar instancia */}
        <BizuitCard
          title="1️⃣ Cargar Instancia"
          description="Prepara el formulario con FormService.prepareContinueForm()"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Instance ID</label>
              <input
                type="text"
                value={instanceId}
                onChange={(e) => setInstanceId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="12345"
                disabled={status === 'loading' || status === 'ready'}
              />
            </div>

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
              disabled={status === 'loading' || status === 'ready' || !instanceId || !processName}
              variant="primary"
              className="w-full"
            >
              {status === 'loading' ? 'Cargando...' : 'Cargar Formulario'}
            </Button>

            {lockInfo && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">🔒 Lock Adquirido</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Session Token: <code className="bg-muted px-1 rounded">{lockInfo.sessionToken?.substring(0, 20)}...</code>
                </p>
              </div>
            )}

            {error && status === 'error' && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        </BizuitCard>

        {/* Paso 2: Formulario */}
        {status === 'ready' && parameters.length > 0 && (
          <BizuitCard
            title="2️⃣ Editar Datos"
            description={`${parameters.length} campos cargados con valores actuales de la instancia`}
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

              <div className="pt-4 border-t flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={status === 'submitting'}
                  variant="primary"
                  className="flex-1"
                >
                  {status === 'submitting' ? 'Continuando...' : 'Continuar Proceso'}
                </Button>

                {lockInfo && (
                  <Button
                    onClick={handleReleaseLock}
                    variant="secondary"
                    className="px-6"
                  >
                    🔓 Liberar Lock
                  </Button>
                )}
              </div>
            </div>
          </BizuitCard>
        )}

        {/* Resultado */}
        {result && (
          <BizuitCard
            title="✅ Proceso Continuado Exitosamente"
            description="Resultado de FormService.continueProcess()"
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
          title="💻 Código - FormService Continue"
          description="Manejo simplificado de continue + locks"
        >
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm"><code>{`// 1️⃣ Preparar formulario con lock automático
const { parameters, formData, lockInfo } =
  await sdk.form.prepareContinueForm({
    instanceId: '123-456',
    processName: 'ExpenseRequest',
    autoLock: true, // ✨ Adquiere lock automáticamente
    token
  })

// FormService hace automáticamente:
// - getInstance(instanceId, token)
// - acquireLock(instanceId, activityName, token)
// - Extrae variables y parámetros
// - Convierte a formData

// 2️⃣ Continuar proceso
const result = await sdk.form.continueProcess({
  instanceId,
  processName,
  formData, // ✨ Conversión automática
  token
})

// 3️⃣ Liberar lock
await sdk.form.releaseLock({
  instanceId,
  activityName: lockInfo.activityName,
  sessionToken: lockInfo.sessionToken,
  token
})`}</code></pre>
          </div>
        </BizuitCard>
      </div>
    </div>
  )
}

export default function Example6FormContinue() {
  return (
    <RequireAuth>
      <Example6FormContinueContent />
    </RequireAuth>
  )
}
