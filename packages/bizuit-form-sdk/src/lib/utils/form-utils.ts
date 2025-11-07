/**
 * Form utilities for converting form data to Bizuit API format
 */

import type { IParameter } from '../types'

/**
 * Bizuit Process Parameter from API
 * Structure returned by getProcessParameters endpoint
 */
export interface IBizuitProcessParameter {
  name: string
  parameterType: number // 1 = SingleValue, 2 = Xml
  parameterDirection: number // 1 = In, 2 = Out, 3 = Optional
  type: string // 'string', 'int', 'bool', etc.
  schema: string // XSD schema
  value: string | null
  isSystemParameter: boolean
  isVariable: boolean
}

/**
 * Filters process parameters to get only those that should be displayed in the START PROCESS form
 * Excludes system parameters, variables, and output-only parameters
 *
 * @param parameters - Array of process parameters from getProcessParameters
 * @returns Filtered array of parameters for START process form display
 *
 * @example
 * ```typescript
 * const allParams = await sdk.process.getProcessParameters('MyProcess', '', token)
 * const formParams = filterFormParameters(allParams)
 * // Returns only input (direction=1) and optional (direction=3) parameters
 * // that are not system parameters or variables
 * ```
 */
export function filterFormParameters(
  parameters: IBizuitProcessParameter[]
): IBizuitProcessParameter[] {
  return parameters.filter((param) => {
    // Exclude system parameters and variables
    if (param.isSystemParameter || param.isVariable) {
      return false
    }

    // Include only Input (1) and Optional (3) parameters
    // Exclude Output (2) parameters
    return param.parameterDirection === 1 || param.parameterDirection === 3
  })
}

/**
 * Filters process parameters to get only those that should be displayed in the CONTINUE PROCESS form
 * Includes Input, Optional, AND Variables (different from filterFormParameters)
 * Excludes only system parameters and output-only parameters
 *
 * @param parameters - Array of process parameters from getProcessParameters
 * @returns Filtered array of parameters for CONTINUE process form display
 *
 * @example
 * ```typescript
 * const allParams = await sdk.process.getProcessParameters('MyProcess', '', token)
 * const formParams = filterContinueParameters(allParams)
 * // Returns input (direction=1), optional (direction=3) parameters,
 * // AND variables (isVariable=true) that are not system parameters
 * ```
 */
export function filterContinueParameters(
  parameters: IBizuitProcessParameter[]
): IBizuitProcessParameter[] {
  return parameters.filter((param) => {
    // Exclude system parameters
    if (param.isSystemParameter) {
      return false
    }

    // Include Variables (this is the main difference from filterFormParameters)
    if (param.isVariable) {
      return true
    }

    // Include Input (1) and Optional (3) parameters
    // Exclude Output-only (2) parameters
    return param.parameterDirection === 1 || param.parameterDirection === 3
  })
}

/**
 * Checks if a parameter is required or optional
 *
 * @param param - Process parameter
 * @returns true if parameter is required (direction=1), false if optional (direction=3)
 */
export function isParameterRequired(param: IBizuitProcessParameter): boolean {
  return param.parameterDirection === 1
}

/**
 * Gets a human-readable label for parameter direction
 *
 * @param direction - Parameter direction number
 * @returns Human-readable label
 */
export function getParameterDirectionLabel(direction: number): string {
  switch (direction) {
    case 1:
      return 'Input'
    case 2:
      return 'Output'
    case 3:
      return 'Optional'
    default:
      return 'Unknown'
  }
}

/**
 * Gets a human-readable label for parameter type
 *
 * @param parameterType - Parameter type number
 * @returns Human-readable label
 */
export function getParameterTypeLabel(parameterType: number): string {
  switch (parameterType) {
    case 1:
      return 'SingleValue'
    case 2:
      return 'Xml'
    default:
      return 'Unknown'
  }
}

/**
 * Converts form data to IParameter[] format expected by Bizuit API
 *
 * @param formData - Object with form field values
 * @returns Array of IParameter objects
 *
 * @example
 * ```typescript
 * const formData = {
 *   priority: 'high',
 *   categories: ['sales', 'support'],
 *   startDate: new Date(),
 *   budget: 75,
 *   description: 'Process description',
 *   files: [file1, file2]
 * }
 *
 * const parameters = formDataToParameters(formData)
 * // Returns:
 * // [
 * //   { name: 'priority', value: 'high', type: 'SingleValue', direction: 'In' },
 * //   { name: 'categories', value: '["sales","support"]', type: 'SingleValue', direction: 'In' },
 * //   ...
 * // ]
 * ```
 */
export function formDataToParameters(formData: Record<string, any>): IParameter[] {
  const parameters: IParameter[] = []

  for (const [key, value] of Object.entries(formData)) {
    // Skip undefined, null, or empty values
    if (value === undefined || value === null || value === '') {
      continue
    }

    // Skip file objects - files are handled separately in the SDK
    if (value instanceof File || (Array.isArray(value) && value.length > 0 && value[0] instanceof File)) {
      continue
    }

    // Convert value to string based on type
    let stringValue: string
    let paramType: 'SingleValue' | 'Xml' | 'ComplexObject' = 'SingleValue'

    if (Array.isArray(value)) {
      // Array values: convert to JSON string
      stringValue = JSON.stringify(value)
    } else if (value instanceof Date) {
      // Date values: convert to ISO string
      stringValue = value.toISOString()
    } else if (typeof value === 'object') {
      // Complex objects: convert to JSON string and mark as ComplexObject
      stringValue = JSON.stringify(value)
      paramType = 'ComplexObject'
    } else if (typeof value === 'boolean') {
      // Boolean values: convert to 'true' or 'false' string
      stringValue = value.toString()
    } else {
      // Primitive values: convert to string
      stringValue = String(value)
    }

    parameters.push({
      name: key,
      value: stringValue,
      type: paramType,
      direction: 'In',
    })
  }

  return parameters
}

