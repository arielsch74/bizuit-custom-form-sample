import { describe, it, expect } from 'vitest'
import {
  formDataToParameters,
  parametersToFormData,
  filterFormParameters,
  filterContinueParameters,
  processUrlToken,
  createParameter,
  mergeParameters,
  isParameterRequired,
  type IBizuitProcessParameter,
} from '../lib/utils/form-utils'

describe('formDataToParameters', () => {
  it('should convert simple string values', () => {
    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
    }

    const result = formDataToParameters(formData)

    expect(result).toEqual([
      { name: 'name', value: 'John Doe', type: 'SingleValue', direction: 'In' },
      { name: 'email', value: 'john@example.com', type: 'SingleValue', direction: 'In' },
    ])
  })

  it('should convert numbers to strings', () => {
    const formData = {
      age: 25,
      amount: 1000.50,
    }

    const result = formDataToParameters(formData)

    expect(result).toEqual([
      { name: 'age', value: '25', type: 'SingleValue', direction: 'In' },
      { name: 'amount', value: '1000.5', type: 'SingleValue', direction: 'In' },
    ])
  })

  it('should convert booleans to strings', () => {
    const formData = {
      isActive: true,
      isVerified: false,
    }

    const result = formDataToParameters(formData)

    expect(result).toEqual([
      { name: 'isActive', value: 'true', type: 'SingleValue', direction: 'In' },
      { name: 'isVerified', value: 'false', type: 'SingleValue', direction: 'In' },
    ])
  })

  it('should stringify arrays', () => {
    const formData = {
      tags: ['javascript', 'typescript', 'react'],
    }

    const result = formDataToParameters(formData)

    expect(result).toEqual([
      { name: 'tags', value: '["javascript","typescript","react"]', type: 'SingleValue', direction: 'In' },
    ])
  })

  it('should stringify objects', () => {
    const formData = {
      address: {
        street: '123 Main St',
        city: 'New York',
      },
    }

    const result = formDataToParameters(formData)

    expect(result).toEqual([
      { name: 'address', value: '{"street":"123 Main St","city":"New York"}', type: 'ComplexObject', direction: 'In' },
    ])
  })

  it('should skip null, undefined and empty values', () => {
    const formData = {
      value1: null,
      value2: undefined,
      value3: '',
      value4: 'valid',
    }

    const result = formDataToParameters(formData)

    // null, undefined and empty strings are skipped
    expect(result).toEqual([
      { name: 'value4', value: 'valid', type: 'SingleValue', direction: 'In' },
    ])
  })

  it('should handle dates', () => {
    const date = new Date('2024-01-15T10:30:00.000Z')
    const formData = {
      startDate: date,
    }

    const result = formDataToParameters(formData)

    expect(result).toEqual([
      { name: 'startDate', value: '2024-01-15T10:30:00.000Z', type: 'SingleValue', direction: 'In' },
    ])
  })

  it('should skip files array', () => {
    const formData = {
      name: 'Test',
      files: [new File(['content'], 'test.txt')],
    }

    const result = formDataToParameters(formData)

    expect(result).toEqual([
      { name: 'name', value: 'Test', type: 'SingleValue', direction: 'In' },
    ])
  })
})

describe('parametersToFormData', () => {
  it('should convert simple parameters back to form data', () => {
    const parameters = [
      { name: 'name', value: 'John Doe', type: 'SingleValue', direction: 'In' },
      { name: 'age', value: '25', type: 'SingleValue', direction: 'In' },
    ]

    const result = parametersToFormData(parameters)

    expect(result).toEqual({
      name: 'John Doe',
      age: 25,
    })
  })

  it('should parse JSON arrays', () => {
    const parameters = [
      { name: 'tags', value: '["a","b","c"]', type: 'SingleValue', direction: 'In' },
    ]

    const result = parametersToFormData(parameters)

    expect(result).toEqual({
      tags: ['a', 'b', 'c'],
    })
  })

  it('should parse JSON objects', () => {
    const parameters = [
      { name: 'config', value: '{"theme":"dark","lang":"en"}', type: 'SingleValue', direction: 'In' },
    ]

    const result = parametersToFormData(parameters)

    expect(result).toEqual({
      config: { theme: 'dark', lang: 'en' },
    })
  })

  it('should parse boolean strings', () => {
    const parameters = [
      { name: 'isActive', value: 'true', type: 'SingleValue', direction: 'In' },
      { name: 'isVerified', value: 'false', type: 'SingleValue', direction: 'In' },
    ]

    const result = parametersToFormData(parameters)

    expect(result).toEqual({
      isActive: true,
      isVerified: false,
    })
  })

  it('should parse ISO dates', () => {
    const parameters = [
      { name: 'createdAt', value: '2024-01-15T10:30:00.000Z', type: 'SingleValue', direction: 'In' },
    ]

    const result = parametersToFormData(parameters)

    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.createdAt.toISOString()).toBe('2024-01-15T10:30:00.000Z')
  })

  it('should skip parameters without value', () => {
    const parameters = [
      { name: 'name', value: 'John', type: 'SingleValue', direction: 'In' },
      { name: 'empty', value: '', type: 'SingleValue', direction: 'In' },
      { name: 'nullValue', value: null, type: 'SingleValue', direction: 'In' },
    ]

    const result = parametersToFormData(parameters)

    expect(result).toEqual({
      name: 'John',
    })
  })
})

