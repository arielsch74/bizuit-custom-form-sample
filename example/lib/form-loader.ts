/**
 * Dynamic Form Loader
 *
 * Carga forms React dinámicamente desde múltiples CDN con fallback.
 * Los forms pueden venir de cualquier monorepo y se cargan en runtime.
 */

import React from 'react'
import * as ReactDOM from 'react-dom'

// Make React available globally for dynamically loaded forms
// Esto DEBE ejecutarse antes de cargar cualquier form
if (typeof window !== 'undefined') {
  (window as any).React = React;
  (window as any).ReactDOM = ReactDOM;
  console.log('[Form Loader] React exposed globally for dynamic forms')
}

/**
 * CDNs soportados para cargar ESM modules
 * Se intentan en orden hasta que uno funcione
 */
const CDN_PROVIDERS = [
  'https://esm.sh',
  'https://cdn.jsdelivr.net/npm',
  'https://unpkg.com',
]

/**
 * Genera URLs de CDN para un package npm
 */
function generateCdnUrls(packageName: string, version: string): string[] {
  return CDN_PROVIDERS.map(cdn => {
    if (cdn.includes('esm.sh')) {
      // esm.sh format with external deps
      // Esto le dice a esm.sh que use React del browser (window.React)
      return `${cdn}/${packageName}@${version}?external=react,react-dom`
    } else if (cdn.includes('jsdelivr')) {
      // jsdelivr format: https://cdn.jsdelivr.net/npm/@scope/package@version/+esm
      return `${cdn}/${packageName}@${version}/+esm`
    } else {
      // unpkg format: https://unpkg.com/@scope/package@version?module
      return `${cdn}/${packageName}@${version}?module`
    }
  })
}

/**
 * Carga un form dinámicamente desde CDN
 *
 * @param packageName - Nombre del package npm (ej: "@empresa/aprobacion-gastos")
 * @param version - Versión del package (ej: "1.0.0")
 * @returns Component React del form
 *
 * @example
 * ```typescript
 * const FormComponent = await loadDynamicForm('@empresa/aprobacion-gastos', '1.0.0')
 * ```
 */
export async function loadDynamicForm(
  packageName: string,
  version: string
): Promise<React.ComponentType<any>> {
  const urls = generateCdnUrls(packageName, version)

  console.log(`[Form Loader] Loading ${packageName}@${version}`)
  console.log(`[Form Loader] CDN URLs:`, urls)

  let lastError: Error | null = null

  // Intentar cada CDN en orden
  for (const url of urls) {
    try {
      console.log(`[Form Loader] Trying: ${url}`)

      const startTime = Date.now()

      // Dynamic import del ESM module
      const module = await import(/* webpackIgnore: true */ url)

      const loadTime = Date.now() - startTime
      console.log(`[Form Loader] ✅ Loaded from ${url} in ${loadTime}ms`)

      // El form debe exportar un default export
      if (!module.default) {
        throw new Error('Form module must have a default export')
      }

      return module.default

    } catch (error: any) {
      console.warn(`[Form Loader] ❌ Failed to load from ${url}:`, error.message)
      lastError = error
      // Continuar con el siguiente CDN
    }
  }

  // Si llegamos acá, todos los CDN fallaron
  throw new Error(
    `Failed to load form ${packageName}@${version} from all CDN providers. ` +
    `Last error: ${lastError?.message || 'Unknown error'}`
  )
}

/**
 * Precarga un form en background (opcional)
 * Útil para mejorar performance cuando sabés qué forms se van a usar
 */
export async function preloadForm(
  packageName: string,
  version: string
): Promise<void> {
  try {
    await loadDynamicForm(packageName, version)
    console.log(`[Form Loader] ✅ Preloaded ${packageName}@${version}`)
  } catch (error: any) {
    console.warn(`[Form Loader] ⚠️  Failed to preload ${packageName}:`, error.message)
  }
}

/**
 * Cache de forms ya cargados (en memoria)
 * Evita recargar el mismo form múltiples veces
 */
const formCache = new Map<string, React.ComponentType<any>>()

/**
 * Carga un form con cache
 * Si el form ya fue cargado antes, lo retorna del cache
 */
export async function loadDynamicFormCached(
  packageName: string,
  version: string
): Promise<React.ComponentType<any>> {
  const cacheKey = `${packageName}@${version}`

  // Verificar cache
  if (formCache.has(cacheKey)) {
    console.log(`[Form Loader] ✅ Loaded from cache: ${cacheKey}`)
    return formCache.get(cacheKey)!
  }

  // Cargar desde CDN
  const component = await loadDynamicForm(packageName, version)

  // Guardar en cache
  formCache.set(cacheKey, component)

  return component
}

/**
 * Limpia el cache de forms
 * Útil cuando se publica una nueva versión de un form
 */
export function clearFormCache(packageName?: string): void {
  if (packageName) {
    // Limpiar solo forms que empiecen con ese packageName
    for (const key of formCache.keys()) {
      if (key.startsWith(packageName)) {
        formCache.delete(key)
      }
    }
    console.log(`[Form Loader] 🧹 Cleared cache for ${packageName}`)
  } else {
    // Limpiar todo el cache
    formCache.clear()
    console.log(`[Form Loader] 🧹 Cleared entire cache`)
  }
}
