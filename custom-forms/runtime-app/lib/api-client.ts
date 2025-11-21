/**
 * API Client Helper
 *
 * Handles basePath for API routes when running in production with IIS virtual directories
 *
 * In development: /api/auth/login
 * In production (IIS): /arielschBIZUITCustomForms/api/auth/login
 */

/**
 * Get the base path from runtime configuration
 * This allows basePath to be changed without rebuilding
 */
const getBasePath = (): string => {
  // Server-side: use environment variable
  if (typeof window === 'undefined') {
    return process.env.BASE_PATH || ''
  }

  // Client-side: Extract basePath from Next.js runtime
  // Next.js exposes the basePath in __NEXT_DATA__ which is set at runtime
  try {
    // @ts-ignore - __NEXT_DATA__ is Next.js internal
    const nextData = (window as any).__NEXT_DATA__
    if (nextData && nextData.basePath) {
      return nextData.basePath
    }
  } catch {}

  // Fallback: try to get from sessionStorage (set by RuntimeConfigProvider)
  try {
    const cached = sessionStorage.getItem('runtime-config')
    if (cached) {
      const config = JSON.parse(cached)
      return config.basePath || ''
    }
  } catch {}

  // Fallback to empty string
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

  return fetch(url, fetchOptions)
}
