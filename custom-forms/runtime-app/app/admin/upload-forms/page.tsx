'use client'

import { useState } from 'react'
import { Upload, CheckCircle, XCircle, AlertCircle, FileArchive, Loader2 } from 'lucide-react'
import { useAppTranslation } from '@/lib/useAppTranslation'
import { apiFetch } from '@/lib/api-client'

interface UploadResult {
  success: boolean
  message: string
  formsProcessed: number
  formsInserted: number
  formsUpdated: number
  errors: string[]
  results: Array<{
    formName: string
    success: boolean
    action: string
    error?: string
  }>
}

export default function UploadFormsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const { t } = useAppTranslation()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validar que sea .zip
      if (!selectedFile.name.endsWith('.zip')) {
        alert(t('upload.alertOnlyZip'))
        return
      }

      // Validar tamaño (max 50 MB)
      const maxSize = 50 * 1024 * 1024 // 50 MB
      if (selectedFile.size > maxSize) {
        alert(t('upload.alertMaxSize'))
        return
      }

      setFile(selectedFile)
      setResult(null) // Limpiar resultado anterior
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert(t('upload.alertSelectFile'))
      return
    }

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('[Upload] Uploading deployment package:', file.name)

      // Use apiFetch to ensure basePath is added (Next.js doesn't add it for client fetch)
      const response = await apiFetch('/api/deployment/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Important: include HttpOnly cookies
      })

      const data = await response.json()

      console.log('[Upload] Response:', data)

      setResult(data)

      if (data.success) {
        // Opcional: Limpiar file después de éxito
        setTimeout(() => {
          setFile(null)
        }, 5000)
      }
    } catch (error: any) {
      console.error('[Upload] Error:', error)
      setResult({
        success: false,
        message: `Error de red: ${error.message}`,
        formsProcessed: 0,
        formsInserted: 0,
        formsUpdated: 0,
        errors: [error.message],
        results: [],
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith('.zip')) {
      setFile(droppedFile)
      setResult(null)
    } else {
      alert(t('upload.alertOnlyZip'))
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-card-foreground mb-2">
          {t('upload.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('upload.subtitle')}
        </p>
      </div>

        {/* Upload Area */}
        <div className="bg-card rounded-xl shadow-lg p-8 mb-6">
          <div
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-12 text-center transition-colors hover:border-blue-500 dark:hover:border-blue-400"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {file ? (
              <div className="space-y-4">
                <FileArchive className="w-16 h-16 mx-auto text-blue-500" />
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {file.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  {t('upload.removeFile')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-16 h-16 mx-auto text-slate-400" />
                <div>
                  <p className="text-lg font-semibold text-card-foreground mb-2">
                    {t('upload.dragDrop')}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('upload.orClick')}
                  </p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".zip"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <span className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg cursor-pointer transition-colors">
                      {t('upload.selectFile')}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('upload.maxSize')}
                </p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          {file && (
            <div className="mt-6">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('upload.processing')}
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    {t('upload.uploadButton')}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div
            className={`rounded-xl shadow-lg p-8 ${
              result.success
                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'
            }`}
          >
            <div className="flex items-start gap-4 mb-6">
              {result.success ? (
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h2
                  className={`text-2xl font-bold mb-2 ${
                    result.success
                      ? 'text-green-900 dark:text-green-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}
                >
                  {result.success ? t('upload.successTitle') : t('upload.errorTitle')}
                </h2>
                <p
                  className={`${
                    result.success
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}
                >
                  {result.message}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-card rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {result.formsProcessed}
                </p>
                <p className="text-sm text-muted-foreground">{t('upload.processed')}</p>
              </div>
              <div className="bg-card rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {result.formsInserted}
                </p>
                <p className="text-sm text-muted-foreground">{t('upload.inserted')}</p>
              </div>
              <div className="bg-card rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-primary">
                  {result.formsUpdated}
                </p>
                <p className="text-sm text-muted-foreground">{t('upload.updated')}</p>
              </div>
            </div>

            {/* Forms Results */}
            {result.results && result.results.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-card-foreground mb-3">
                  {t('upload.detailTitle')}
                </h3>
                {result.results.map((formResult, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-800 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {formResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {formResult.formName}
                        </p>
                        {formResult.error && (
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {formResult.error}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        formResult.action === 'inserted'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : formResult.action === 'updated'
                          ? 'bg-primary/10 text-primary dark:bg-primary/20'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                    >
                      {formResult.action === 'inserted'
                        ? t('upload.new')
                        : formResult.action === 'updated'
                        ? t('upload.updatedLabel')
                        : t('upload.error')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Errors */}
            {result.errors && result.errors.length > 0 && (
              <div className="mt-6 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                      {t('upload.errorsTitle')}
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-800 dark:text-red-200">
                      {result.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
          <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {t('upload.instructionsTitle')}
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-orange-800 dark:text-orange-200">
            <li>{t('upload.instruction1')}</li>
            <li>{t('upload.instruction2')}</li>
            <li>{t('upload.instruction3')}</li>
            <li>{t('upload.instruction4')}</li>
            <li>{t('upload.instruction5')}</li>
          </ol>
        </div>
    </div>
  )
}