/**
 * Converts IParameter[] back to form data object
 * Useful for loading existing instance data into the form
 *
 * @param parameters - Array of IParameter objects
 * @returns Object with form field values
 *
 * @example
 * ```typescript
 * const parameters = [
 *   { name: 'priority', value: 'high', type: 'SingleValue', direction: 'In' },
 *   { name: 'categories', value: '["sales","support"]', type: 'SingleValue', direction: 'In' }
 * ]
 *
 * const formData = parametersToFormData(parameters)
 * // Returns: { priority: 'high', categories: ['sales', 'support'] }
 * ```
 */
export function parametersToFormData(parameters: IParameter[]): Record<string, any> {
  const formData: Record<string, any> = {}

  for (const param of parameters) {
    if (!param.value) continue

    try {
      // Try to parse as JSON first (for arrays and objects)
      const parsedValue = JSON.parse(param.value)
      formData[param.name] = parsedValue
    } catch {
      // If parsing fails, it's a simple string value
      // Try to detect if it's a date
      if (isISODate(param.value)) {
        formData[param.name] = new Date(param.value)
      } else if (param.value === 'true' || param.value === 'false') {
        // Convert string boolean to actual boolean
        formData[param.name] = param.value === 'true'
      } else if (!isNaN(Number(param.value)) && param.value.trim() !== '') {
        // Convert numeric strings to numbers
        formData[param.name] = Number(param.value)
      } else {
        // Keep as string
        formData[param.name] = param.value
      }
    }
  }

  return formData
}

/**
 * Helper function to detect if a string is an ISO date
 */
function isISODate(str: string): boolean {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
  return isoDateRegex.test(str)
}

/**
 * Creates a parameter with explicit type and direction
 * Useful for creating specific parameters that need custom configuration
 *
 * @param name - Parameter name
 * @param value - Parameter value
 * @param type - Parameter type (default: 'SingleValue')
 * @param direction - Parameter direction (default: 'In')
 * @returns IParameter object
 *
 * @example
 * ```typescript
 * const param = createParameter('userId', '12345', 'SingleValue', 'In')
 * ```
 */
export function createParameter(
  name: string,
  value: any,
  type: 'SingleValue' | 'Xml' | 'ComplexObject' = 'SingleValue',
  direction: 'In' | 'Out' | 'InOut' = 'In'
): IParameter {
  return {
    name,
    value: typeof value === 'string' ? value : JSON.stringify(value),
    type,
    direction,
  }
}

/**
 * Merges multiple parameter arrays, with later arrays overriding earlier ones
 * Useful for combining default parameters with form data
 *
 * @param parameterArrays - Arrays of parameters to merge
 * @returns Merged array of parameters
 *
 * @example
 * ```typescript
 * const defaults = [{ name: 'status', value: 'pending', type: 'SingleValue', direction: 'In' }]
 * const formParams = formDataToParameters(formData)
 * const merged = mergeParameters(defaults, formParams)
 * ```
 */
export function mergeParameters(...parameterArrays: IParameter[][]): IParameter[] {
  const paramMap = new Map<string, IParameter>()

  for (const params of parameterArrays) {
    for (const param of params) {
      paramMap.set(param.name, param)
    }
  }

  return Array.from(paramMap.values())
}

/**
 * Result type for loadInstanceDataForContinue helper
 */
export interface ILoadInstanceDataResult {
  instanceData: any
  processName: string
  eventName: string
  formParameters: IBizuitProcessParameter[]
  formData: Record<string, any>
}

/**
 * Helper function to load all necessary data for continuing a process instance
 * This encapsulates the business logic of:
 * 1. Getting instance data
 * 2. Extracting process/event names
 * 3. Getting process parameters
 * 4. Filtering for continue form (includes variables)
 * 5. Parsing existing parameter values into form data
 *
 * @param sdk - Bizuit SDK instance with process service
 * @param instanceId - Instance ID to load
 * @param token - Authentication token
 * @returns Promise with all data needed to render continue form
 *
 * @example
 * ```typescript
 * const result = await loadInstanceDataForContinue(sdk, instanceId, token)
 * setProcessData(result.instanceData)
 * setProcessName(result.processName)
 * setEventName(result.eventName)
 * setProcessParameters(result.formParameters)
 * setFormData(result.formData)
 * ```
 */
export async function loadInstanceDataForContinue(
  sdk: any, // TODO: Type this properly as BizuitSDK
  instanceId: string,
  token: string
): Promise<ILoadInstanceDataResult> {
  // 1. Get instance data
  const instanceData = await sdk.process.getInstanceData(instanceId, token)

  // 2. Extract process name and event name
  // TODO: Verify these field names with actual API response
  const processName = instanceData.processName || instanceData.workflowName || ''
  const eventName = instanceData.eventName || instanceData.currentEvent || ''

  let formParameters: IBizuitProcessParameter[] = []
  let formData: Record<string, any> = {}

  // 3. Get process parameters if we have a process name
  if (processName) {
    const allParameters = await sdk.process.getProcessParameters(processName, '', token)

    // 4. Filter for continue form (includes Input, Optional, AND Variables)
    formParameters = filterContinueParameters(allParameters)
  }

  // 5. Parse existing instance parameters into form data
  if (instanceData.parameters && Array.isArray(instanceData.parameters)) {
    formData = parametersToFormData(instanceData.parameters)
  }

  return {
    instanceData,
    processName,
    eventName,
    formParameters,
    formData,
  }
}
