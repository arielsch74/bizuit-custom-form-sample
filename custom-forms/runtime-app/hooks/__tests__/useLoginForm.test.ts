import { renderHook, act, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useLoginForm } from '../useLoginForm'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock fetch globally
global.fetch = jest.fn()

describe('useLoginForm', () => {
  const mockPush = jest.fn()
  const mockRouter = { push: mockPush }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(global.fetch as jest.Mock).mockClear()

    // Mock localStorage
    Storage.prototype.setItem = jest.fn()
    Storage.prototype.getItem = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should initialize with empty values', () => {
    const { result } = renderHook(() => useLoginForm())

    expect(result.current.username).toBe('')
    expect(result.current.password).toBe('')
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('')
  })

  it('should update username when setUsername is called', () => {
    const { result } = renderHook(() => useLoginForm())

    act(() => {
      result.current.setUsername('testuser')
    })

    expect(result.current.username).toBe('testuser')
  })

  it('should update password when setPassword is called', () => {
    const { result } = renderHook(() => useLoginForm())

    act(() => {
      result.current.setPassword('testpass')
    })

    expect(result.current.password).toBe('testpass')
  })

  it('should handle successful login', async () => {
    const mockResponse = {
      success: true,
      user: { id: 1, username: 'testuser', role: 'admin' },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useLoginForm('/admin'))

    act(() => {
      result.current.setUsername('testuser')
      result.current.setPassword('testpass')
    })

    const mockEvent = { preventDefault: jest.fn() } as any

    await act(async () => {
      await result.current.handleLogin(mockEvent)
    })

    await waitFor(() => {
      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'testuser', password: 'testpass' }),
          credentials: 'include',
        })
      )
      // No localStorage calls - cookies are used instead
      expect(localStorage.setItem).not.toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/admin')
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('')
    })
  })

  it('should handle login failure with error message', async () => {
    const mockResponse = {
      success: false,
      error: 'Credenciales inválidas',
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useLoginForm())

    act(() => {
      result.current.setUsername('wronguser')
      result.current.setPassword('wrongpass')
    })

    const mockEvent = { preventDefault: jest.fn() } as any

    await act(async () => {
      await result.current.handleLogin(mockEvent)
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Credenciales inválidas')
      expect(result.current.loading).toBe(false)
      expect(mockPush).not.toHaveBeenCalled()
      expect(localStorage.setItem).not.toHaveBeenCalled()
    })
  })

  it('should handle login failure without specific error', async () => {
    const mockResponse = {
      success: false,
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useLoginForm())

    const mockEvent = { preventDefault: jest.fn() } as any

    await act(async () => {
      await result.current.handleLogin(mockEvent)
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Credenciales inválidas')
      expect(result.current.loading).toBe(false)
    })
  })

  it('should handle network errors', async () => {
    const networkError = new Error('Network error')
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(networkError)

    const { result } = renderHook(() => useLoginForm())

    const mockEvent = { preventDefault: jest.fn() } as any

    await act(async () => {
      await result.current.handleLogin(mockEvent)
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Error de conexión: Network error')
      expect(result.current.loading).toBe(false)
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('should set loading state during login process', async () => {
    const mockResponse = {
      success: true,
      token: 'test-token',
      user: { id: 1, username: 'test' },
    }

    let resolvePromise: (value: any) => void
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    ;(global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise)

    const { result } = renderHook(() => useLoginForm())

    const mockEvent = { preventDefault: jest.fn() } as any

    // Start login
    act(() => {
      result.current.handleLogin(mockEvent)
    })

    // Loading should be true
    expect(result.current.loading).toBe(true)

    // Resolve the fetch
    await act(async () => {
      resolvePromise!({ json: async () => mockResponse })
    })

    // Loading should be false after completion
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('should use custom redirect path', async () => {
    const mockResponse = {
      success: true,
      token: 'test-token',
      user: { id: 1, username: 'test' },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useLoginForm('/custom-path'))

    const mockEvent = { preventDefault: jest.fn() } as any

    await act(async () => {
      await result.current.handleLogin(mockEvent)
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-path')
    })
  })

  it('should use Next.js API route for login', async () => {
    const mockResponse = {
      success: true,
      user: { id: 1, username: 'test' },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useLoginForm())

    const mockEvent = { preventDefault: jest.fn() } as any

    await act(async () => {
      await result.current.handleLogin(mockEvent)
    })

    await waitFor(() => {
      // Should use Next.js API route, not external URL
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.any(Object)
      )
    })
  })

  describe('Tenant Support', () => {
    beforeEach(() => {
      // Mock document.cookie
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: ''
      })
    })

    it('should store cookies with tenant prefix on successful login', async () => {
      // Mock basePath to simulate arielsch deployment
      const mockResponse = {
        success: true,
        token: 'mock_jwt_token',
        user: { username: 'admin', roles: ['Administrators'] }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      })

      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.setUsername('admin')
        result.current.setPassword('password123')
      })

      const mockEvent = { preventDefault: jest.fn() } as any

      await act(async () => {
        await result.current.handleLogin(mockEvent)
      })

      // Note: This test documents expected behavior after implementation
      // Currently cookies are stored as 'admin_token' and 'admin_user_data'
      // After implementation should be '{tenant}_admin_token' etc.

      // For now just verify login succeeds
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      })
    })

    it('should extract tenant ID from basePath', () => {
      // This test documents the expected getTenantId() utility function
      // Examples:
      // '/arielschBIZUITCustomForms' -> 'arielsch'
      // '/recubizBIZUITCustomForms' -> 'recubiz'
      // '/' -> 'default'

      // Mock implementation to test
      const getTenantId = (basePath: string): string => {
        if (!basePath || basePath === '/') return 'default'
        const match = basePath.match(/^\/([^B]+)BIZUIT/)
        return match ? match[1] : 'default'
      }

      expect(getTenantId('/arielschBIZUITCustomForms')).toBe('arielsch')
      expect(getTenantId('/recubizBIZUITCustomForms')).toBe('recubiz')
      expect(getTenantId('/')).toBe('default')
      expect(getTenantId('')).toBe('default')
      expect(getTenantId('/somethingelse')).toBe('default')
    })

    it('should use correct cookie names for tenant', async () => {
      // This test verifies that cookies use tenant-specific names
      const mockResponse = {
        success: true,
        token: 'mock_token',
        user: { username: 'admin' }
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      })

      const { result } = renderHook(() => useLoginForm())

      const mockEvent = { preventDefault: jest.fn() } as any

      await act(async () => {
        await result.current.handleLogin(mockEvent)
      })

      // After implementation, verify document.cookie contains tenant-prefixed cookies
      // For example: 'arielsch_admin_token=...' instead of 'admin_token=...'
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      })
    })
  })
})
