'use server'

import { BizuitSDK } from '@tyconsa/bizuit-form-sdk/core'
import { IParameter } from '@tyconsa/bizuit-form-sdk'

/**
 * Server Actions para demostrar el uso del SDK del lado del servidor
 *
 * Ventajas de usar el SDK en el servidor:
 * - Mayor seguridad: Las credenciales nunca se exponen al cliente
 * - Mejor rendimiento: Menos overhead de red
 * - Sin problemas de CORS
 * - Acceso directo a la API de Bizuit
 */

// Inicializar SDK con configuración del servidor
const sdk = new BizuitSDK({
  apiUrl: process.env.BIZUIT_API_URL || 'http://localhost:8000',
  timeout: 30000
})

// Credenciales de ejemplo (en producción, usar variables de entorno)
const credentials = {
  username: process.env.BIZUIT_USERNAME || 'admin',
  password: process.env.BIZUIT_PASSWORD || 'admin123'
}

/**
 * Helper: Convert Record<string, any> to IParameter[]
 */
function convertToParameters(params: Record<string, any>): IParameter[] {
  return Object.entries(params).map(([name, value]) => ({
    name,
    value: String(value),
    type: 'SingleValue' as const,
    direction: 'In' as const
  }))
}

/**
 * Server Action: Iniciar un proceso
 */
export async function startProcess(processName: string, parameters: Record<string, any>) {
  try {
    // 1. Autenticar
    const authResponse = await sdk.auth.login(credentials)

    if (!authResponse.Token) {
      throw new Error('Authentication failed')
    }

    const token = authResponse.Token

    // 2. Iniciar el proceso
    const response = await sdk.process.start({
      processName,
      parameters: convertToParameters(parameters)
    }, undefined, token)

    return {
      success: true,
      data: response
    }
  } catch (error: any) {
    console.error('Error starting process:', error)
    return {
      success: false,
      error: error.message || 'Failed to start process'
    }
  }
}

/**
 * Server Action: Obtener datos de una instancia
 */
export async function getInstance(instanceId: string) {
  try {
    // 1. Autenticar
    const authResponse = await sdk.auth.login(credentials)

    if (!authResponse.Token) {
      throw new Error('Authentication failed')
    }

    const token = authResponse.Token

    // 2. Obtener datos de la instancia
    const instance = await sdk.process.getInstanceData(instanceId, token)

    return {
      success: true,
      data: instance
    }
  } catch (error: any) {
    console.error('Error getting instance:', error)
    return {
      success: false,
      error: error.message || 'Failed to get instance'
    }
  }
}

/**
 * Server Action: Continuar un proceso (completar una tarea)
 */
export async function continueProcess(
  instanceId: string,
  taskId: string,
  parameters: Record<string, any>
) {
  try {
    // 1. Autenticar
    const authResponse = await sdk.auth.login(credentials)

    if (!authResponse.Token) {
      throw new Error('Authentication failed')
    }

    const token = authResponse.Token

    // 2. Continuar el proceso
    // Note: processName is required but we use empty string as it's not needed for continue
    const response = await sdk.process.continue({
      processName: '',
      instanceId,
      parameters: convertToParameters(parameters)
    }, undefined, token)

    return {
      success: true,
      data: response
    }
  } catch (error: any) {
    console.error('Error continuing process:', error)
    return {
      success: false,
      error: error.message || 'Failed to continue process'
    }
  }
}

/**
 * Server Action: Obtener parámetros de un proceso
 */
export async function getProcessParameters(processName: string) {
  try {
    // 1. Autenticar
    const authResponse = await sdk.auth.login(credentials)

    if (!authResponse.Token) {
      throw new Error('Authentication failed')
    }

    const token = authResponse.Token

    // 2. Obtener parámetros
    const params = await sdk.process.getParameters(processName, '', token)

    return {
      success: true,
      data: params
    }
  } catch (error: any) {
    console.error('Error getting parameters:', error)
    return {
      success: false,
      error: error.message || 'Failed to get parameters'
    }
  }
}
