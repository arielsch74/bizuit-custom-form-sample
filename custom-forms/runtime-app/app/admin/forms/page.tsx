'use client'

import { useEffect, useState } from 'react'
import { Search, FileText, Calendar, Database, Trash2, Eye, Download, Loader2, AlertCircle, Filter, RefreshCw } from 'lucide-react'

interface CustomForm {
  name: string
  displayName: string
  processName: string
  version: string
  description: string
  author: string
  sizeKb: number
  publishedAt: string
  createdAt: string
}

export default function FormsManagementPage() {
  const [forms, setForms] = useState<CustomForm[]>([])
  const [filteredForms, setFilteredForms] = useState<CustomForm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date')

  useEffect(() => {
    loadForms()
  }, [])

  useEffect(() => {
    // Filtrar y ordenar forms
    let filtered = forms.filter((form) =>
      (form.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (form.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (form.processName || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Ordenar
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.displayName.localeCompare(b.displayName)
      } else if (sortBy === 'date') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      } else { // size
        return b.sizeKb - a.sizeKb
      }
    })

    setFilteredForms(filtered)
  }, [forms, searchQuery, sortBy])

  const loadForms = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/custom-forms`)

      if (!response.ok) {
        throw new Error('Error al cargar los formularios')
      }

      const data = await response.json()

      // Convertir formato de API a formato esperado por el frontend
      const formsWithKb = data.map((f: any) => ({
        name: f.formName,
        displayName: f.description?.split(' para ')[0] || f.formName,
        processName: f.processName,
        version: f.currentVersion,
        description: f.description,
        author: f.author,
        sizeKb: (f.sizeBytes || 0) / 1024,
        publishedAt: f.publishedAt,
        createdAt: f.updatedAt
      }))

      setForms(formsWithKb)
    } catch (err: any) {
      console.error('Error loading forms:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatSize = (kb: number) => {
    if (kb < 1024) return `${kb.toFixed(0)} KB`
    return `${(kb / 1024).toFixed(2)} MB`
  }

  const handleDownload = (formName: string, version: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const url = `${apiUrl}/api/custom-forms/${formName}/code?version=${version}`
    window.open(url, '_blank')
  }

  const handleViewForm = (formName: string) => {
    window.open(`/form/${formName}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
              Error al cargar formularios
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={loadForms}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Gestión de Formularios
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {filteredForms.length} formulario{filteredForms.length !== 1 ? 's' : ''} encontrado{filteredForms.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={loadForms}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Recargar
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o proceso..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white appearance-none cursor-pointer"
            >
              <option value="date">Ordenar por fecha</option>
              <option value="name">Ordenar por nombre</option>
              <option value="size">Ordenar por tamaño</option>
            </select>
          </div>
        </div>
      </div>

      {/* Forms List */}
      {filteredForms.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No se encontraron formularios
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {searchQuery
              ? 'Intenta con otros términos de búsqueda'
              : 'Sube tu primer formulario usando el panel de Upload'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredForms.map((form, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Form Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate">
                      {form.displayName}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {form.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Database className="w-4 h-4" />
                        <span className="font-medium">Proceso:</span> {form.processName}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Publicado:</span> {formatDate(form.publishedAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Metadata */}
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Versión</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{form.version}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Tamaño</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatSize(form.sizeKb)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewForm(form.name)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      title="Ver formulario"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleDownload(form.name, form.version)}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      title="Descargar código"
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
