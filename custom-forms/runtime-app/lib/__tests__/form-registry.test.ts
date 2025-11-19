import {
  formRegistry,
  initializeFormRegistry,
  findFormsByProcess,
  findFormsByAuthor,
  FormMetadata,
} from '../form-registry'

// Mock fetch globally
global.fetch = jest.fn()

describe('FormRegistry', () => {
  const mockForm: FormMetadata = {
    formName: 'test-form',
    processName: 'TestProcess',
    description: 'A test form',
    author: 'Test Author',
    status: 'active',
    currentVersion: '1.0.0',
    updatedAt: '2024-01-01T00:00:00Z',
    sizeBytes: 1024,
  }

  const mockForm2: FormMetadata = {
    formName: 'another-form',
    processName: 'AnotherProcess',
    description: 'Another test form',
    author: 'Another Author',
    status: 'inactive',
    currentVersion: '2.0.0',
    updatedAt: '2024-01-02T00:00:00Z',
  }

  beforeEach(() => {
    // Clear the registry before each test
    formRegistry.clear()
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Basic Operations', () => {
    it('should start with an empty registry', () => {
      const forms = formRegistry.getAllForms()
      expect(forms).toHaveLength(0)
    })

    it('should register a form', () => {
      formRegistry.setForm('test-form', mockForm)
      const form = formRegistry.getForm('test-form')
      expect(form).toEqual(mockForm)
    })

    it('should get all forms', () => {
      formRegistry.setForm('test-form', mockForm)
      formRegistry.setForm('another-form', mockForm2)

      const forms = formRegistry.getAllForms()
      expect(forms).toHaveLength(2)
      expect(forms).toContainEqual(mockForm)
      expect(forms).toContainEqual(mockForm2)
    })

    it('should get only active forms', () => {
      formRegistry.setForm('test-form', mockForm)
      formRegistry.setForm('another-form', mockForm2)

      const activeForms = formRegistry.getActiveForms()
      expect(activeForms).toHaveLength(1)
      expect(activeForms[0]).toEqual(mockForm)
    })

    it('should remove a form', () => {
      formRegistry.setForm('test-form', mockForm)
      expect(formRegistry.getForm('test-form')).toBeDefined()

      formRegistry.removeForm('test-form')
      expect(formRegistry.getForm('test-form')).toBeUndefined()
    })

    it('should clear all forms', () => {
      formRegistry.setForm('test-form', mockForm)
      formRegistry.setForm('another-form', mockForm2)
      expect(formRegistry.getAllForms()).toHaveLength(2)

      formRegistry.clear()
      expect(formRegistry.getAllForms()).toHaveLength(0)
    })

    it('should return undefined for non-existent form', () => {
      const form = formRegistry.getForm('non-existent')
      expect(form).toBeUndefined()
    })
  })

  describe('Cache Management', () => {
    it('should mark cache as expired initially', () => {
      expect(formRegistry.isCacheExpired()).toBe(true)
    })

    it('should mark cache as fresh after markFetched', () => {
      formRegistry.markFetched()
      expect(formRegistry.isCacheExpired()).toBe(false)
    })

    it('should mark cache as expired after TTL', () => {
      // Create a registry with 1ms TTL for testing
      const testRegistry = new (formRegistry.constructor as any)(1)
      testRegistry.markFetched()

      expect(testRegistry.isCacheExpired()).toBe(false)

      // Wait for cache to expire
      return new Promise(resolve => {
        setTimeout(() => {
          expect(testRegistry.isCacheExpired()).toBe(true)
          resolve(true)
        }, 10)
      })
    })

    it('should reset lastFetch when clearing', () => {
      formRegistry.markFetched()
      expect(formRegistry.isCacheExpired()).toBe(false)

      formRegistry.clear()
      expect(formRegistry.isCacheExpired()).toBe(true)
    })
  })

  describe('Stats', () => {
    it('should return correct stats for empty registry', () => {
      const stats = formRegistry.getStats()
      expect(stats.total).toBe(0)
      expect(stats.active).toBe(0)
      expect(stats.inactive).toBe(0)
      expect(stats.deprecated).toBe(0)
      expect(stats.cacheExpired).toBe(true)
    })

    it('should return correct stats with forms', () => {
      const deprecatedForm: FormMetadata = {
        ...mockForm,
        formName: 'deprecated-form',
        status: 'deprecated',
      }

      formRegistry.setForm('test-form', mockForm)
      formRegistry.setForm('another-form', mockForm2)
      formRegistry.setForm('deprecated-form', deprecatedForm)
      formRegistry.markFetched()

      const stats = formRegistry.getStats()
      expect(stats.total).toBe(3)
      expect(stats.active).toBe(1)
      expect(stats.inactive).toBe(1)
      expect(stats.deprecated).toBe(1)
      expect(stats.cacheExpired).toBe(false)
    })
  })

  describe('loadFromConfig', () => {
    it('should load forms from static config', () => {
      const forms = [mockForm, mockForm2]
      formRegistry.loadFromConfig(forms)

      expect(formRegistry.getAllForms()).toHaveLength(2)
      expect(formRegistry.getForm('test-form')).toEqual(mockForm)
      expect(formRegistry.getForm('another-form')).toEqual(mockForm2)
    })

    it('should clear previous forms when loading from config', () => {
      formRegistry.setForm('old-form', mockForm)
      expect(formRegistry.getAllForms()).toHaveLength(1)

      formRegistry.loadFromConfig([mockForm2])
      expect(formRegistry.getAllForms()).toHaveLength(1)
      expect(formRegistry.getForm('old-form')).toBeUndefined()
      expect(formRegistry.getForm('another-form')).toEqual(mockForm2)
    })

    it('should mark cache as fetched after loading from config', () => {
      formRegistry.loadFromConfig([mockForm])
      expect(formRegistry.isCacheExpired()).toBe(false)
    })
  })

  describe('loadFromAPI', () => {
    it('should load forms from API successfully', async () => {
      const mockResponse = [mockForm, mockForm2]
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await formRegistry.loadFromAPI('http://api.test/forms')

      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.test/forms',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      )
      expect(formRegistry.getAllForms()).toHaveLength(2)
      expect(formRegistry.isCacheExpired()).toBe(false)
    })

    it('should clear previous forms when loading from API', async () => {
      formRegistry.setForm('old-form', mockForm)

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockForm2],
      })

      await formRegistry.loadFromAPI('http://api.test/forms')

      expect(formRegistry.getAllForms()).toHaveLength(1)
      expect(formRegistry.getForm('old-form')).toBeUndefined()
    })

    it('should throw error on API failure', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      await expect(
        formRegistry.loadFromAPI('http://api.test/forms')
      ).rejects.toThrow('API returned 500: Internal Server Error')
    })

    it('should throw error on network failure', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      await expect(
        formRegistry.loadFromAPI('http://api.test/forms')
      ).rejects.toThrow('Network error')
    })
  })

  describe('initializeFormRegistry', () => {
    it('should initialize from API when apiUrl is provided', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockForm],
      })

      await initializeFormRegistry({
        apiUrl: 'http://api.test/forms',
      })

      expect(global.fetch).toHaveBeenCalled()
      expect(formRegistry.getAllForms()).toHaveLength(1)
    })

    it('should initialize from static config when no apiUrl', async () => {
      await initializeFormRegistry({
        staticForms: [mockForm, mockForm2],
      })

      expect(global.fetch).not.toHaveBeenCalled()
      expect(formRegistry.getAllForms()).toHaveLength(2)
    })

    it('should prioritize API over static config', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockForm],
      })

      await initializeFormRegistry({
        apiUrl: 'http://api.test/forms',
        staticForms: [mockForm2],
      })

      expect(global.fetch).toHaveBeenCalled()
      expect(formRegistry.getAllForms()).toHaveLength(1)
      expect(formRegistry.getForm('test-form')).toBeDefined()
      expect(formRegistry.getForm('another-form')).toBeUndefined()
    })

    it('should skip fetch if cache is valid', async () => {
      formRegistry.loadFromConfig([mockForm])

      await initializeFormRegistry({
        apiUrl: 'http://api.test/forms',
      })

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should force fetch when skipCache is true', async () => {
      formRegistry.loadFromConfig([mockForm])

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [mockForm2],
      })

      await initializeFormRegistry({
        apiUrl: 'http://api.test/forms',
        skipCache: true,
      })

      expect(global.fetch).toHaveBeenCalled()
      expect(formRegistry.getForm('another-form')).toBeDefined()
    })

    it('should throw error when API fails (no fallback)', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('API error')
      )

      await expect(
        initializeFormRegistry({
          apiUrl: 'http://api.test/forms',
          staticForms: [mockForm], // Static forms should NOT be used as fallback
        })
      ).rejects.toThrow('Form Registry initialization failed: API error')
    })

    it('should warn when no apiUrl or staticForms provided', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      await initializeFormRegistry({})

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No API URL or static forms provided')
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Search Functions', () => {
    beforeEach(() => {
      formRegistry.setForm('test-form', mockForm)
      formRegistry.setForm('another-form', mockForm2)
    })

    it('should find forms by process name', () => {
      const results = findFormsByProcess('TestProcess')
      expect(results).toHaveLength(1)
      expect(results[0].formName).toBe('test-form')
    })

    it('should find forms by partial process name (case insensitive)', () => {
      const results = findFormsByProcess('test')
      expect(results).toHaveLength(1)
      expect(results[0].formName).toBe('test-form')
    })

    it('should return empty array when no process matches', () => {
      const results = findFormsByProcess('NonExistent')
      expect(results).toHaveLength(0)
    })

    it('should find forms by author', () => {
      const results = findFormsByAuthor('Test Author')
      expect(results).toHaveLength(1)
      expect(results[0].formName).toBe('test-form')
    })

    it('should find forms by partial author name (case insensitive)', () => {
      const results = findFormsByAuthor('another')
      expect(results).toHaveLength(1)
      expect(results[0].formName).toBe('another-form')
    })

    it('should return empty array when no author matches', () => {
      const results = findFormsByAuthor('Unknown Author')
      expect(results).toHaveLength(0)
    })
  })
})
