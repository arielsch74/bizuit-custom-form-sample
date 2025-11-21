/**
 * Navigation helpers with basePath support
 *
 * These utilities ensure all internal navigation respects the runtime BASE_PATH
 * configuration for IIS virtual directory deployments.
 */

/**
 * Get the configured base path from runtime configuration
 */
export function getBasePath(): string {
  // Server-side: use environment variable
  if (typeof window === 'undefined') {
    return process.env.BASE_PATH || ''
  }

  // Client-side: try to get from sessionStorage (set by RuntimeConfigProvider)
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
 * Add basePath to a relative URL
 *
 * @param path - Relative path (e.g., '/admin', '/form/my-form')
 * @returns Full path with basePath prepended
 *
 * @example
 * // Development (no basePath)
 * withBasePath('/admin') // '/admin'
 *
 * // Production (basePath = '/arielschBIZUITCustomForms')
 * withBasePath('/admin') // '/arielschBIZUITCustomForms/admin'
 */
export function withBasePath(path: string): string {
  const basePath = getBasePath()

  // Remove leading slash from path if exists
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path

  // If path is just '/', return basePath or '/'
  if (normalizedPath === '') {
    return basePath || '/'
  }

  return basePath ? `${basePath}/${normalizedPath}` : `/${normalizedPath}`
}
