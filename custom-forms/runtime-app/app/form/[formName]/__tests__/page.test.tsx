/**
 * Tests for /form/[formName]/page.tsx
 *
 * Tests the main form loader component with Dashboard token validation
 * and ALLOW_DEV_MODE control.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import DynamicFormPage from '../page'

// Mock React.use() (React 19 feature) - return value directly for tests
jest.mock('react', () => {
  const actualReact = jest.requireActual('react')
  return {
    ...actualReact,
    use: jest.fn((value: any) => {
      // In tests, we pass the actual value, not a Promise
      return value
    })
  }
})

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => ({
    get: jest.fn((key: string) => {
      const params: Record<string, string> = {
        s: 'encrypted123',
        version: '1.0.0'
      }
      return params[key] || null
    })
  }))
}))

// Mock form loader
jest.mock('@/lib/form-loader', () => ({
  loadDynamicFormCached: jest.fn()
}))

// Mock dashboard params
jest.mock('@/lib/dashboard-params', () => ({
  getDashboardParameters: jest.fn(),
  isFromDashboard: jest.fn()
}))

// Mock components
jest.mock('@/components/FormContainer', () => ({
  FormContainer: ({ children }: any) => <div data-testid="form-container">{children}</div>
}))

jest.mock('@/components/FormLoadingState', () => ({
  FormLoadingState: ({ formName }: any) => <div data-testid="loading-state">Loading {formName}</div>
}))

jest.mock('@/components/FormErrorBoundary', () => ({
  FormErrorBoundary: ({ error, formName }: any) => (
    <div data-testid="error-boundary">
      Error in {formName}: {error}
    </div>
  )
}))

import { loadDynamicFormCached } from '@/lib/form-loader'
import { getDashboardParameters, isFromDashboard } from '@/lib/dashboard-params'

// Mock fetch
global.fetch = jest.fn()

describe('DynamicFormPage', () => {
  const mockFormComponent = () => <div data-testid="mock-form">Test Form</div>

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()

    // Default: production mode (ALLOW_DEV_MODE = false)
    process.env.NEXT_PUBLIC_ALLOW_DEV_MODE = 'false'
  })

  describe('Security: Dashboard Token Validation', () => {
    it('should load form when from Dashboard with valid token', async () => {
      // Setup: Dashboard with valid token
      ;(isFromDashboard as jest.Mock).mockReturnValue(true)
      ;(getDashboardParameters as jest.Mock).mockResolvedValue({
        valid: true,
        parameters: { userName: 'admin', tokenId: 'token123' }
      })
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          formName: 'test-form',
          currentVersion: '1.0.0',
          status: 'active'
        })
      })
      ;(loadDynamicFormCached as jest.Mock).mockResolvedValue(mockFormComponent)

      // Pass object directly (use() mock will handle it)
      const params = { formName: 'test-form' } as any
      render(<DynamicFormPage params={params} />)

      // Should show loading initially
      expect(screen.getByTestId('loading-state')).toBeInTheDocument()

      // Should load form
      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      expect(loadDynamicFormCached).toHaveBeenCalledWith('test-form', { version: '1.0.0' })
    })

    it('should block access when not from Dashboard in production mode', async () => {
      // Setup: Not from Dashboard, production mode
      ;(isFromDashboard as jest.Mock).mockReturnValue(false)
      process.env.NEXT_PUBLIC_ALLOW_DEV_MODE = 'false'

      // Pass object directly (use() mock will handle it)
      const params = { formName: 'test-form' } as any
      render(<DynamicFormPage params={params} />)

      // Should show error
      await waitFor(() => {
        const error = screen.getByTestId('error-boundary')
        expect(error).toBeInTheDocument()
        expect(error).toHaveTextContent('Access Denied')
        expect(error).toHaveTextContent('must be accessed through Bizuit Dashboard')
      })

      // Should NOT attempt to load form
      expect(loadDynamicFormCached).not.toHaveBeenCalled()
    })

    it('should block access when Dashboard token validation fails', async () => {
      // Setup: Dashboard but invalid token
      ;(isFromDashboard as jest.Mock).mockReturnValue(true)
      ;(getDashboardParameters as jest.Mock).mockResolvedValue({
        valid: false,
        error: 'Token expired'
      })

      // Pass object directly (use() mock will handle it)
      const params = { formName: 'test-form' } as any
      render(<DynamicFormPage params={params} />)

      // Should show error
      await waitFor(() => {
        const error = screen.getByTestId('error-boundary')
        expect(error).toBeInTheDocument()
        expect(error).toHaveTextContent('Dashboard token validation failed: Token expired')
      })

      // Should NOT attempt to load form
      expect(loadDynamicFormCached).not.toHaveBeenCalled()
    })
  })

  describe('Development Mode (ALLOW_DEV_MODE)', () => {
    it('should allow access without Dashboard token when ALLOW_DEV_MODE=true', async () => {
      // Setup: Dev mode enabled, no Dashboard token
      process.env.NEXT_PUBLIC_ALLOW_DEV_MODE = 'true'
      ;(isFromDashboard as jest.Mock).mockReturnValue(false)
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          formName: 'test-form',
          currentVersion: '1.0.0',
          status: 'active'
        })
      })
      ;(loadDynamicFormCached as jest.Mock).mockResolvedValue(mockFormComponent)

      // Pass object directly (use() mock will handle it)
      const params = { formName: 'test-form' } as any
      render(<DynamicFormPage params={params} />)

      // Should load form successfully
      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      expect(loadDynamicFormCached).toHaveBeenCalled()
    })

    it('should block access without Dashboard token when ALLOW_DEV_MODE=false', async () => {
      // Setup: Dev mode disabled, no Dashboard token
      process.env.NEXT_PUBLIC_ALLOW_DEV_MODE = 'false'
      ;(isFromDashboard as jest.Mock).mockReturnValue(false)

      // Pass object directly (use() mock will handle it)
      const params = { formName: 'test-form' } as any
      render(<DynamicFormPage params={params} />)

      // Should show error
      await waitFor(() => {
        const error = screen.getByTestId('error-boundary')
        expect(error).toBeInTheDocument()
        expect(error).toHaveTextContent('Access Denied')
      })
    })
  })

  describe('Form Loading', () => {
    beforeEach(() => {
      // Allow access for these tests
      process.env.NEXT_PUBLIC_ALLOW_DEV_MODE = 'true'
      ;(isFromDashboard as jest.Mock).mockReturnValue(false)
    })

    it('should handle form not found error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404
      })

      const params = { formName: 'non-existent-form' } as any
      render(<DynamicFormPage params={params} />)

      await waitFor(() => {
        const error = screen.getByTestId('error-boundary')
        expect(error).toBeInTheDocument()
        expect(error).toHaveTextContent('Form "non-existent-form" not found')
      })
    })

    it('should handle inactive form status', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          formName: 'test-form',
          currentVersion: '1.0.0',
          status: 'inactive'
        })
      })

      // Pass object directly (use() mock will handle it)
      const params = { formName: 'test-form' } as any
      render(<DynamicFormPage params={params} />)

      await waitFor(() => {
        const error = screen.getByTestId('error-boundary')
        expect(error).toBeInTheDocument()
        expect(error).toHaveTextContent('Form "test-form" is inactive')
      })
    })

    it('should use version from URL parameter', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          formName: 'test-form',
          currentVersion: '2.0.0',
          status: 'active'
        })
      })
      ;(loadDynamicFormCached as jest.Mock).mockResolvedValue(mockFormComponent)

      // Pass object directly (use() mock will handle it)
      const params = { formName: 'test-form' } as any
      render(<DynamicFormPage params={params} />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Should use version from URL (mocked as '1.0.0') not metadata ('2.0.0')
      expect(loadDynamicFormCached).toHaveBeenCalledWith('test-form', { version: '1.0.0' })
    })

    it('should use currentVersion from metadata when no URL version', async () => {
      // Mock searchParams without version
      const { useSearchParams } = require('next/navigation')
      useSearchParams.mockReturnValue({
        get: jest.fn((key: string) => {
          if (key === 's') return 'encrypted123'
          return null // No version parameter
        })
      })

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          formName: 'test-form',
          currentVersion: '2.0.0',
          status: 'active'
        })
      })
      ;(loadDynamicFormCached as jest.Mock).mockResolvedValue(mockFormComponent)

      // Pass object directly (use() mock will handle it)
      const params = { formName: 'test-form' } as any
      render(<DynamicFormPage params={params} />)

      await waitFor(() => {
        expect(screen.getByTestId('form-container')).toBeInTheDocument()
      })

      // Should use version from metadata
      expect(loadDynamicFormCached).toHaveBeenCalledWith('test-form', { version: '2.0.0' })
    })
  })
})
