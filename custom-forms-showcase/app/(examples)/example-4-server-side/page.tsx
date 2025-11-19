'use client'

import { useState } from 'react'
import { Button, BizuitCard } from '@tyconsa/bizuit-ui-components'
import { useAppTranslation } from '@/lib/useAppTranslation'
import Link from 'next/link'
import { startProcess, getInstance, continueProcess } from './actions'

/**
 * EJEMPLO 4: Server-Side SDK Usage
 *
 * Este ejemplo demuestra cómo usar el SDK de Bizuit del lado del servidor con Next.js Server Actions.
 *
 * ¿QUÉ ES EL SERVER-SIDE SDK?
 * ---------------------------
 * El SDK de Bizuit funciona tanto en el cliente (navegador) como en el servidor (Node.js).
 * Cuando usas '@tyconsa/bizuit-form-sdk/core', obtienes una versión sin dependencias de React
 * que es ideal para ejecutarse en el servidor.
 *
 * ¿CUÁNDO USAR EL SDK DEL LADO DEL SERVIDOR?
 * -----------------------------------------
 * Usa el SDK en el servidor cuando:
 *
 * 1. **Seguridad crítica:**
 *    - Necesitas ocultar credenciales API del cliente
 *    - Trabajas con datos sensibles que no deben pasar por el navegador
 *    - Implementas lógica de negocio que no debe ser visible en el código frontend
 *
 * 2. **Automatizaciones y procesos programados:**
 *    - Cron jobs que inician procesos automáticamente
 *    - Workflows que se ejecutan en respuesta a eventos del sistema
 *    - Tareas batch que procesan grandes volúmenes de datos
 *
 * 3. **Integraciones con otros sistemas:**
 *    - Webhooks que reciben eventos externos y crean procesos en Bizuit
 *    - APIs públicas que exponen funcionalidad de Bizuit a terceros
 *    - Sincronización de datos entre Bizuit y otros sistemas (ERP, CRM, etc.)
 *
 * 4. **Mejor rendimiento:**
 *    - El servidor está más cerca del backend de Bizuit (menos latencia)
 *    - No hay limitaciones de CORS
 *    - Procesos pesados no afectan la experiencia del usuario
 *
 * ¿CUÁNDO NO USAR EL SDK DEL LADO DEL SERVIDOR?
 * --------------------------------------------
 * Usa el SDK en el cliente cuando:
 * - Necesitas interacción en tiempo real con formularios
 * - El usuario debe ver/editar datos antes de enviar
 * - Quieres aprovechar componentes React de Bizuit UI
 *
 * EJEMPLO DE CASOS DE USO REALES:
 * -------------------------------
 * ✅ Server-Side: Sistema que crea solicitudes de compra automáticamente cuando el inventario baja
 * ✅ Server-Side: Webhook que recibe pagos de Stripe y continúa el proceso de aprobación
 * ✅ Server-Side: API pública que permite a clientes externos crear tickets de soporte
 * ❌ Client-Side: Formulario web donde el usuario ingresa datos de una solicitud de vacaciones
 * ❌ Client-Side: Dashboard interactivo que muestra el estado de procesos en tiempo real
 */
