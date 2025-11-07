/**
 * Form utilities for converting form data to Bizuit API format
 */

import type { IParameter } from '@bizuit/form-sdk'

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
