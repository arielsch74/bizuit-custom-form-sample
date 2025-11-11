/**
 * Form Registry
 *
 * Mantiene un registro de todos los forms disponibles con su metadata.
 * La metadata se obtiene del backend API (Custom Forms API cuando esté implementado)
 * o desde un archivo de configuración estático.
 */

export interface FormMetadata {
  /** ID único en BD */
  id: number

  /** Nombre único del form (kebab-case) */
  formName: string

  /** Versión actual del form */
  currentVersion: string

  /** Nombre del proceso BPM asociado */
  processName: string

  /** Descripción del form */
  description: string

  /** Autor del form */
  author: string

  /** Estado del form (active, inactive, deprecated) */
  status: 'active' | 'inactive' | 'deprecated'

  /** Tamaño del código compilado en bytes */
  sizeBytes: number

  /** Fecha de publicación */
  publishedAt: string

  /** Fecha de última actualización */
  updatedAt: string

  /** Metadata adicional (opcional) */
  metadata?: Record<string, any>
}

/**
 * Registry en memoria de forms
 */
class FormRegistry {
  private registry: Map<string, FormMetadata>
  private lastFetch: number
  private cacheTTL: number // Time to live en millisegundos

  constructor(cacheTTL: number = 5 * 60 * 1000) {
    this.registry = new Map()
    this.lastFetch = 0
    this.cacheTTL = cacheTTL // Default: 5 minutos
  }

  /**
   * Obtiene metadata de un form específico
   */
  getForm(formName: string): FormMetadata | undefined {
    return this.registry.get(formName)
  }

  /**
   * Obtiene todos los forms registrados
   */
  getAllForms(): FormMetadata[] {
    return Array.from(this.registry.values())
  }

  /**
   * Obtiene solo forms activos
   */
  getActiveForms(): FormMetadata[] {
    return this.getAllForms().filter(form => form.status === 'active')
  }

  /**
   * Registra un nuevo form o actualiza uno existente
   */
  setForm(formName: string, metadata: FormMetadata): void {
    this.registry.set(formName, metadata)
    console.log(`[Form Registry] Registered: ${formName}@${metadata.currentVersion}`)
  }

  /**
   * Elimina un form del registry
   */
  removeForm(formName: string): void {
    this.registry.delete(formName)
    console.log(`[Form Registry] Removed: ${formName}`)
  }

  /**
   * Limpia todo el registry
   */
  clear(): void {
    this.registry.clear()
    this.lastFetch = 0
    console.log(`[Form Registry] Cleared all forms`)
  }

  /**
   * Verifica si el cache está expirado
   */
  isCacheExpired(): boolean {
    return Date.now() - this.lastFetch > this.cacheTTL
  }

  /**
   * Marca el cache como recién actualizado
   */
  markFetched(): void {
    this.lastFetch = Date.now()
  }

  /**
   * Carga forms desde el backend API (o mock API para testing)
   */
  async loadFromAPI(apiUrl: string): Promise<void> {
    try {
      console.log(`[Form Registry] Fetching forms from API: ${apiUrl}`)

      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      const forms: FormMetadata[] = await response.json()

      // Limpiar registry anterior
      this.registry.clear()

      // Cargar nuevos forms
      forms.forEach(form => {
        this.setForm(form.formName, form)
      })

      this.markFetched()

      console.log(`[Form Registry] ✅ Loaded ${forms.length} forms from API`)

    } catch (error: any) {
      console.error(`[Form Registry] ❌ Failed to load from API:`, error)
      throw error
    }
  }

  /**
   * Carga forms desde un archivo de configuración estático
   * Útil para desarrollo o como fallback
   */
  loadFromConfig(forms: FormMetadata[]): void {
    console.log(`[Form Registry] Loading ${forms.length} forms from config`)

    this.registry.clear()

    forms.forEach(form => {
      this.setForm(form.formName, form)
    })

    this.markFetched()

    console.log(`[Form Registry] ✅ Loaded ${forms.length} forms from config`)
  }

  /**
   * Obtiene stats del registry
   */
  getStats() {
    const all = this.getAllForms()
    return {
      total: all.length,
      active: all.filter(f => f.status === 'active').length,
      inactive: all.filter(f => f.status === 'inactive').length,
      deprecated: all.filter(f => f.status === 'deprecated').length,
      lastFetch: new Date(this.lastFetch).toISOString(),
      cacheExpired: this.isCacheExpired(),
    }
  }
}

/**
 * Instancia singleton del registry
 */
export const formRegistry = new FormRegistry()

/**
 * Hook para inicializar el registry con forms
 * Se puede usar desde diferentes fuentes
 */
export async function initializeFormRegistry(config: {
  apiUrl?: string
  staticForms?: FormMetadata[]
  skipCache?: boolean
}): Promise<void> {
  const { apiUrl, staticForms, skipCache = false } = config

  // Si el cache no está expirado y no se fuerza skip, no hacer nada
  if (!skipCache && !formRegistry.isCacheExpired()) {
    console.log(`[Form Registry] Cache still valid, skipping fetch`)
    return
  }

  try {
    // Prioridad 1: Cargar desde API si está disponible
    if (apiUrl) {
      await formRegistry.loadFromAPI(apiUrl)
      return
    }

    // Prioridad 2: Cargar desde configuración estática
    if (staticForms && staticForms.length > 0) {
      formRegistry.loadFromConfig(staticForms)
      return
    }

    console.warn(`[Form Registry] No API URL or static forms provided`)

  } catch (error: any) {
    console.error(`[Form Registry] Failed to initialize:`, error)

    // Fallback a static forms si API falla
    if (staticForms && staticForms.length > 0) {
      console.log(`[Form Registry] Falling back to static forms`)
      formRegistry.loadFromConfig(staticForms)
    }
  }
}

/**
 * Búsqueda de forms por nombre de proceso
 */
export function findFormsByProcess(processName: string): FormMetadata[] {
  return formRegistry
    .getAllForms()
    .filter(form =>
      form.processName.toLowerCase().includes(processName.toLowerCase())
    )
}

/**
 * Búsqueda de forms por autor
 */
export function findFormsByAuthor(author: string): FormMetadata[] {
  return formRegistry
    .getAllForms()
    .filter(form =>
      form.author.toLowerCase().includes(author.toLowerCase())
    )
}
