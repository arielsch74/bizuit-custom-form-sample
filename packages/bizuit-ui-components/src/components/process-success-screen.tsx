'use client'

import React from 'react'
import { Button } from './ui/button'

export interface ProcessSuccessScreenProps {
  /**
   * The process data returned from Bizuit API (raiseEvent or continueInstance response)
   */
  processData: {
    instanceId?: string
    status?: string
    tyconParameters?: any
    [key: string]: any
  }
  /**
   * Title to display (defaults to "Proceso Iniciado Exitosamente")
   */
  title?: string
  /**
   * Subtitle/description (defaults to "El proceso ha sido creado correctamente en el BPMS Bizuit")
   */
  subtitle?: string
  /**
   * Callback when user clicks "New Process" or similar action button
   */
  onNewProcess?: () => void
  /**
   * Callback when user clicks "Back to Home" or similar navigation button
   */
  onBackToHome?: () => void
  /**
   * Custom action buttons to show instead of default ones
   */
  customActions?: React.ReactNode
  /**
   * Additional CSS classes for the container
   */
  className?: string
}

/**
 * ProcessSuccessScreen - Displays a success message with process information
 *
 * Automatically shows:
 * - Success icon
 * - Instance ID
 * - Process status
 * - Return parameters (if any)
 * - Action buttons (customizable)
 *
 * Used after successfully starting or continuing a Bizuit process.
 *
 * @example
 * ```tsx
 * <ProcessSuccessScreen
 *   processData={result}
 *   onNewProcess={() => setStatus('idle')}
 *   onBackToHome={() => router.push('/')}
 * />
 * ```
 */
export function ProcessSuccessScreen({
  processData,
  title = 'Proceso Iniciado Exitosamente',
  subtitle = 'El proceso ha sido creado correctamente en el BPMS Bizuit',
  onNewProcess,
  onBackToHome,
  customActions,
  className = '',
}: ProcessSuccessScreenProps) {
  return (
    <div className={`border rounded-lg p-6 bg-card text-center ${className}`}>
      {/* Success Icon */}
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-green-600 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold mb-2">{title}</h2>

      {/* Subtitle */}
      <p className="text-muted-foreground mb-6">{subtitle}</p>

      {/* Process Information */}
      {processData && (
        <div className="mb-6 p-4 bg-muted rounded-md text-left">
          <p className="text-sm font-medium mb-2">Información del Proceso:</p>
          <div className="space-y-2 text-sm">
            {/* Instance ID */}
            {processData.instanceId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Instance ID:</span>
                <span className="font-mono text-xs">{processData.instanceId}</span>
              </div>
            )}

            {/* Status */}
            {processData.status && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold">{processData.status}</span>
              </div>
            )}

            {/* Return Parameters */}
            {processData.tyconParameters && (
              <div className="mt-3">
                <p className="text-muted-foreground mb-1">Parámetros de Retorno:</p>
                <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-48">
                  {JSON.stringify(processData.tyconParameters, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {customActions ? (
        customActions
      ) : (
        <div className="flex gap-4 justify-center">
          {onNewProcess && (
            <Button onClick={onNewProcess}>
              Iniciar Otro Proceso
            </Button>
          )}
          {onBackToHome && (
            <Button variant="outline" onClick={onBackToHome}>
              Volver al Inicio
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