function Example4ServerSideContent() {
  const { t } = useAppTranslation()

  // Estado para iniciar proceso
  const [processName, setProcessName] = useState('DemoFlow')
  const [startParams, setStartParams] = useState('{"nombre": "Juan", "edad": 30}')
  const [startResult, setStartResult] = useState<any>(null)
  const [startLoading, setStartLoading] = useState(false)

  // Estado para obtener instancia
  const [instanceId, setInstanceId] = useState('')
  const [instanceData, setInstanceData] = useState<any>(null)
  const [instanceLoading, setInstanceLoading] = useState(false)

  // Estado para continuar proceso
  const [continueInstanceId, setContinueInstanceId] = useState('')
  const [continueTaskId, setContinueTaskId] = useState('')
  const [continueParams, setContinueParams] = useState('{"aprobado": true}')
  const [continueResult, setContinueResult] = useState<any>(null)
  const [continueLoading, setContinueLoading] = useState(false)

  // Handler: Iniciar proceso
  const handleStartProcess = async () => {
    try {
      setStartLoading(true)
      setStartResult(null)

      const params = JSON.parse(startParams)
      const result = await startProcess(processName, params)

      setStartResult(result)

      // Auto-llenar instanceId para los otros ejemplos
      if (result.success && result.data?.instanceId) {
        setInstanceId(result.data.instanceId)
        setContinueInstanceId(result.data.instanceId)
      }
    } catch (error: any) {
      setStartResult({
        success: false,
        error: error.message
      })
    } finally {
      setStartLoading(false)
    }
  }

  // Handler: Obtener instancia
  const handleGetInstance = async () => {
    try {
      setInstanceLoading(true)
      setInstanceData(null)

      const result = await getInstance(instanceId)
      setInstanceData(result)
    } catch (error: any) {
      setInstanceData({
        success: false,
        error: error.message
      })
    } finally {
      setInstanceLoading(false)
    }
  }

  // Handler: Continuar proceso
  const handleContinueProcess = async () => {
    try {
      setContinueLoading(true)
      setContinueResult(null)

      const params = JSON.parse(continueParams)
      const result = await continueProcess(continueInstanceId, continueTaskId, params)

      setContinueResult(result)
    } catch (error: any) {
      setContinueResult({
        success: false,
        error: error.message
      })
    } finally {
      setContinueLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← {t('example4.back')}
        </Link>
        <h1 className="text-4xl font-bold mb-2">{t('example4.title')}</h1>
        <p className="text-gray-600 text-lg">
          {t('example4.subtitle')}
        </p>
      </div>

      <div className="space-y-8">
        {/* Sección informativa: ¿Cuándo usar Server-Side SDK? */}
        <BizuitCard
          title={`📖 ${t('example4.infoTitle')}`}
          description={t('example4.infoSubtitle')}
        >
          <div className="space-y-6">
            {/* ¿Qué es? */}
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                {t('example4.whatIsTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('example4.whatIsDesc')}
              </p>
            </div>

            {/* Cuándo SÍ usar Server-Side */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">✅</span>
                {t('example4.useServerTitle')}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span>🔒</span> {t('example4.security')}
                  </h4>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    {(t('example4.securityItems') as string[]).map((item: string, i: number) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span>⚙️</span> {t('example4.automations')}
                  </h4>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    {(t('example4.automationsItems') as string[]).map((item: string, i: number) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span>🔗</span> {t('example4.integrations')}
                  </h4>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    {(t('example4.integrationsItems') as string[]).map((item: string, i: number) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span>⚡</span> {t('example4.performance')}
                  </h4>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    {(t('example4.performanceItems') as string[]).map((item: string, i: number) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Cuándo NO usar Server-Side */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">❌</span>
                {t('example4.useClientTitle')}
              </h3>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400">•</span>
                    <span><strong>{t('example4.interactiveForms')}</strong> {t('example4.interactiveFormsDesc')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400">•</span>
                    <span><strong>{t('example4.reactComponents')}</strong> {t('example4.reactComponentsDesc')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400">•</span>
                    <span><strong>{t('example4.realTimeValidation')}</strong> {t('example4.realTimeValidationDesc')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Ejemplos de casos de uso */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                {t('example4.examplesTitle')}
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <div>
                      <p className="font-semibold text-sm">{t('example4.serverSide')}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{t('example4.example1Server')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-sm">{t('example4.clientSide')}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{t('example4.example1Client')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <div>
                      <p className="font-semibold text-sm">{t('example4.serverSide')}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{t('example4.example2Server')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-sm">{t('example4.clientSide')}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{t('example4.example2Client')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <div>
                      <p className="font-semibold text-sm">{t('example4.serverSide')}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{t('example4.example3Server')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-sm">{t('example4.clientSide')}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{t('example4.example3Client')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BizuitCard>

        {/* Sección 1: Iniciar Proceso */}
        <BizuitCard
          title={`1️⃣ ${t('example4.demo1Title')}`}
          description={t('example4.demo1Subtitle')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('example4.processName')}</label>
              <input
                type="text"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder={t('example4.processNamePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('example4.parameters')}
              </label>
              <textarea
                value={startParams}
                onChange={(e) => setStartParams(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                rows={3}
                placeholder={t('example4.parametersPlaceholder')}
              />
            </div>

            <Button
              onClick={handleStartProcess}
              disabled={startLoading}
              variant="default"
              className="w-full"
            >
              {startLoading ? `${t('example4.startProcess')}...` : t('example4.startProcess')}
            </Button>

            {startResult && (
              <div className={`p-4 rounded-md ${startResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(startResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </BizuitCard>

        {/* Sección 2: Obtener Instancia */}
        <BizuitCard
          title={`2️⃣ ${t('example4.demo2Title')}`}
          description={t('example4.demo2Subtitle')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('example4.instanceId')}</label>
              <input
                type="text"
                value={instanceId}
                onChange={(e) => setInstanceId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder={t('example4.instanceIdPlaceholder')}
              />
            </div>

            <Button
              onClick={handleGetInstance}
              disabled={instanceLoading || !instanceId}
              variant="default"
              className="w-full"
            >
              {instanceLoading ? `${t('example4.getInstance')}...` : t('example4.getInstance')}
            </Button>

            {instanceData && (
              <div className={`p-4 rounded-md ${instanceData.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <pre className="text-sm overflow-auto max-h-96">
                  {JSON.stringify(instanceData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </BizuitCard>

        {/* Sección 3: Continuar Proceso */}
        <BizuitCard
          title={`3️⃣ ${t('example4.demo3Title')}`}
          description={t('example4.demo3Subtitle')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('example4.instanceId')}</label>
              <input
                type="text"
                value={continueInstanceId}
                onChange={(e) => setContinueInstanceId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder={t('example4.instanceIdPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('example4.taskId')}</label>
              <input
                type="text"
                value={continueTaskId}
                onChange={(e) => setContinueTaskId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder={t('example4.taskIdPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('example4.parameters')}
              </label>
              <textarea
                value={continueParams}
                onChange={(e) => setContinueParams(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                rows={3}
                placeholder={t('example4.parametersPlaceholder')}
              />
            </div>

            <Button
              onClick={handleContinueProcess}
              disabled={continueLoading || !continueInstanceId || !continueTaskId}
              variant="default"
              className="w-full"
            >
              {continueLoading ? `${t('example4.continueProcess')}...` : t('example4.continueProcess')}
            </Button>

            {continueResult && (
              <div className={`p-4 rounded-md ${continueResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(continueResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </BizuitCard>

        {/* Código de ejemplo - Server Actions */}
        <BizuitCard
          title={`💻 ${t('example4.serverSideCode')}`}
          description={t('example4.codeSubtitle')}
        >
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm"><code>{`'use server'

import { BizuitSDK } from '@tyconsa/bizuit-form-sdk/core'

// Inicializar SDK con configuración del servidor
const sdk = new BizuitSDK({
  apiUrl: process.env.BIZUIT_API_URL || 'http://localhost:8000',
  timeout: 30000
})

const credentials = {
  username: process.env.BIZUIT_USERNAME || 'admin',
  password: process.env.BIZUIT_PASSWORD || 'admin123'
}

// 1️⃣ Iniciar un proceso
export async function startProcess(
  processName: string,
  parameters: Record<string, any>
) {
  const authResponse = await sdk.auth.login(
    credentials.username,
    credentials.password
  )
  const token = authResponse.data?.token

  const response = await sdk.process.start({
    processName,
    parameters
  }, undefined, token)

  return { success: true, data: response }
}

// 2️⃣ Obtener datos de una instancia
export async function getInstance(instanceId: string) {
  const authResponse = await sdk.auth.login(
    credentials.username,
    credentials.password
  )
  const token = authResponse.data?.token

  const instance = await sdk.process.getInstance(instanceId, token)

  return { success: true, data: instance }
}

// 3️⃣ Continuar un proceso
export async function continueProcess(
  instanceId: string,
  taskId: string,
  parameters: Record<string, any>
) {
  const authResponse = await sdk.auth.login(
    credentials.username,
    credentials.password
  )
  const token = authResponse.data?.token

  const response = await sdk.process.continue({
    instanceId,
    taskId,
    parameters
  }, token)

  return { success: true, data: response }
}`}</code></pre>
          </div>
        </BizuitCard>

        {/* Código de ejemplo - Cliente */}
        <BizuitCard
          title={`💻 ${t('example4.clientSideCode')}`}
          description={t('example4.codeSubtitle')}
        >
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm"><code>{`'use client'

import { useState } from 'react'
import { Button } from '@tyconsa/bizuit-ui-components'
import { startProcess, getInstance, continueProcess } from './actions'

export default function ServerSideExample() {
  const [processName, setProcessName] = useState('DemoFlow')
  const [params, setParams] = useState('{"nombre": "Juan"}')
  const [result, setResult] = useState(null)

  const handleStart = async () => {
    const parameters = JSON.parse(params)
    const result = await startProcess(processName, parameters)
    setResult(result)
  }

  return (
    <div>
      <input
        value={processName}
        onChange={(e) => setProcessName(e.target.value)}
      />
      <textarea
        value={params}
        onChange={(e) => setParams(e.target.value)}
      />
      <Button onClick={handleStart}>
        Iniciar Proceso
      </Button>
      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  )
}`}</code></pre>
          </div>
        </BizuitCard>

        {/* Ventajas del Server-Side SDK */}
        <BizuitCard
          title={`🎯 ${t('example4.keyPointsTitle')}`}
          description={t('example4.keyPointsTitle')}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold">{t('example4.keyPoint2')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('example4.keyPoint2Desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-semibold">{t('example4.keyPoint3')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('example4.keyPoint3Desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🚀</span>
              <div>
                <h3 className="font-semibold">{t('example4.keyPoint1')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('example4.keyPoint1Desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🔧</span>
              <div>
                <h3 className="font-semibold">{t('example4.keyPoint4')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('example4.keyPoint4Desc')}
                </p>
              </div>
            </div>
          </div>
        </BizuitCard>
      </div>
    </div>
  )
}

export default function Example4ServerSide() {
  return <Example4ServerSideContent />
}
