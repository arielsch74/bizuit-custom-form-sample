/**
 * Tests for iframe-origin-validator.ts
 */

import {
  parseAllowedOrigins,
  isOriginAllowed,
  getParentOrigin,
  isInIframe,
  validateIframeOrigin,
} from '../iframe-origin-validator'

describe('Iframe Origin Validator', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS
    delete process.env.NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME
  })

  describe('parseAllowedOrigins', () => {
    it('should parse comma-separated origins from env', () => {
      process.env.NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS = 'https://app.com,https://test.app.com'

      const origins = parseAllowedOrigins()

      expect(origins).toEqual(['https://app.com', 'https://test.app.com'])
    })

    it('should trim whitespace from origins', () => {
      process.env.NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS = ' https://app.com , https://test.app.com '

      const origins = parseAllowedOrigins()

      expect(origins).toEqual(['https://app.com', 'https://test.app.com'])
    })

    it('should include localhost when ALLOW_LOCALHOST_IFRAME=true', () => {
      process.env.NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS = 'https://app.com'
      process.env.NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME = 'true'

      const origins = parseAllowedOrigins()

      expect(origins).toContain('https://app.com')
      expect(origins).toContain('http://localhost')
      expect(origins).toContain('http://127.0.0.1')
    })

    it('should not include localhost when ALLOW_LOCALHOST_IFRAME=false', () => {
      process.env.NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS = 'https://app.com'
      process.env.NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME = 'false'

      const origins = parseAllowedOrigins()

      expect(origins).toEqual(['https://app.com'])
      expect(origins).not.toContain('http://localhost')
    })

    it('should return empty array when no origins configured', () => {
      const origins = parseAllowedOrigins()

      expect(origins).toEqual([])
    })
  })

  describe('isOriginAllowed', () => {
    it('should match exact origin', () => {
      expect(isOriginAllowed('https://app.com', 'https://app.com')).toBe(true)
    })

    it('should not match different origin', () => {
      expect(isOriginAllowed('https://evil.com', 'https://app.com')).toBe(false)
    })

    it('should match wildcard subdomain', () => {
      expect(isOriginAllowed('https://sub.app.com', 'https://*.app.com')).toBe(true)
      expect(isOriginAllowed('https://test.app.com', 'https://*.app.com')).toBe(true)
      expect(isOriginAllowed('https://deep.sub.app.com', 'https://*.app.com')).toBe(true)
    })

    it('should not match wildcard for different domain', () => {
      expect(isOriginAllowed('https://evil.com', 'https://*.app.com')).toBe(false)
    })

    it('should match localhost with different ports', () => {
      expect(isOriginAllowed('http://localhost:3000', 'http://localhost')).toBe(true)
      expect(isOriginAllowed('http://localhost:8080', 'http://localhost')).toBe(true)
      expect(isOriginAllowed('http://127.0.0.1:3000', 'http://127.0.0.1')).toBe(true)
    })

    it('should not match localhost to external domain', () => {
      expect(isOriginAllowed('http://localhost:3000', 'https://app.com')).toBe(false)
    })
  })

  describe('isInIframe', () => {
    it('should return true when in iframe', () => {
      // Mock window.self !== window.top
      Object.defineProperty(window, 'self', { value: window, writable: true })
      Object.defineProperty(window, 'top', { value: {}, writable: true })

      expect(isInIframe()).toBe(true)
    })

    it('should return false when not in iframe', () => {
      // Mock window.self === window.top
      Object.defineProperty(window, 'self', { value: window, writable: true })
      Object.defineProperty(window, 'top', { value: window, writable: true })

      expect(isInIframe()).toBe(false)
    })
  })

  describe('getParentOrigin', () => {
    it('should return origin from document.referrer', () => {
      Object.defineProperty(document, 'referrer', {
        value: 'https://parent.com/page',
        writable: true,
        configurable: true
      })

      const origin = getParentOrigin()

      expect(origin).toBe('https://parent.com')
    })

    it('should return null when no referrer', () => {
      Object.defineProperty(document, 'referrer', {
        value: '',
        writable: true,
        configurable: true
      })

      const origin = getParentOrigin()

      expect(origin).toBeNull()
    })

    it('should handle invalid referrer URL', () => {
      Object.defineProperty(document, 'referrer', {
        value: 'not-a-valid-url',
        writable: true,
        configurable: true
      })

      const origin = getParentOrigin()

      expect(origin).toBeNull()
    })
  })

  describe('validateIframeOrigin', () => {
    beforeEach(() => {
      // Reset mocks
      Object.defineProperty(document, 'referrer', {
        value: '',
        writable: true,
        configurable: true
      })
      Object.defineProperty(window, 'self', { value: window, writable: true })
      Object.defineProperty(window, 'top', { value: window, writable: true })
    })

    it('should fail when not in iframe', () => {
      // Not in iframe
      Object.defineProperty(window, 'top', { value: window })

      const result = validateIframeOrigin(['https://app.com'])

      expect(result.isInIframe).toBe(false)
      expect(result.isAllowedOrigin).toBe(false)
      expect(result.error).toBe('Page must be loaded in an iframe')
    })

    it('should fail when parent origin cannot be determined', () => {
      // In iframe but no referrer
      Object.defineProperty(window, 'top', { value: {} })
      Object.defineProperty(document, 'referrer', { value: '' })

      const result = validateIframeOrigin(['https://app.com'])

      expect(result.isInIframe).toBe(true)
      expect(result.isAllowedOrigin).toBe(false)
      expect(result.error).toBe('Unable to determine parent frame origin')
    })

    it('should fail when origin is not in allowed list', () => {
      // In iframe from evil.com
      Object.defineProperty(window, 'top', { value: {} })
      Object.defineProperty(document, 'referrer', { value: 'https://evil.com/page' })

      const result = validateIframeOrigin(['https://app.com'])

      expect(result.isInIframe).toBe(true)
      expect(result.isAllowedOrigin).toBe(false)
      expect(result.parentOrigin).toBe('https://evil.com')
      expect(result.error).toContain('not in the allowed list')
    })

    it('should succeed when origin is allowed', () => {
      // In iframe from app.com
      Object.defineProperty(window, 'top', { value: {} })
      Object.defineProperty(document, 'referrer', { value: 'https://app.com/page' })

      const result = validateIframeOrigin(['https://app.com', 'https://test.com'])

      expect(result.isInIframe).toBe(true)
      expect(result.isAllowedOrigin).toBe(true)
      expect(result.parentOrigin).toBe('https://app.com')
      expect(result.error).toBeUndefined()
    })

    it('should succeed with wildcard subdomain', () => {
      // In iframe from subdomain
      Object.defineProperty(window, 'top', { value: {} })
      Object.defineProperty(document, 'referrer', { value: 'https://test.app.com/page' })

      const result = validateIframeOrigin(['https://*.app.com'])

      expect(result.isInIframe).toBe(true)
      expect(result.isAllowedOrigin).toBe(true)
      expect(result.parentOrigin).toBe('https://test.app.com')
    })

    it('should use env vars when no origins provided', () => {
      process.env.NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS = 'https://app.com'

      Object.defineProperty(window, 'top', { value: {} })
      Object.defineProperty(document, 'referrer', { value: 'https://app.com/page' })

      const result = validateIframeOrigin()

      expect(result.isAllowedOrigin).toBe(true)
    })
  })
})
