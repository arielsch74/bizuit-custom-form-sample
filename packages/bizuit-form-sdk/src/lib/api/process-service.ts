/**
 * Bizuit Process Service
 * Handles process initialization and RaiseEvent operations
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
   */
  async initialize(params: IInitializeParams): Promise<IProcessData> {
    const queryParams = new URLSearchParams()
    queryParams.append('processName', params.processName)

    if (params.activityName) queryParams.append('activityName', params.activityName)
    if (params.version) queryParams.append('version', params.version)
    if (params.instanceId) queryParams.append('instanceId', params.instanceId)

    const headers: Record<string, string> = {}

    if (params.sessionToken) {
      headers['BZ-SESSION-TOKEN'] = params.sessionToken
    }

    if (params.token) {
      headers['BZ-AUTH-TOKEN'] = params.token
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
   * Supports file uploads via FormData
   */
  async raiseEvent(
    params: IRaiseEventParams,
    files?: File[],
    sessionToken?: string,
    userName?: string
  ): Promise<IRaiseEventResult> {
    const formData = new FormData()

    // Add process data
    const dataPayload = {
      eventName: params.eventName,
      instanceId: params.instanceId,
      parameters: params.parameters,
      eventVersion: params.eventVersion,
      closeOnSuccess: params.closeOnSuccess || false,
      deletedDocuments: params.deletedDocuments || [],
    }

    const jsonString = JSON.stringify(dataPayload)
    const base64Data = btoa(jsonString)
    formData.append('data', base64Data)

    // Add files
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append(file.name, file, file.name)
      })
    }

    const headers: Record<string, string> = {
      // Don't set Content-Type, let browser set it with boundary for multipart
    }

    if (sessionToken) {
      headers['BZ-SESSION-TOKEN'] = sessionToken
    }

    if (userName) {
      headers['BZ-USER-NAME'] = userName
    }

    if (params.eventName) {
      headers['BZ-PROCESS-NAME'] = params.eventName
    }

    if (params.instanceId) {
      headers['BZ-INSTANCEID'] = params.instanceId
    }

    const result = await this.client.post<IRaiseEventResult>(
      `${this.formsApiUrl}/Process/RaiseEvent`,
      formData,
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
   */
  async getInstanceData(
    instanceId: string,
    sessionToken?: string
  ): Promise<IProcessData> {
    const headers: Record<string, string> = {}

    if (sessionToken) {
      headers['BZ-SESSION-TOKEN'] = sessionToken
    }

    const data = await this.client.get<IProcessData>(
      `${this.formsApiUrl}/Process/Initialize?instanceId=${instanceId}`,
      { headers }
    )

    return data
  }
}
