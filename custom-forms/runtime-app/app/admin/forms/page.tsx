'use client'

import { useEffect, useState } from 'react'
import { Search, FileText, Calendar, Database, Trash2, Eye, Download, Loader2, AlertCircle, Filter, RefreshCw, History, X, Check, AlertTriangle, CheckCircle } from 'lucide-react'
import { useAppTranslation } from '@/lib/useAppTranslation'
import { withBasePath } from '@/lib/navigation'
import { apiFetch, getApiUrl } from '@/lib/api-client'

// Confirmation Dialog Component
interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'warning' | 'danger' | 'info'
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'warning'
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const colors = {
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      buttonColor: 'bg-orange-600 hover:bg-orange-700'
    },
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    },
    info: {
      icon: AlertCircle,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    }
  }

  const config = colors[type]
  const Icon = config.icon

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 ${config.buttonColor} text-white rounded-lg font-medium transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Alert Dialog Component
interface AlertDialogProps {
  isOpen: boolean
  title: string
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

function AlertDialog({ isOpen, title, message, type = 'info', onClose }: AlertDialogProps) {
  const { t } = useAppTranslation()

  if (!isOpen) return null

  const colors = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    },
    info: {
      icon: AlertCircle,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    }
  }

  const config = colors[type]
  const Icon = config.icon

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className={`w-full px-4 py-2 ${config.buttonColor} text-white rounded-lg font-medium transition-colors`}
          >
            {t('versions.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}

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

interface FormVersion {
  version: string
  publishedAt: string
  sizeBytes: number
  isCurrent: boolean
  releaseNotes?: string
  packageVersion?: string
  commitHash?: string
  buildDate?: string
  commitUrl?: string
  repositoryUrl?: string
}

export default function FormsManagementPage() {
  const { t } = useAppTranslation()
  const [forms, setForms] = useState<CustomForm[]>([])
  const [filteredForms, setFilteredForms] = useState<CustomForm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date')

  // Version modal state
  const [showVersionsModal, setShowVersionsModal] = useState(false)
  const [selectedForm, setSelectedForm] = useState<CustomForm | null>(null)
  const [versions, setVersions] = useState<FormVersion[]>([])
  const [loadingVersions, setLoadingVersions] = useState(false)
  const [settingVersion, setSettingVersion] = useState<string | null>(null)

  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type?: 'warning' | 'danger' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  })

  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

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

      // Use Next.js API route (proxies to FastAPI backend)
      // Add timestamp to prevent caching
      const response = await apiFetch(`/api/custom-forms?t=${Date.now()}`)

      if (!response.ok) {
        throw new Error('Error al cargar los formularios')
      }

      const data = await response.json()

      // Convertir formato de API a formato esperado por el frontend
      const formsWithKb = data.map((f: any) => ({
        name: f.formName,
        displayName: f.formName, // Use formName as title
        processName: f.processName,
        version: f.currentVersion,
        description: f.description, // Use description as subtitle
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
    // Use Next.js API route (proxies to FastAPI backend) with download=true
    const url = getApiUrl(`/api/custom-forms/${formName}/code?version=${version}&download=true`)

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = `${formName}-${version}.js`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDeleteForm = async (form: CustomForm) => {
    // First, try to get the number of versions to show in confirmation
    try {
      let versionCount = 0
      let hasVersions = false

      // Try to get versions, but don't fail if they don't exist (orphaned form case)
      try {
        const response = await apiFetch(`/api/custom-forms/${form.name}/versions`)
        if (response.ok) {
          const versionsData: FormVersion[] = await response.json()
          versionCount = versionsData.length
          hasVersions = true
        } else if (response.status === 404) {
          // Form exists but has no versions (orphaned record)
          console.warn(`Form '${form.name}' has no versions - likely an orphaned record`)
          versionCount = 0
          hasVersions = false
        } else {
          // Other error - throw to outer catch
          throw new Error('Failed to get form versions')
        }
      } catch (versionError) {
        // Network error or other issue - let user decide if they want to proceed
        console.error('Error fetching versions:', versionError)
        versionCount = 0
        hasVersions = false
      }

      // Show confirmation dialog
      const versionMessage = hasVersions
        ? `Se eliminarán ${versionCount} versión(es).`
        : versionCount === 0
          ? 'Este formulario no tiene versiones asociadas (registro huérfano).'
          : 'No se pudo verificar el número de versiones.';

      setConfirmDialog({
        isOpen: true,
        title: 'Eliminar Formulario',
        message: `¿Estás seguro de eliminar el formulario "${form.displayName}"? ${versionMessage} Esta acción no se puede deshacer.`,
        type: 'danger',
        onConfirm: async () => {
          try {
            const deleteResponse = await apiFetch(`/api/custom-forms/${form.name}/delete`, {
              method: 'DELETE'
            })

            if (!deleteResponse.ok) {
              throw new Error('Failed to delete form')
            }

            const result = await deleteResponse.json()

            // Show success message
            setAlertDialog({
              isOpen: true,
              title: 'Formulario Eliminado',
              message: `Se eliminó el formulario "${form.displayName}" y ${result.versions_deleted} versión(es) exitosamente.`,
              type: 'success'
            })

            // Reload forms list
            loadForms()
          } catch (err: any) {
            setAlertDialog({
              isOpen: true,
              title: 'Error al Eliminar',
              message: err.message || 'Ocurrió un error al eliminar el formulario',
              type: 'error'
            })
          } finally {
            setConfirmDialog({ ...confirmDialog, isOpen: false })
          }
        }
      })
    } catch (err: any) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: err.message || 'Ocurrió un error inesperado',
        type: 'error'
      })
    }
  }

  const handleViewForm = (formName: string, version?: string) => {
    const versionParam = version ? `?version=${version}` : ''
    const url = withBasePath(`/form/${formName}${versionParam}`)
    window.open(url, '_blank')
  }

  const handleShowVersions = async (form: CustomForm) => {
    setSelectedForm(form)
    setShowVersionsModal(true)
    setLoadingVersions(true)

    try {
      // Use Next.js API route (proxies to FastAPI backend)
      const response = await apiFetch(`/api/custom-forms/${form.name}/versions`)

      if (!response.ok) {
        throw new Error('Error al cargar versiones')
      }

      const data = await response.json()
      setVersions(data)
    } catch (err: any) {
      console.error('Error loading versions:', err)
      setAlertDialog({
        isOpen: true,
        title: t('versions.errorLoadingTitle'),
        message: err.message || t('versions.errorLoadingMessage'),
        type: 'error'
      })
    } finally {
      setLoadingVersions(false)
    }
  }

  const handleSetVersion = async (version: string) => {
    if (!selectedForm) return

    setConfirmDialog({
      isOpen: true,
      title: t('versions.confirmTitle'),
      message: t('versions.confirmMessage')
        .replace('{version}', version)
        .replace('{formName}', selectedForm.displayName),
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false })
        setSettingVersion(version)

        try {
          // Use Next.js API route (proxies to FastAPI backend)
          const response = await apiFetch(
            `/api/custom-forms/${selectedForm.name}/set-version?version=${version}`,
            { method: 'POST' }
          )

          if (!response.ok) {
            throw new Error(t('versions.errorActivatingMessage'))
          }

          setAlertDialog({
            isOpen: true,
            title: t('versions.activatedTitle'),
            message: t('versions.activatedMessage').replace('{version}', version),
            type: 'success'
          })

          // Reload versions and forms
          await handleShowVersions(selectedForm)
          await loadForms()
        } catch (err: any) {
          console.error('Error setting version:', err)
          setAlertDialog({
            isOpen: true,
            title: t('versions.errorActivatingTitle'),
            message: err.message || t('versions.errorActivatingMessage'),
            type: 'error'
          })
        } finally {
          setSettingVersion(null)
        }
      }
    })
  }

  const handleDeleteVersion = async (version: string) => {
    if (!selectedForm) return

    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Versión',
      message: `¿Estás seguro de eliminar la versión v${version} del formulario "${selectedForm.displayName}"? Esta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false })

        try {
          const response = await apiFetch(
            `/api/custom-forms/${selectedForm.name}/versions/${version}/delete`,
            { method: 'DELETE' }
          )

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.error || result.detail || 'Error al eliminar la versión')
          }

          setAlertDialog({
            isOpen: true,
            title: 'Versión Eliminada',
            message: `Se eliminó la versión v${version} exitosamente.`,
            type: 'success'
          })

          // Reload versions
          await handleShowVersions(selectedForm)
        } catch (err: any) {
          console.error('Error deleting version:', err)
          setAlertDialog({
            isOpen: true,
            title: 'Error al Eliminar',
            message: err.message || 'Ocurrió un error al eliminar la versión',
            type: 'error'
          })
        }
      }
    })
  }

  const closeVersionsModal = () => {
    setShowVersionsModal(false)
    setSelectedForm(null)
    setVersions([])
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
              {t('forms.errorTitle')}
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={loadForms}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
            >
              {t('forms.retry')}
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
            {t('forms.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {filteredForms.length === 1
              ? t('forms.formsFound').replace('{count}', filteredForms.length.toString())
              : t('forms.formsFoundPlural').replace('{count}', filteredForms.length.toString())
            }
          </p>
        </div>
        <button
          onClick={loadForms}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {t('forms.reload')}
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
              placeholder={t('forms.searchPlaceholder')}
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
              <option value="date">{t('forms.sortByDate')}</option>
              <option value="name">{t('forms.sortByName')}</option>
              <option value="size">{t('forms.sortBySize')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Forms List */}
      {filteredForms.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {t('forms.noFormsTitle')}
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {searchQuery
              ? t('forms.noFormsMessage')
              : t('forms.noFormsMessageEmpty')}
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
                        <span className="font-medium">{t('forms.process')}</span> {form.processName}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{t('forms.published')}</span> {formatDate(form.publishedAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Metadata */}
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-600 dark:text-slate-400">{t('forms.version')}</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{form.version}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 dark:text-slate-400">{t('forms.size')}</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatSize(form.sizeKb)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShowVersions(form)}
                      className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      title={t('forms.versionsButton')}
                    >
                      <History className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleViewForm(form.name)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      title={t('forms.viewButton')}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDownload(form.name, form.version)}
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      title={t('forms.downloadButton')}
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteForm(form)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      title="Eliminar formulario"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Versions Modal */}
      {showVersionsModal && selectedForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {t('versions.title')}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {selectedForm.displayName}
                </p>
              </div>
              <button
                onClick={closeVersionsModal}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingVersions ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">
                    {t('versions.noVersionsMessage')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {versions.map((version, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-lg p-4 ${
                        version.isCurrent
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                              v{version.version}
                            </h3>
                            {version.isCurrent && (
                              <span className="px-2 py-1 bg-primary text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                {t('versions.current')}
                              </span>
                            )}
                          </div>

                          {/* Release Notes */}
                          {version.releaseNotes && version.releaseNotes.trim() !== "" && (
                            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                {t('versions.changesTitle')}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                {version.releaseNotes}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-slate-600 dark:text-slate-400">
                              <strong>{t('versions.published')}</strong> {formatDate(version.publishedAt)}
                            </div>
                            <div className="text-slate-600 dark:text-slate-400">
                              <strong>{t('versions.size')}</strong> {formatSize(version.sizeBytes / 1024)}
                            </div>
                            {version.packageVersion && (
                              <div className="text-slate-600 dark:text-slate-400">
                                <strong>{t('versions.sdk')}</strong> v{version.packageVersion}
                              </div>
                            )}
                            {version.commitHash && (
                              <div className="text-slate-600 dark:text-slate-400">
                                <strong>{t('versions.commit')}</strong>{' '}
                                {version.commitUrl ? (
                                  <a
                                    href={version.commitUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded hover:bg-primary hover:text-white transition-colors font-mono"
                                    title={`View commit ${version.commitHash}`}
                                  >
                                    {version.commitHash.substring(0, 7)}
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                ) : (
                                  <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-mono">
                                    {version.commitHash.substring(0, 7)}
                                  </code>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleViewForm(selectedForm.name, version.version)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            title={t('versions.view')}
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDownload(selectedForm.name, version.version)}
                            className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                            title={t('versions.download')}
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          {!version.isCurrent && (
                            <button
                              onClick={() => handleSetVersion(version.version)}
                              disabled={settingVersion !== null}
                              className="p-2 bg-primary hover:bg-primary/90 disabled:bg-slate-400 text-white rounded-lg transition-colors disabled:cursor-wait"
                              title={t('versions.activate')}
                            >
                              {settingVersion === version.version ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Check className="w-5 h-5" />
                              )}
                            </button>
                          )}
                          {!version.isCurrent && (
                            <button
                              onClick={() => handleDeleteVersion(version.version)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                              title="Eliminar versión"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={t('versions.confirmButton')}
        cancelText={t('versions.cancelButton')}
        type={confirmDialog.type || 'warning'}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
      />
    </div>
  )
}