describe('filterFormParameters', () => {
  const mockParameters: IBizuitProcessParameter[] = [
    { name: 'inputParam', parameterType: 1, parameterDirection: 1, type: 'string', schema: '', value: null, isSystemParameter: false, isVariable: false },
    { name: 'outputParam', parameterType: 1, parameterDirection: 2, type: 'string', schema: '', value: null, isSystemParameter: false, isVariable: false },
    { name: 'optionalParam', parameterType: 1, parameterDirection: 3, type: 'string', schema: '', value: null, isSystemParameter: false, isVariable: false },
    { name: 'systemParam', parameterType: 1, parameterDirection: 1, type: 'string', schema: '', value: null, isSystemParameter: true, isVariable: false },
    { name: 'variable', parameterType: 1, parameterDirection: 1, type: 'string', schema: '', value: null, isSystemParameter: false, isVariable: true },
  ]

  it('should include only Input and Optional parameters', () => {
    const result = filterFormParameters(mockParameters)

    expect(result).toHaveLength(2)
    expect(result.map(p => p.name)).toEqual(['inputParam', 'optionalParam'])
  })

  it('should exclude Output parameters', () => {
    const result = filterFormParameters(mockParameters)

    expect(result.find(p => p.parameterDirection === 2)).toBeUndefined()
  })

  it('should exclude system parameters', () => {
    const result = filterFormParameters(mockParameters)

    expect(result.find(p => p.isSystemParameter)).toBeUndefined()
  })

  it('should exclude variables', () => {
    const result = filterFormParameters(mockParameters)

    expect(result.find(p => p.isVariable)).toBeUndefined()
  })

  it('should return empty array for empty input', () => {
    const result = filterFormParameters([])

    expect(result).toEqual([])
  })
})

describe('filterContinueParameters', () => {
  const mockParameters: IBizuitProcessParameter[] = [
    { name: 'inputParam', parameterType: 1, parameterDirection: 1, type: 'string', schema: '', value: null, isSystemParameter: false, isVariable: false },
    { name: 'outputParam', parameterType: 1, parameterDirection: 2, type: 'string', schema: '', value: null, isSystemParameter: false, isVariable: false },
    { name: 'optionalParam', parameterType: 1, parameterDirection: 3, type: 'string', schema: '', value: null, isSystemParameter: false, isVariable: false },
    { name: 'systemParam', parameterType: 1, parameterDirection: 1, type: 'string', schema: '', value: null, isSystemParameter: true, isVariable: false },
    { name: 'variable', parameterType: 1, parameterDirection: 1, type: 'string', schema: '', value: null, isSystemParameter: false, isVariable: true },
  ]

  it('should include Input, Optional, and Variables', () => {
    const result = filterContinueParameters(mockParameters)

    expect(result).toHaveLength(3)
    expect(result.map(p => p.name)).toEqual(['inputParam', 'optionalParam', 'variable'])
  })

  it('should exclude Output parameters', () => {
    const result = filterContinueParameters(mockParameters)

    expect(result.find(p => p.parameterDirection === 2)).toBeUndefined()
  })

  it('should exclude system parameters', () => {
    const result = filterContinueParameters(mockParameters)

    expect(result.find(p => p.isSystemParameter)).toBeUndefined()
  })

  it('should include variables (difference from filterFormParameters)', () => {
    const result = filterContinueParameters(mockParameters)

    expect(result.find(p => p.isVariable)).toBeDefined()
  })
})

