/**
 * Tests for dashboard-params.ts
 *
 * Tests the extraction and validation of Dashboard query parameters.
 */

import {
  extractDashboardParams,
  isFromDashboard,
  validateDashboardToken,
  getDashboardParameters,
} from '../dashboard-params'

// Mock window.location
const mockLocation = (search: string) => {
  delete (window as any).location
  window.location = { search } as any
}

// Mock fetch
global.fetch = jest.fn()

describe('Dashboard Parameters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  afterEach(() => {
    // Restore window.location
    delete (window as any).location
  })

  describe('extractDashboardParams', () => {
    it('should extract all Dashboard parameters when present', () => {
      mockLocation('?s=encrypted123&InstanceId=12345&UserName=admin&eventName=MyProcess&activityName=Task1&token=Basic123')

      const params = extractDashboardParams()

      expect(params).toEqual({
        s: 'encrypted123',
        InstanceId: '12345',
        UserName: 'admin',
        eventName: 'MyProcess',
        activityName: 'Task1',
        token: 'Basic123'
      })
    })

    it('should return null when "s" parameter is missing', () => {
      mockLocation('?InstanceId=12345&UserName=admin')

      const params = extractDashboardParams()

      expect(params).toBeNull()
    })

    it('should handle only "s" parameter', () => {
      mockLocation('?s=encrypted123')

      const params = extractDashboardParams()

      expect(params).toEqual({
        s: 'encrypted123',
        InstanceId: undefined,
        UserName: undefined,
        eventName: undefined,
        activityName: undefined,
        token: undefined
      })
    })

    it('should return null when no parameters', () => {
      mockLocation('')

      const params = extractDashboardParams()

      expect(params).toBeNull()
    })

    it('should handle URL-encoded values', () => {
      mockLocation('?s=abc%2Fdef%3D&UserName=john%40example.com')

      const params = extractDashboardParams()

      expect(params).toEqual({
        s: 'abc/def=',
        InstanceId: undefined,
        UserName: 'john@example.com',
        eventName: undefined,
        activityName: undefined,
        token: undefined
      })
    })
  })

  describe('isFromDashboard', () => {
    it('should return true when "s" parameter is present', () => {
      mockLocation('?s=encrypted123')

      expect(isFromDashboard()).toBe(true)
    })

    it('should return false when "s" parameter is missing', () => {
      mockLocation('?other=value')

      expect(isFromDashboard()).toBe(false)
    })

    it('should return false when no query parameters', () => {
      mockLocation('')

      expect(isFromDashboard()).toBe(false)
    })
  })

  describe('validateDashboardToken', () => {
    it('should return error when "s" parameter is missing', async () => {
      const result = await validateDashboardToken({})

      expect(result).toEqual({
        valid: false,
        error: 'Missing encrypted token parameter (s)'
      })
    })

    it('should call API with correct parameters', async () => {
      const mockResponse = {
        valid: true,
        parameters: {
          tokenId: 'token123',
          operation: 1,
          userName: 'admin'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const params = {
        s: 'encrypted123',
        InstanceId: '12345',
        UserName: 'admin',
        eventName: 'MyProcess',
        activityName: 'Task1',
        token: 'Basic123'
      }

      const result = await validateDashboardToken(params)

      expect(global.fetch).toHaveBeenCalledWith('/api/dashboard/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encryptedToken: 'encrypted123',
          instanceId: '12345',
          userName: 'admin',
          eventName: 'MyProcess',
          activityName: 'Task1',
          token: 'Basic123'
        })
      })

      expect(result).toEqual(mockResponse)
    })

    it('should handle API HTTP errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const result = await validateDashboardToken({ s: 'encrypted123' })

      expect(result).toEqual({
        valid: false,
        error: 'HTTP error! status: 500'
      })
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      const result = await validateDashboardToken({ s: 'encrypted123' })

      expect(result).toEqual({
        valid: false,
        error: 'Network error'
      })
    })

    it('should handle successful validation with all parameters', async () => {
      const mockResponse = {
        valid: true,
        parameters: {
          instanceId: '12345',
          userName: 'admin',
          eventName: 'MyProcess',
          activityName: 'Task1',
          token: 'Basic123',
          tokenId: 'token123',
          operation: 1,
          requesterAddress: '192.168.1.1',
          expirationDate: '2024-12-31'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await validateDashboardToken({ s: 'encrypted123' })

      expect(result.valid).toBe(true)
      expect(result.parameters).toBeDefined()
      expect(result.parameters?.tokenId).toBe('token123')
    })
  })

  describe('getDashboardParameters', () => {
    it('should return error when not from Dashboard', async () => {
      mockLocation('?other=value')

      const result = await getDashboardParameters()

      expect(result).toEqual({
        valid: false,
        error: 'Not loaded from Dashboard (missing "s" parameter)'
      })
    })

    it('should extract and validate when from Dashboard', async () => {
      mockLocation('?s=encrypted123&UserName=admin')

      const mockValidation = {
        valid: true,
        parameters: {
          userName: 'admin',
          tokenId: 'token123'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidation
      })

      const result = await getDashboardParameters()

      expect(result.valid).toBe(true)
      expect(result.parameters).toBeDefined()
      expect(result.parameters?.userName).toBe('admin')
    })

    it('should return validation error when token is invalid', async () => {
      mockLocation('?s=invalid_token')

      const mockValidation = {
        valid: false,
        error: 'Token expired'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidation
      })

      const result = await getDashboardParameters()

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Token expired')
    })

    it('should handle validation API errors', async () => {
      mockLocation('?s=encrypted123')

      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('API unavailable')
      )

      const result = await getDashboardParameters()

      expect(result.valid).toBe(false)
      expect(result.error).toBe('API unavailable')
    })
  })
})
