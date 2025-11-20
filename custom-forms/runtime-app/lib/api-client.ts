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
  let normalizedPath = path.startsWith('/') ? path.slice(1) : path

  // Add trailing slash to API routes to prevent IIS redirect issues
  // IIS redirects POST requests without trailing slash, losing basePath
  if (!normalizedPath.endsWith('/')) {
    normalizedPath += '/'
  }

  // Combine basePath (which already has leading slash if set) with path
  return basePath ? `${basePath}/${normalizedPath}` : `/${normalizedPath}`
}

/**
 * Fetch wrapper that automatically adds basePath to API routes
 *
 * @param path - The API route path (e.g., '/api/auth/login')
 * @param options - Standard fetch options
 * @returns Promise<Response>
 *
 * @example
 * // Instead of:
 * fetch('/api/auth/login', { method: 'POST' })
 *
 * // Use:
 * apiFetch('/api/auth/login', { method: 'POST' })
 */
export async function apiFetch(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = getApiUrl(path)
  return fetch(url, options)
}