describe('processUrlToken', () => {
  it('should create login response with default values', () => {
    const token = 'test-token-123'

    const result = processUrlToken(token)

    expect(result).toEqual({
      Token: token,
      User: {
        Username: 'bizuit-user',
        UserID: 0,
        DisplayName: 'Usuario Bizuit',
      },
      ExpirationDate: expect.any(String),
    })
  })

  it('should use custom username and displayName', () => {
    const result = processUrlToken('token', 'john.doe', 'John Doe')

    expect(result.User.Username).toBe('john.doe')
    expect(result.User.DisplayName).toBe('John Doe')
  })

  it('should set expiration date with custom hours', () => {
    const now = Date.now()
    const result = processUrlToken('token', 'user', 'User', 48)

    const expirationDate = new Date(result.ExpirationDate).getTime()
    const expectedExpiration = now + (48 * 60 * 60 * 1000)

    // Allow 1 second tolerance
    expect(Math.abs(expirationDate - expectedExpiration)).toBeLessThan(1000)
  })

  it('should default to 24 hours expiration', () => {
    const now = Date.now()
    const result = processUrlToken('token')

    const expirationDate = new Date(result.ExpirationDate).getTime()
    const expectedExpiration = now + (24 * 60 * 60 * 1000)

    expect(Math.abs(expirationDate - expectedExpiration)).toBeLessThan(1000)
  })
})

describe('createParameter', () => {
  it('should create parameter with defaults', () => {
    const result = createParameter('testParam', 'testValue')

    expect(result).toEqual({
      name: 'testParam',
      value: 'testValue',
      type: 'SingleValue',
      direction: 'In',
    })
  })

  it('should create parameter with custom type and direction', () => {
    const result = createParameter('xmlParam', '<data>test</data>', 'Xml', 'Out')

    expect(result).toEqual({
      name: 'xmlParam',
      value: '<data>test</data>',
      type: 'Xml',
      direction: 'Out',
    })
  })

  it('should stringify non-string values', () => {
    const result = createParameter('objParam', { key: 'value' })

    expect(result.value).toBe('{"key":"value"}')
  })
})

describe('mergeParameters', () => {
  it('should merge multiple parameter arrays', () => {
    const params1 = [
      { name: 'param1', value: 'value1', type: 'SingleValue', direction: 'In' },
      { name: 'param2', value: 'value2', type: 'SingleValue', direction: 'In' },
    ]

    const params2 = [
      { name: 'param3', value: 'value3', type: 'SingleValue', direction: 'In' },
    ]

    const result = mergeParameters(params1, params2)

    expect(result).toHaveLength(3)
  })

  it('should override earlier parameters with later ones', () => {
    const params1 = [
      { name: 'param1', value: 'old', type: 'SingleValue', direction: 'In' },
    ]

    const params2 = [
      { name: 'param1', value: 'new', type: 'SingleValue', direction: 'In' },
    ]

    const result = mergeParameters(params1, params2)

    expect(result).toHaveLength(1)
    expect(result[0].value).toBe('new')
  })

  it('should handle empty arrays', () => {
    const params = [
      { name: 'param1', value: 'value1', type: 'SingleValue', direction: 'In' },
    ]

    const result = mergeParameters([], params, [])

    expect(result).toEqual(params)
  })
})

describe('isParameterRequired', () => {
  it('should return true for Input parameters (direction 1)', () => {
    const param: IBizuitProcessParameter = {
      name: 'test',
      parameterType: 1,
      parameterDirection: 1,
      type: 'string',
      schema: '',
      value: null,
      isSystemParameter: false,
      isVariable: false,
    }

    expect(isParameterRequired(param)).toBe(true)
  })

  it('should return false for Optional parameters (direction 3)', () => {
    const param: IBizuitProcessParameter = {
      name: 'test',
      parameterType: 1,
      parameterDirection: 3,
      type: 'string',
      schema: '',
      value: null,
      isSystemParameter: false,
      isVariable: false,
    }

    expect(isParameterRequired(param)).toBe(false)
  })

  it('should return false for Output parameters (direction 2)', () => {
    const param: IBizuitProcessParameter = {
      name: 'test',
      parameterType: 1,
      parameterDirection: 2,
      type: 'string',
      schema: '',
      value: null,
      isSystemParameter: false,
      isVariable: false,
    }

    expect(isParameterRequired(param)).toBe(false)
  })
})
