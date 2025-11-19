'use client'

import { useState, useEffect } from 'react'
import { Settings, Check, X, AlertCircle } from 'lucide-react'

interface ApiConfigDialogProps {
  className?: string
}

export function ApiConfigDialog({ className = '' }: ApiConfigDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [formsApiUrl, setFormsApiUrl] = useState('')
  const [dashboardApiUrl, setDashboardApiUrl] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load from localStorage
    const savedFormsApiUrl = localStorage.getItem('bizuit_forms_api_url') || ''
    const savedDashboardApiUrl = localStorage.getItem('bizuit_dashboard_api_url') || ''
    setFormsApiUrl(savedFormsApiUrl)
    setDashboardApiUrl(savedDashboardApiUrl)

    // Show warning if no config is set
    if (!savedFormsApiUrl || !savedDashboardApiUrl) {
      setShowWarning(true)
    }
  }, [])

  const handleSave = () => {
    if (!formsApiUrl || !dashboardApiUrl) {
      alert('Por favor completa ambas URLs')
      return
    }

    localStorage.setItem('bizuit_forms_api_url', formsApiUrl)
    localStorage.setItem('bizuit_dashboard_api_url', dashboardApiUrl)
    setIsSaved(true)
    setShowWarning(false)

    setTimeout(() => {
      setIsSaved(false)
      setIsOpen(false)
      // Reload page to apply new config
      window.location.reload()
    }, 1500)
  }

  const handleReset = () => {
    const defaultUrl = 'https://test.bizuit.com/arielschbizuitdashboardapi/api'
    setFormsApiUrl(defaultUrl)
    setDashboardApiUrl(defaultUrl)
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground ${className}`}
        title="Configurar API de Bizuit"
      >
        <Settings className="h-5 w-5" />
        {showWarning && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>

      {/* Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg mx-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración de API
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Warning Banner */}
            {showWarning && (
              <div className="mb-4 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-semibold mb-1">⚠️ No hay configuración de API</p>
                    <p>Por favor configura las URLs de la API de Bizuit para que la aplicación funcione correctamente.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  URL del Forms API
                </label>
                <input
                  type="url"
                  value={formsApiUrl}
                  onChange={(e) => setFormsApiUrl(e.target.value)}
                  placeholder="https://test.bizuit.com/arielschbizuitdashboardapi/api"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  URL del Dashboard API
                </label>
                <input
                  type="url"
                  value={dashboardApiUrl}
                  onChange={(e) => setDashboardApiUrl(e.target.value)}
                  placeholder="https://test.bizuit.com/arielschbizuitdashboardapi/api"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                <p className="font-semibold mb-1">💡 Nota:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>La URL base debe terminar en <code className="bg-background px-1 py-0.5 rounded">/api</code></li>
                  <li>No incluyas <code className="bg-background px-1 py-0.5 rounded">/forms</code> o <code className="bg-background px-1 py-0.5 rounded">/dashboard</code> al final</li>
                  <li>Ejemplo: <code className="bg-background px-1 py-0.5 rounded">https://test.bizuit.com/[tenant]/api</code></li>
                  <li>La página se recargará al guardar para aplicar los cambios</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-6 gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-md border border-input hover:bg-accent text-sm"
              >
                Restaurar por defecto
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-md border border-input hover:bg-accent text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isSaved
                      ? 'bg-green-600 text-white'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {isSaved ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Guardado!
                    </span>
                  ) : (
                    'Guardar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
