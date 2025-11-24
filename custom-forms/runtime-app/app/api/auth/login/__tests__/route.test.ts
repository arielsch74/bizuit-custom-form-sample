/**
 * Unit Tests for /api/auth/login route
 *
 * Tests the Next.js API route that proxies authentication requests to FastAPI backend
 */

import { POST } from '../route'
import { NextRequest } from 'next/server'

// Mock fetch globally
global.fetch = jest.fn()

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set required environment variable
    process.env.FASTAPI_URL = 'http://localhost:8000'
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return token and user data on successful login', async () => {
    // Arrange
    const mockResponse = {
      success: true,
      token: 'mock_jwt_token',
      user: {
        username: 'admin',
        roles: ['Administrators'],
        email: 'admin@test.com'
      }
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse
    })

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'password123'
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.token).toBe('mock_jwt_token')
    expect(data.user.username).toBe('admin')
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    )
  })

  it('should return 401 on invalid credentials', async () => {
    // Arrange
    const mockResponse = {
      success: false,
      error: 'Invalid credentials'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse
    })

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'wrongpassword'
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid credentials')
  })

  it('should return 400 if username is missing', async () => {
    // Arrange
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        password: 'password123'
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Username and password are required')
  })

  it('should return 400 if password is missing', async () => {
    // Arrange
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin'
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Username and password are required')
  })

  it('should return 500 on backend connection error', async () => {
    // Arrange
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    )

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'password123'
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Internal server error')
  })

  it('should send tenant_id to backend if provided', async () => {
    // Arrange
    const mockResponse = {
      success: true,
      token: 'mock_jwt_token_with_tenant',
      user: { username: 'admin', roles: ['Administrators'] }
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse
    })

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'password123',
        tenant_id: 'arielsch'
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)

    // Verify tenant_id was sent to backend
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
    const sentBody = JSON.parse(fetchCall[1].body)
    expect(sentBody.tenant_id).toBe('arielsch')
  })

  it('should handle backend returning no token', async () => {
    // Arrange
    const mockResponse = {
      success: true,
      // token is missing
      user: { username: 'admin' }
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockResponse
    })

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'password123'
      })
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid credentials')
  })
})
