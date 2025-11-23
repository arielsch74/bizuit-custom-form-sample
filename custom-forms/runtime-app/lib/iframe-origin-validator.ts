/**
 * Iframe Origin Validator
 *
 * Validates that the current page is loaded inside an iframe and
 * that the parent frame origin is in the allowed list.
 *
 * Used by standalone forms (/formsa/*) that should only be accessible
 * via iframe embedding.
 */

export interface IframeValidationResult {
  isInIframe: boolean
  isAllowedOrigin: boolean
  parentOrigin: string | null
  error?: string
}

/**
 * Parse allowed origins from environment variable
 *
 * Supports:
 * - Comma-separated list: "https://app.com,https://test.app.com"
 * - Wildcard subdomains: "https://*.app.com"
 * - Localhost (if ALLOW_LOCALHOST_IFRAME=true)
 */
export function parseAllowedOrigins(): string[] {
  const origins: string[] = []

  // Get configured origins from env
  const configuredOrigins = process.env.NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS
  if (configuredOrigins) {
    origins.push(...configuredOrigins.split(',').map(o => o.trim()).filter(Boolean))
  }

  // Add localhost if allowed (for development)
  if (process.env.NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME === 'true') {
    origins.push('http://localhost')
    origins.push('http://127.0.0.1')
  }

  return origins
}

/**
 * Check if an origin matches an allowed pattern
 *
 * Supports exact match and wildcard subdomain matching
 */
export function isOriginAllowed(origin: string, allowedPattern: string): boolean {
  // Exact match
  if (origin === allowedPattern) {
    return true
  }

  // Wildcard subdomain match (e.g., https://*.example.com)
  if (allowedPattern.includes('*')) {
    const regex = new RegExp('^' + allowedPattern.replace(/\*/g, '.*') + '$')
    return regex.test(origin)
  }

  // Port-agnostic localhost match
  if (allowedPattern.startsWith('http://localhost') || allowedPattern.startsWith('http://127.0.0.1')) {
    const allowedHost = allowedPattern.split('://')[1].split(':')[0]
    const originHost = origin.split('://')[1]?.split(':')[0]
    return originHost === allowedHost
  }

  return false
}

/**
 * Get parent frame origin
 *
 * Returns null if not in iframe or if cross-origin restrictions prevent access
 */
export function getParentOrigin(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    // Try to get from document.referrer (most reliable)
    if (document.referrer) {
      const url = new URL(document.referrer)
      return url.origin
    }

    // Fallback: try to access parent.location (will fail cross-origin)
    if (window.parent && window.parent !== window) {
      return window.parent.location.origin
    }

    return null
  } catch (error) {
    // Cross-origin access blocked - use document.referrer if available
    if (document.referrer) {
      try {
        const url = new URL(document.referrer)
        return url.origin
      } catch {
        return null
      }
    }
    return null
  }
}

/**
 * Check if current page is loaded in an iframe
 */
export function isInIframe(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return window.self !== window.top
}

/**
 * Validate iframe origin against allowed list
 *
 * Main function to use in components.
 */
export function validateIframeOrigin(allowedOrigins?: string[]): IframeValidationResult {
  // Use provided list or parse from env
  const origins = allowedOrigins || parseAllowedOrigins()

  // Check if in iframe
  const inIframe = isInIframe()
  if (!inIframe) {
    return {
      isInIframe: false,
      isAllowedOrigin: false,
      parentOrigin: null,
      error: 'Page must be loaded in an iframe'
    }
  }

  // Get parent origin
  const parentOrigin = getParentOrigin()
  if (!parentOrigin) {
    return {
      isInIframe: true,
      isAllowedOrigin: false,
      parentOrigin: null,
      error: 'Unable to determine parent frame origin'
    }
  }

  // Check if origin is allowed
  const allowed = origins.some(pattern => isOriginAllowed(parentOrigin, pattern))

  if (!allowed) {
    return {
      isInIframe: true,
      isAllowedOrigin: false,
      parentOrigin,
      error: `Origin "${parentOrigin}" is not in the allowed list`
    }
  }

  // All checks passed
  return {
    isInIframe: true,
    isAllowedOrigin: true,
    parentOrigin
  }
}
