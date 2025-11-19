'use client'

import { useState } from 'react'
import { Button, BizuitCard, useTranslation } from '@tyconsa/bizuit-ui-components'
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
  const { t } = useTranslation()

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
          ← {t('ui.back')}
        </Link>
        <h1 className="text-4xl font-bold mb-2">Server-Side SDK</h1>
        <p className="text-gray-600 text-lg">
          Uso del SDK del lado del servidor con Next.js Server Actions
        </p>
      </div>

      <div className="space-y-8">
        {/* Sección informativa: ¿Cuándo usar Server-Side SDK? */}
        <BizuitCard
          title="📖 ¿Cuándo usar el SDK del lado del servidor?"
          description="Guía completa para decidir entre server-side y client-side SDK"
        >
          <div className="space-y-6">
            {/* ¿Qué es? */}
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                ¿Qué es el Server-Side SDK?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                El SDK de Bizuit funciona tanto en el navegador como en Node.js. Cuando usas <code className="bg-muted px-1 py-0.5 rounded text-xs">@tyconsa/bizuit-form-sdk/core</code>,
                obtienes una versión sin dependencias de React que es ideal para ejecutarse en el servidor con Next.js Server Actions, API Routes, o cualquier entorno Node.js.
              </p>
            </div>

            {/* Cuándo SÍ usar Server-Side */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">✅</span>
                Usa el SDK en el SERVIDOR cuando:
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span>🔒</span> Seguridad Crítica
                  </h4>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Ocultar credenciales API del cliente</li>
                    <li>• Trabajar con datos sensibles</li>
                    <li>• Lógica de negocio privada</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span>⚙️</span> Automatizaciones
                  </h4>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Cron jobs automáticos</li>
                    <li>• Workflows programados</li>
                    <li>• Procesos batch</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span>🔗</span> Integraciones
                  </h4>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Webhooks externos</li>
                    <li>• APIs públicas</li>
                    <li>• Sincronización con ERP/CRM</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span>⚡</span> Mejor Rendimiento
                  </h4>
                  <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Menor latencia de red</li>
                    <li>• Sin restricciones CORS</li>
                    <li>• Procesos pesados en servidor</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Cuándo NO usar Server-Side */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">❌</span>
                Usa el SDK en el CLIENTE cuando:
              </h3>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400">•</span>
                    <span><strong>Formularios interactivos:</strong> El usuario necesita ver/editar datos en tiempo real</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400">•</span>
                    <span><strong>Componentes UI de Bizuit:</strong> Quieres usar DynamicFormField, BizuitDataGrid, etc.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400">•</span>
                    <span><strong>Dashboards en tiempo real:</strong> Visualización dinámica del estado de procesos</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Ejemplos de casos de uso */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Ejemplos de Casos de Uso Reales
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <div>
                      <p className="font-semibold text-sm">Server-Side</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Sistema que crea solicitudes de compra automáticamente cuando el inventario baja de cierto nivel</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-sm">Client-Side</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Formulario web donde el usuario ingresa datos de una solicitud de vacaciones</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <div>
                      <p className="font-semibold text-sm">Server-Side</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Webhook que recibe confirmación de pago de Stripe y continúa el proceso de aprobación</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-sm">Client-Side</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Dashboard interactivo que muestra el estado de todos los procesos activos en tiempo real</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✅</span>
                    <div>
                      <p className="font-semibold text-sm">Server-Side</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">API pública que permite a clientes externos crear tickets de soporte en tu sistema BPM</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">❌</span>
                    <div>
                      <p className="font-semibold text-sm">Client-Side</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Formulario multi-paso con validaciones en tiempo real y preview de datos antes de enviar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BizuitCard>

        {/* Sección 1: Iniciar Proceso */}
        <BizuitCard
          title="1️⃣ Iniciar Proceso"
          description="Iniciar un proceso desde el servidor usando Server Actions"
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Parámetros (JSON)
              </label>
              <textarea
                value={startParams}
                onChange={(e) => setStartParams(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                rows={3}
                placeholder='{"nombre": "Juan", "edad": 30}'
              />
            </div>

            <Button
              onClick={handleStartProcess}
              disabled={startLoading}
              variant="default"
              className="w-full"
            >
              {startLoading ? 'Iniciando...' : 'Iniciar Proceso'}
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
          title="2️⃣ Obtener Datos de Instancia"
          description="Consultar el estado y datos de una instancia de proceso"
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
              />
            </div>

            <Button
              onClick={handleGetInstance}
              disabled={instanceLoading || !instanceId}
              variant="default"
              className="w-full"
            >
              {instanceLoading ? 'Consultando...' : 'Obtener Instancia'}
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
          title="3️⃣ Continuar Proceso"
          description="Completar una tarea pendiente y continuar el flujo"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Instance ID</label>
              <input
                type="text"
                value={continueInstanceId}
                onChange={(e) => setContinueInstanceId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Task ID</label>
              <input
                type="text"
                value={continueTaskId}
                onChange={(e) => setContinueTaskId(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="task-abc-123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Parámetros (JSON)
              </label>
              <textarea
                value={continueParams}
                onChange={(e) => setContinueParams(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                rows={3}
                placeholder='{"aprobado": true, "comentarios": "OK"}'
              />
            </div>

            <Button
              onClick={handleContinueProcess}
              disabled={continueLoading || !continueInstanceId || !continueTaskId}
              variant="default"
              className="w-full"
            >
              {continueLoading ? 'Continuando...' : 'Continuar Proceso'}
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
          title="💻 Código Server Actions"
          description="Implementación de las Server Actions usando el SDK del lado del servidor"
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
          title="💻 Código Cliente"
          description="Uso de las Server Actions desde un Client Component"
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
          title="🎯 Ventajas del Server-Side SDK"
          description="Por qué usar el SDK del lado del servidor"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold">Mayor Seguridad</h3>
                <p className="text-sm text-gray-600">
                  Las credenciales de autenticación nunca se exponen al cliente.
                  Todo se ejecuta en el servidor de forma segura.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-semibold">Mejor Rendimiento</h3>
                <p className="text-sm text-gray-600">
                  Conexión directa al backend de Bizuit sin pasar por el navegador,
                  reduciendo la latencia y el overhead de red.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🌐</span>
              <div>
                <h3 className="font-semibold">Sin Problemas de CORS</h3>
                <p className="text-sm text-gray-600">
                  Al ejecutarse en el servidor, no hay restricciones de CORS.
                  No necesitas configurar proxies o headers especiales.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🔧</span>
              <div>
                <h3 className="font-semibold">Integración Backend</h3>
                <p className="text-sm text-gray-600">
                  Ideal para workflows automáticos, integraciones con otros sistemas,
                  y APIs públicas que consumen Bizuit.
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
