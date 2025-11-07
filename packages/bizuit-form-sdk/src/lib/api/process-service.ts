/**
 * Bizuit Process Service
 * Handles process initialization and RaiseEvent operations
 * Updated to match Bizuit API specification exactly
 */

import { BizuitHttpClient } from './http-client'
import type {
  IBizuitConfig,
  IInitializeParams,
  IProcessData,
  IRaiseEventParams,
  IRaiseEventResult,
} from '../types'

export class BizuitProcessService {
  private client: BizuitHttpClient
  private formsApiUrl: string

  constructor(config: IBizuitConfig) {
    this.client = new BizuitHttpClient(config)
    this.formsApiUrl = config.formsApiUrl
  }

  /**
   * Initialize process - Get parameters for new or existing instance
   * Uses standard Authorization header as per API specification
   */
  async initialize(params: IInitializeParams): Promise<IProcessData> {
    const queryParams = new URLSearchParams()
    queryParams.append('processName', params.processName)

    if (params.activityName) queryParams.append('activityName', params.activityName)
    if (params.version) queryParams.append('version', params.version)
    if (params.instanceId) queryParams.append('instanceId', params.instanceId)

    const headers: Record<string, string> = {}

    // Use standard Authorization header with token
    if (params.token) {
      headers['Authorization'] = params.token
    }

    if (params.sessionToken) {
      headers['BZ-SESSION-TOKEN'] = params.sessionToken
    }

    if (params.userName) {
      headers['BZ-USER-NAME'] = params.userName
    }

    if (params.formId) {
      headers['BZ-FORM'] = String(params.formId)
    }

    if (params.formDraftId) {
      headers['BZ-DRAFT-FORM'] = String(params.formDraftId)
    }

    if (params.processName) {
      headers['BZ-PROCESS-NAME'] = params.processName
    }

    if (params.instanceId) {
      headers['BZ-INSTANCEID'] = params.instanceId
    }

    if (params.childProcessName) {
      headers['BZ-CHILD-PROCESS-NAME'] = params.childProcessName
    }

    const processData = await this.client.get<IProcessData>(
      `${this.formsApiUrl}/Process/Initialize?${queryParams.toString()}`,
      { headers }
    )

    return processData
  }

  /**
   * RaiseEvent - Execute process or continue instance
   * Sends JSON directly as per Bizuit API specification
   *
   * Example from curl:
   * POST /api/instances
   * Authorization: Basic TOKEN
   * Content-Type: application/json
   * {
   *   "eventName": "DemoFlow",
   *   "parameters": [
   *     {
   *       "name": "pData",
   *       "value": "A",
   *       "type": "SingleValue",
   *       "direction": "In"
   *     }
   *   ]
   * }
   */
  async raiseEvent(
    params: IRaiseEventParams,
    files?: File[],
    token?: string
  ): Promise<IRaiseEventResult> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Use standard Authorization header with token
    if (token) {
      headers['Authorization'] = token
    }

    // Build the payload exactly as the API expects
    const payload: any = {
      eventName: params.eventName,
      parameters: params.parameters || [],
    }

    // Add optional fields only if provided
    if (params.instanceId) {
      payload.instanceId = params.instanceId
    }

    if (params.eventVersion) {
      payload.eventVersion = params.eventVersion
    }

    if (params.closeOnSuccess !== undefined) {
      payload.closeOnSuccess = params.closeOnSuccess
    }

    if (params.deletedDocuments && params.deletedDocuments.length > 0) {
      payload.deletedDocuments = params.deletedDocuments
    }

    // Note: File upload support would require multipart/form-data
    // For now, we're implementing JSON-only as per the curl examples
    if (files && files.length > 0) {
      console.warn('File upload in RaiseEvent is not yet implemented in JSON mode')
    }

    const result = await this.client.post<IRaiseEventResult>(
      `${this.formsApiUrl}/instances`,
      payload,
      { headers }
    )

    return result
  }

  /**
   * Get process parameters schema
   * Useful for dynamic form generation
   */
  async getProcessParameters(
    processName: string,
    version?: string,
    token?: string
  ): Promise<IProcessData> {
    return this.initialize({
      processName,
      version,
      token,
    })
  }

  /**
   * Get instance data
   * Uses standard Authorization header
   *
   * Example from curl:
   * GET /api/instances?instanceId=8d2d0e04-ea83-48f2-953d-ff858581e3df
   * Authorization: Basic TOKEN
   */
  async getInstanceData(
    instanceId: string,
    token?: string
  ): Promise<IProcessData> {
    const headers: Record<string, string> = {}

    if (token) {
      headers['Authorization'] = token
    }

    const data = await this.client.get<IProcessData>(
      `${this.formsApiUrl}/instances?instanceId=${instanceId}`,
      { headers }
    )

    return data
  }

  /**
   * Acquire pessimistic lock on instance
   * Prevents concurrent editing
   */
  async acquireLock(params: {
    instanceId: string
    token: string
  }): Promise<{ sessionToken: string; processData: IProcessData }> {
    const headers: Record<string, string> = {
      'Authorization': params.token,
    }

    const result = await this.client.post<{ sessionToken: string; processData: IProcessData }>(
      `${this.formsApiUrl}/ProcessInstance/AcquireLock`,
      { instanceId: params.instanceId },
      { headers }
    )

    return result
  }

  /**
   * Release pessimistic lock on instance
   */
  async releaseLock(params: {
    instanceId: string
    sessionToken: string
  }): Promise<void> {
    const headers: Record<string, string> = {
      'BZ-SESSION-TOKEN': params.sessionToken,
    }

    await this.client.post<void>(
      `${this.formsApiUrl}/ProcessInstance/ReleaseLock`,
      { instanceId: params.instanceId },
      { headers }
    )
  }

  /**
   * Continue instance with updated parameters
   * Uses PUT method instead of POST
   *
   * Example from curl:
   * PUT /api/instances
   * Authorization: Basic TOKEN
   * Content-Type: application/json
   * {
   *   "eventName": "DemoFlow",
   *   "parameters": [...],
   *   "instanceId": "e3137f94-0ab5-4ae7-b256-10806fe92958"
   * }
   */
  async continueInstance(
    params: IRaiseEventParams,
    files?: File[],
    token?: string
  ): Promise<IRaiseEventResult> {
    if (!params.instanceId) {
      throw new Error('instanceId is required for continueInstance')
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = token
    }

    const payload: any = {
      eventName: params.eventName,
      parameters: params.parameters || [],
      instanceId: params.instanceId,
    }

    if (params.eventVersion) {
      payload.eventVersion = params.eventVersion
    }

    if (params.closeOnSuccess !== undefined) {
      payload.closeOnSuccess = params.closeOnSuccess
    }

    if (params.deletedDocuments && params.deletedDocuments.length > 0) {
      payload.deletedDocuments = params.deletedDocuments
    }

    if (files && files.length > 0) {
      console.warn('File upload in continueInstance is not yet implemented in JSON mode')
    }

    const result = await this.client.put<IRaiseEventResult>(
      `${this.formsApiUrl}/instances`,
      payload,
      { headers }
    )

    return result
  }
}
