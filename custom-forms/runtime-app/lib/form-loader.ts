/**
 * Dynamic Form Loader (Refactored for Database Storage)
 *
 * Carga forms React dinámicamente desde la BD (via API mock que simula SQL Server).
 * El código compilado viene directo de CustomFormVersions.CompiledCode
 */

const FORMS_API = '/api/custom-forms'

interface LoadOptions {
  version?: string
}

/**
 * Carga un form component dinámicamente desde la BD (via API)
 *
 * @param formName - Nombre del form (ej: "aprobacion-gastos")
 * @param options - Opciones de carga (version específica opcional)
 * @returns Component React del form
 *
 * @example
 * ```typescript
 * const FormComponent = await loadDynamicForm('aprobacion-gastos')
 * ```
 */
export async function loadDynamicForm(
  formName: string,
  options: LoadOptions = {}
): Promise<React.ComponentType<any>> {
  console.log(`[Form Loader] Loading form: ${formName}`)

  const startTime = Date.now()

  try {
    // 1. Fetch código compilado desde API (simula SELECT compiled_code FROM CustomFormVersions)
    // Extract basePath from pathname (handles both /form/ and /formsa/ routes)
    const basePath = typeof window !== 'undefined'
      ? window.location.pathname.split('/form')[0] // Matches both /form/ and /formsa/
      : ''
    const url = `${window.location.origin}${basePath}${FORMS_API}/${formName}/code${
      options.version ? `?version=${options.version}` : ''
    }`

    const response = await fetch(url, {
      headers: {
        Accept: 'application/javascript',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(`Failed to load form: ${error.error || response.statusText}`)
    }

    const compiledCode = await response.text()

    // Log metadata headers (simulan lo que vendría de la BD)
    const version = response.headers.get('X-Form-Version')
    const publishedAt = response.headers.get('X-Published-At')
    const sizeBytes = response.headers.get('X-Size-Bytes')

    console.log(`[Form Loader] ✅ Fetched ${formName}@${version} (${sizeBytes} bytes, published: ${publishedAt})`)

    // 2. Crear blob URL para dynamic import
    // Esto permite que el navegador ejecute el código como un ES Module
    const blob = new Blob([compiledCode], { type: 'application/javascript' })
    const blobUrl = URL.createObjectURL(blob)

    console.log(`[Form Loader] ✅ Created blob URL: ${blobUrl.substring(0, 50)}...`)

    // 3. Dynamic import del blob URL
    // @ts-ignore - dynamic import de blob URL no tiene types
    const module = await import(/* webpackIgnore: true */ /* @vite-ignore */ blobUrl)

    // 4. Cleanup blob URL (ya no se necesita después del import)
    URL.revokeObjectURL(blobUrl)

    if (!module.default) {
      throw new Error(`Form ${formName} does not export a default component`)
    }

    const loadTime = Date.now() - startTime
    console.log(`[Form Loader] ✅ Successfully loaded ${formName} in ${loadTime}ms`)

    return module.default

  } catch (error: any) {
    console.error(`[Form Loader] ❌ Failed to load form ${formName}:`, error)
    throw new Error(`Failed to load form: ${error.message}`)
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
  formName: string,
  options: LoadOptions = {}
): Promise<React.ComponentType<any>> {
  const cacheKey = `${formName}@${options.version || 'latest'}`

  // Verificar cache
  if (formCache.has(cacheKey)) {
    console.log(`[Form Loader] ✅ Cache hit: ${cacheKey}`)
    return formCache.get(cacheKey)!
  }

  // Cargar desde BD (via API)
  const component = await loadDynamicForm(formName, options)

  // Guardar en cache
  formCache.set(cacheKey, component)

  return component
}

/**
 * Invalida cache de un form específico
 * Útil cuando se publica una nueva versión
 */
export function invalidateFormCache(formName: string): void {
  const keysToDelete: string[] = []

  for (const key of formCache.keys()) {
    if (key.startsWith(`${formName}@`)) {
      keysToDelete.push(key)
    }
  }

  keysToDelete.forEach((key) => formCache.delete(key))
  console.log(`[Form Loader] 🧹 Cache invalidated for ${formName} (${keysToDelete.length} entries)`)
}

/**
 * Limpia todo el cache de forms
 */
export function clearFormCache(): void {
  formCache.clear()
  console.log(`[Form Loader] 🧹 Cleared entire cache`)
}

/**
 * Precarga un form en background (opcional)
 * Útil para mejorar performance cuando sabés qué forms se van a usar
 */
export async function preloadForm(
  formName: string,
  options: LoadOptions = {}
): Promise<void> {
  try {
    await loadDynamicFormCached(formName, options)
    console.log(`[Form Loader] ✅ Preloaded ${formName}`)
  } catch (error: any) {
    console.warn(`[Form Loader] ⚠️  Failed to preload ${formName}:`, error.message)
  }
}
