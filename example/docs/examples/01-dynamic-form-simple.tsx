/**
 * EJEMPLO 1: Formulario Dinámico Simple
 *
 * Este es el ejemplo MÁS FÁCIL para iniciar un proceso en Bizuit.
 * Genera automáticamente el formulario basándose en la definición del proceso.
 *
 * Ideal para: Prototipos rápidos, procesos simples, desarrolladores junior
 *
 * ¿Qué hace este código?
 * 1. Usuario ingresa el nombre del proceso
 * 2. El código obtiene los parámetros automáticamente
 * 3. Genera campos de formulario según los tipos de parámetros
 * 4. Usuario llena el formulario
 * 5. Se inicia el proceso con los datos
 */

'use client'

import { useState } from 'react'
import {
  useBizuitSDK,
  filterFormParameters,
  formDataToParameters,
  type IBizuitProcessParameter
} from '@tyconsa/bizuit-form-sdk'
import {
  DynamicFormField,
  Button,
  ProcessSuccessScreen,
  useBizuitAuth
} from '@tyconsa/bizuit-ui-components'

export default function FormularioDinamicoSimple() {
  const sdk = useBizuitSDK()
  const { token } = useBizuitAuth() // Token del usuario logueado

  // Estados
  const [processName, setProcessName] = useState('') // Nombre del proceso a iniciar
  const [parameters, setParameters] = useState<IBizuitProcessParameter[]>([]) // Parámetros del proceso
  const [formData, setFormData] = useState<any>({}) // Datos del formulario
  const [processData, setProcessData] = useState<any>(null) // Resultado del proceso
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  /**
   * PASO 1: Cargar los parámetros del proceso
   * Esto se ejecuta cuando el usuario hace click en "Cargar Proceso"
   */
  const handleLoadProcess = async () => {
    if (!processName) {
      setError('Por favor ingresa el nombre del proceso')
      return
    }

    try {
      setStatus('loading')
      setError(null)

      // Llamar a la API de Bizuit para obtener los parámetros
      const allParameters = await sdk.process.getProcessParameters(
        processName,  // Nombre del proceso (ej: "samplewebpages")
        '',          // Versión (vacío = última versión)
        token        // Token de autenticación
      )

      // Filtrar solo los parámetros que el usuario debe llenar
      // Esto excluye: parámetros de salida, variables, parámetros del sistema
      const editableParams = filterFormParameters(allParameters)

      setParameters(editableParams)
      setStatus('ready')

      console.log('✅ Parámetros cargados:', editableParams)
    } catch (err: any) {
      setError(`Error al cargar el proceso: ${err.message}`)
      setStatus('error')
      console.error('❌ Error:', err)
    }
  }

  /**
   * PASO 2: Enviar el formulario e iniciar el proceso
   * Esto se ejecuta cuando el usuario hace click en "Iniciar Proceso"
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setStatus('submitting')
      setError(null)

      // Convertir los datos del formulario al formato que espera Bizuit
      const parameters = formDataToParameters(formData)

      console.log('📤 Iniciando proceso con parámetros:', parameters)

      // Llamar a la API de Bizuit para iniciar el proceso
      const result = await sdk.process.raiseEvent(
        {
          eventName: processName,   // Nombre del proceso
          parameters: parameters,   // Parámetros convertidos
        },
        [],                        // Archivos adjuntos (ninguno en este ejemplo)
        token                     // Token de autenticación
      )

      setProcessData(result)
      setStatus('success')

      console.log('✅ Proceso iniciado exitosamente!')
      console.log('Instance ID:', result.instanceId)
      console.log('Status:', result.status)
    } catch (err: any) {
      setError(`Error al iniciar el proceso: ${err.message}`)
      setStatus('error')
      console.error('❌ Error:', err)
    }
  }

  /**
   * Resetear el formulario para iniciar otro proceso
   */
  const handleReset = () => {
    setProcessName('')
    setParameters([])
    setFormData({})
    setProcessData(null)
    setStatus('idle')
    setError(null)
  }

  // ========================================
  // RENDERIZADO
  // ========================================

  // Pantalla de éxito
  if (status === 'success') {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <ProcessSuccessScreen
          processData={processData}
          title="¡Proceso Iniciado Exitosamente!"
          subtitle={`El proceso "${processName}" se creó correctamente`}
          onNewProcess={handleReset}
          onBackToHome={() => window.location.href = '/'}
        />
      </div>
    )
  }

  // Pantalla principal
  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="border rounded-lg p-6 bg-card">
        <h1 className="text-3xl font-bold mb-6">Formulario Dinámico Simple</h1>

        {/* PASO 1: Ingresar nombre del proceso */}
        {status === 'idle' || status === 'loading' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre del Proceso *
              </label>
              <input
                type="text"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                placeholder="Ej: samplewebpages"
                className="w-full px-3 py-2 border rounded-md bg-background"
                disabled={status === 'loading'}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Este es el nombre del proceso definido en Bizuit BPM
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              onClick={handleLoadProcess}
              disabled={!processName || status === 'loading'}
              className="w-full"
            >
              {status === 'loading' ? 'Cargando...' : 'Cargar Proceso'}
            </Button>

            <div className="mt-6 p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>💡 Tip:</strong> El formulario se generará automáticamente
                basándose en los parámetros del proceso.
              </p>
            </div>
          </div>
        ) : null}

        {/* PASO 2: Mostrar formulario generado dinámicamente */}
        {status === 'ready' || status === 'submitting' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Proceso:</strong> {processName} <br />
                <strong>Parámetros encontrados:</strong> {parameters.length}
              </p>
            </div>

            {/* Renderizar campos dinámicamente */}
            {parameters.length > 0 ? (
              parameters.map((param) => (
                <DynamicFormField
                  key={param.name}
                  parameter={param}
                  value={formData[param.name]}
                  onChange={(value) => {
                    setFormData({ ...formData, [param.name]: value })
                  }}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Este proceso no tiene parámetros de entrada.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={status === 'submitting'}
                className="flex-1"
              >
                {status === 'submitting' ? 'Iniciando...' : 'Iniciar Proceso'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={status === 'submitting'}
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : null}
      </div>

      {/* Información de debug (solo para desarrollo) */}
      {process.env.NODE_ENV === 'development' && formData && Object.keys(formData).length > 0 && (
        <div className="mt-4 p-4 bg-muted rounded-md">
          <p className="text-xs font-medium mb-2">Debug - Datos del formulario:</p>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

/**
 * CÓMO USAR ESTE EJEMPLO:
 *
 * 1. Asegúrate de estar logueado (tener un token válido)
 * 2. Ingresa el nombre de un proceso existente en Bizuit (ej: "samplewebpages")
 * 3. Haz click en "Cargar Proceso"
 * 4. Llena los campos del formulario generado automáticamente
 * 5. Haz click en "Iniciar Proceso"
 * 6. ¡Listo! El proceso se habrá iniciado en Bizuit
 *
 * VENTAJAS:
 * ✅ Rápido de implementar
 * ✅ No necesitas conocer la estructura del proceso de antemano
 * ✅ Se adapta automáticamente si cambian los parámetros
 *
 * DESVENTAJAS:
 * ❌ Menos control sobre el diseño
 * ❌ No puedes agregar validaciones personalizadas fácilmente
 */
