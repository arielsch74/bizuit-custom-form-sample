/**
 * Navigation helpers with basePath support
 *
 * These utilities ensure all internal navigation respects the NEXT_PUBLIC_BASE_PATH
 * configuration for IIS virtual directory deployments.
 */

/**
 * Get the configured base path or empty string
 */
export function getBasePath(): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH
  return basePath && basePath !== 'undefined' ? basePath : ''
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
