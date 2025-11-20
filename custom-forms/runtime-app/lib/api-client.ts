/**
 * API Client Helper
 *
 * Handles basePath for API routes when running in production with IIS virtual directories
 *
 * In development: /api/auth/login
 * In production (IIS): /arielschBIZUITCustomForms/api/auth/login
 */

/**
 * Get the base path from environment variable or default to empty string
 * NEXT_PUBLIC_BASE_PATH is set in .env.local for production deployments
 */
const getBasePath = (): string => {
  // During build time, process.env.NEXT_PUBLIC_BASE_PATH will be available
  // During runtime (client-side), it's available via process.env
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH
  return basePath && basePath !== 'undefined' ? basePath : ''
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
  return fetch(url, options)
}
