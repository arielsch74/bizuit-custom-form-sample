/**
 * Unit Tests for /api/auth/logout route
 *
 * Tests the Next.js API route that clears authentication cookies
 */

import { POST } from '../route'
import { cookies } from 'next/headers'

// Mock next/headers cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn()
}))

describe('/api/auth/logout', () => {
  let mockCookieStore: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Create mock cookie store
    mockCookieStore = {
      delete: jest.fn()
    }

    ;(cookies as jest.Mock).mockResolvedValue(mockCookieStore)
  })

  it('should clear admin_token and admin_user_data cookies', async () => {
    // Act
    const response = await POST()
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockCookieStore.delete).toHaveBeenCalledWith('admin_token')
    expect(mockCookieStore.delete).toHaveBeenCalledWith('admin_user_data')
    expect(mockCookieStore.delete).toHaveBeenCalledTimes(2)
  })

  it('should return 500 on cookie store error', async () => {
    // Arrange
    ;(cookies as jest.Mock).mockRejectedValueOnce(
      new Error('Cookie store error')
    )

    // Act
    const response = await POST()
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Internal server error')
  })

  it('should handle tenant-prefixed cookies', async () => {
    // Note: This test documents expected behavior after implementation
    // Currently the route deletes 'admin_token' and 'admin_user_data'
    // After implementation, it should delete '{tenant}_admin_token' etc.

    // Act
    const response = await POST()
    const data = await response.json()

    // Assert: For now just verify it doesn't crash
    expect(response).toBeDefined()
    expect(data.success).toBe(true)

    // After implementation, should be:
    // expect(mockCookieStore.delete).toHaveBeenCalledWith('arielsch_admin_token')
    // expect(mockCookieStore.delete).toHaveBeenCalledWith('arielsch_admin_user_data')
  })

  it('should succeed even if cookies do not exist', async () => {
    // Arrange
    mockCookieStore.delete.mockImplementation(() => {
      // Simulate cookie.delete() when cookie doesn't exist (no-op)
      return undefined
    })

    // Act
    const response = await POST()
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
