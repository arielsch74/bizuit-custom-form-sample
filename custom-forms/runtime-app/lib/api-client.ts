/**
 * API Client Helper
 *
 * Handles basePath for API routes when running in production with IIS virtual directories
 *
 * In development: /api/auth/login
 * In production (IIS): /arielschBIZUITCustomForms/api/auth/login
 */

import { getTenantId as getTenantIdUtil } from './navigation'

/**
 * Get the base path from runtime configuration
 * This allows basePath to be changed without rebuilding
 */
const getBasePath = (): string => {
  // Server-side: use environment variable
  if (typeof window === 'undefined') {
    return process.env.BASE_PATH || ''
  }

  // Client-side: Extract basePath from Next.js data

  // Method 1: Try __NEXT_DATA__ (older Next.js versions)
  try {
    const nextData = (window as any).__NEXT_DATA__
    if (nextData) {
      return nextData.p || nextData.basePath || ''
    }
  } catch {}

  // Method 2: Parse from HTML script tags (Next.js 15 streaming format)
  // Next.js 15 puts basePath in: self.__next_f.push([1,"0:{...\"p\":\"/path\"..."])
  try {
    const scripts = document.querySelectorAll('script')
    for (const script of scripts) {
      const content = script.textContent || ''
      // Look for the pattern: \"p\":\"[basePath]\" (escaped quotes)
      const match = content.match(/\\"p\\":\\"(\/[^\\]+)\\"/)
      if (match && match[1]) {
        return match[1]
      }
    }
  } catch {}

  // Method 3: Try sessionStorage (set by RuntimeConfigProvider)
  try {
    const cached = sessionStorage.getItem('runtime-config')
    if (cached) {
      const config = JSON.parse(cached)
      return config.basePath || ''
    }
  } catch {}

  // Method 4: Check NEXT_PUBLIC_BASE_PATH from build time
  if (process.env.NEXT_PUBLIC_BASE_PATH) {
    return process.env.NEXT_PUBLIC_BASE_PATH
  }

  // Final fallback to empty string (root deployment)
  return ''
}

/**
 * Prepends the base path to an API route
 *
 * @param path - The API route path (e.g., '/api/auth/login')
 * @returns The full path with base path if configured
 *
 * @example
 * // Development (no basePath)
 * getApiUrl('/api/auth/login') // '/api/auth/login'
 *
 * // Production (with basePath = '/arielschBIZUITCustomForms')
 * getApiUrl('/api/auth/login') // '/arielschBIZUITCustomForms/api/auth/login'
 */
export function getApiUrl(path: string): string {
  const basePath = getBasePath()

  // Remove leading slash from path if it exists
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path

  // Combine basePath (which already has leading slash if set) with path
  return basePath ? `${basePath}/${normalizedPath}` : `/${normalizedPath}`
}

/**
 * Fetch wrapper that automatically adds basePath to API routes
 *
 * IMPORTANT: This MUST be used for ALL fetch() calls (both internal Next.js API routes
 * and external backend calls) because Next.js does NOT automatically add basePath
 * to client-side fetch() calls.
 *
 * @param path - The API route path (e.g., '/api/auth/login')
 * @param options - Standard fetch options
 * @returns Promise<Response>
 *
 * @example
 * // ALWAYS use apiFetch for API calls:
 * apiFetch('/api/auth/login', { method: 'POST' })
 * apiFetch('/api/custom-forms')
 */
export async function apiFetch(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = getApiUrl(path)

  // ALWAYS include credentials to ensure cookies are sent
  const fetchOptions: RequestInit = {
    ...options,
    credentials: 'include', // This ensures cookies are always sent with the request
    cache: 'no-store', // Force no caching
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      ...options?.headers,
    }
  }

  const response = await fetch(url, fetchOptions)

  // Intercept 401 Unauthorized - session expired, redirect to login
  if (response.status === 401) {
    // Check if we're in admin panel (avoid infinite redirect on login page)
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      const basePath = getBasePath()
      const adminPrefix = basePath ? `${basePath}/admin` : '/admin'
      const loginPath = `${adminPrefix}/login`

      // Only redirect if NOT already on login page
      if (currentPath.startsWith(adminPrefix) && currentPath !== loginPath) {
        // SECURITY: Check if there were cookies (session expired) or not (never authenticated)
        const tenantId = getTenantIdUtil()
        const cookiePrefix = tenantId !== 'default' ? `${tenantId}_` : ''
        const hadSession = document.cookie.includes(`${cookiePrefix}admin_token=`)

        // Clear admin cookies with tenant prefix for multi-tenant isolation
        document.cookie = `${cookiePrefix}admin_token=; path=${basePath || '/'}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        document.cookie = `${cookiePrefix}admin_user_data=; path=${basePath || '/'}; expires=Thu, 01 Jan 1970 00:00:00 GMT`

        // Redirect to login - add ?expired=true ONLY if there was a session
        const redirectUrl = hadSession ? `${loginPath}?expired=true` : loginPath
        window.location.href = redirectUrl
      }
    }
  }

  return response
}
