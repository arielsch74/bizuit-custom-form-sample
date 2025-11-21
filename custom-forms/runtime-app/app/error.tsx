'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg border">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <h2 className="text-2xl font-bold text-foreground">
            Error de aplicación
          </h2>
        </div>

        <p className="text-muted-foreground mb-6">
          {error.message || 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.'}
        </p>

        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4 font-mono">
            ID de error: {error.digest}
          </p>
        )}

        <button
          onClick={reset}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Intentar nuevamente
        </button>
      </div>
    </div>
  )
}