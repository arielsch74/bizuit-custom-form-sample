/**
 * EJEMPLO 6: Obtener Datos de una Instancia
 *
 * Este ejemplo muestra cómo obtener información de una instancia de proceso existente.
 *
 * Casos de uso:
 * - Ver el estado actual de un proceso
 * - Obtener los valores de parámetros y variables
 * - Verificar si el proceso está bloqueado
 * - Preparar datos para continuar el proceso
 *
 * ¿Qué hace este código?
 * 1. Usuario ingresa un Instance ID
 * 2. El código obtiene todos los datos de esa instancia
 * 3. Muestra: estado, parámetros, variables, fecha de creación, etc.
 */

'use client'

import { useState } from 'react'
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'
import { Button, useBizuitAuth } from '@tyconsa/bizuit-ui-components'

export default function ObtenerDatosInstancia() {
  const sdk = useBizuitSDK()
  const { token } = useBizuitAuth()

  // Estados
  const [instanceId, setInstanceId] = useState('')
  const [instanceData, setInstanceData] = useState<any>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  /**
   * Obtener datos de la instancia
   */
  const handleGetInstanceData = async () => {
    if (!instanceId) {
      setError('Por favor ingresa un Instance ID')
      return
    }

    try {
      setStatus('loading')
      setError(null)

      console.log('📥 Obteniendo datos de instancia:', instanceId)

      // Llamar a la API de Bizuit para obtener los datos
      const data = await sdk.process.getInstanceData(instanceId, token)

      setInstanceData(data)
      setStatus('success')

      console.log('✅ Datos obtenidos:', data)
    } catch (err: any) {
      setError(`Error al obtener datos: ${err.message}`)
      setStatus('error')
      console.error('❌ Error:', err)
    }
  }

  /**
   * Extraer parámetros del response de la API
   * La estructura real es: results.tyconParameters.tyconParameter[]
   */
  const getParameters = () => {
    if (!instanceData?.results?.tyconParameters?.tyconParameter) {
      return []
    }
    return instanceData.results.tyconParameters.tyconParameter
  }

  /**
   * Filtrar parámetros por dirección
   */
  const filterByDirection = (direction: string) => {
    return getParameters().filter((p: any) => p.parameterDirection === direction)
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="border rounded-lg p-6 bg-card">
        <h1 className="text-3xl font-bold mb-6">Obtener Datos de Instancia</h1>

        {/* Formulario para ingresar Instance ID */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Instance ID *
            </label>
            <input
              type="text"
              value={instanceId}
              onChange={(e) => setInstanceId(e.target.value)}
              placeholder="Ej: 4a1da430-4188-4502-97a8-e15b009b7e6c"
              className="w-full px-3 py-2 border rounded-md bg-background font-mono text-sm"
              disabled={status === 'loading'}
            />
            <p className="text-xs text-muted-foreground mt-1">
              El Instance ID lo obtienes al iniciar un proceso o desde Bizuit BPM
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <Button
            onClick={handleGetInstanceData}
            disabled={!instanceId || status === 'loading'}
            className="w-full"
          >
            {status === 'loading' ? 'Obteniendo datos...' : 'Obtener Datos'}
          </Button>
        </div>

        {/* Mostrar datos de la instancia */}
        {status === 'success' && instanceData && (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <h2 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                ✅ Instancia Encontrada
              </h2>
              <p className="text-sm text-green-800 dark:text-green-200">
                Instance ID: <code className="font-mono">{instanceId}</code>
              </p>
            </div>

            {/* Información General */}
            <div className="border rounded-md p-4">
              <h3 className="font-semibold mb-3">📋 Información General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2 font-semibold">
                    {instanceData.results?.status || instanceData.status || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <span className="ml-2 font-mono text-xs">
                    {instanceData.results?.id || instanceId}
                  </span>
                </div>
              </div>
            </div>

            {/* Parámetros de Entrada */}
            {filterByDirection('In').length > 0 && (
              <div className="border rounded-md p-4">
                <h3 className="font-semibold mb-3">📥 Parámetros de Entrada (In)</h3>
                <div className="space-y-2">
                  {filterByDirection('In').map((param: any, index: number) => (
                    <div key={index} className="p-3 bg-muted rounded-md">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{param.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {param.parameterType}
                        </span>
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="text-muted-foreground">Valor:</span>
                        <code className="ml-2 text-xs">
                          {typeof param.value === 'object'
                            ? JSON.stringify(param.value)
                            : String(param.value || '(vacío)')}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parámetros de Salida */}
            {filterByDirection('Out').length > 0 && (
              <div className="border rounded-md p-4">
                <h3 className="font-semibold mb-3">📤 Parámetros de Salida (Out)</h3>
                <div className="space-y-2">
                  {filterByDirection('Out').map((param: any, index: number) => (
                    <div key={index} className="p-3 bg-muted rounded-md">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{param.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {param.parameterType}
                        </span>
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="text-muted-foreground">Valor:</span>
                        <code className="ml-2 text-xs">
                          {typeof param.value === 'object'
                            ? JSON.stringify(param.value)
                            : String(param.value || '(vacío)')}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parámetros Opcionales */}
            {filterByDirection('Optional').length > 0 && (
              <div className="border rounded-md p-4">
                <h3 className="font-semibold mb-3">⚙️ Parámetros Opcionales</h3>
                <div className="space-y-2">
                  {filterByDirection('Optional').map((param: any, index: number) => (
                    <div key={index} className="p-3 bg-muted rounded-md">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{param.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {param.parameterType}
                        </span>
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="text-muted-foreground">Valor:</span>
                        <code className="ml-2 text-xs">
                          {typeof param.value === 'object'
                            ? JSON.stringify(param.value)
                            : String(param.value || '(vacío)')}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Datos completos (JSON) */}
            <details className="border rounded-md p-4">
              <summary className="font-semibold cursor-pointer">
                🔍 Ver JSON Completo (Debug)
              </summary>
              <pre className="mt-3 text-xs bg-muted p-3 rounded-md overflow-auto max-h-96">
                {JSON.stringify(instanceData, null, 2)}
              </pre>
            </details>

            {/* Acciones */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setInstanceId('')
                  setInstanceData(null)
                  setStatus('idle')
                }}
                variant="outline"
                className="flex-1"
              >
                Consultar Otra Instancia
              </Button>
              <Button
                onClick={() => {
                  // Redirigir a continuar proceso con este instanceId
                  window.location.href = `/continue-process?instanceId=${instanceId}`
                }}
                className="flex-1"
              >
                Continuar Este Proceso
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Guía de ayuda */}
      <div className="mt-6 p-4 bg-muted rounded-md">
        <h3 className="font-semibold mb-2">💡 ¿Dónde obtengo el Instance ID?</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Al iniciar un proceso, Bizuit devuelve el Instance ID</li>
          <li>• Desde Bizuit BPM en la lista de instancias</li>
          <li>• Por parámetro URL cuando Bizuit te llama: <code>?instanceId=...</code></li>
          <li>• En los emails o notificaciones de Bizuit</li>
        </ul>
      </div>
    </div>
  )
}

/**
 * CÓMO USAR ESTE EJEMPLO:
 *
 * 1. Obtén un Instance ID válido (de un proceso que hayas iniciado)
 * 2. Pega el Instance ID en el campo
 * 3. Haz click en "Obtener Datos"
 * 4. Verás toda la información de la instancia
 *
 * USOS PRÁCTICOS:
 * ✅ Ver el estado actual de un proceso
 * ✅ Debugging: verificar valores de parámetros
 * ✅ Preparar datos para continuar un proceso
 * ✅ Auditoría: ver qué datos se enviaron al proceso
 */
