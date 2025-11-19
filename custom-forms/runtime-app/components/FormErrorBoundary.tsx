'use client'

import { BizuitCard, Button } from '@tyconsa/bizuit-ui-components'
import { parseFormError, getTroubleshootingTips } from '@/lib/form-errors'

interface Props {
  error: string
  formName: string
  onRetry?: () => void
}

export function FormErrorBoundary({ error, formName, onRetry }: Props) {
  const errorInfo = parseFormError(error, formName)
  const troubleshootingTips = getTroubleshootingTips(errorInfo.type)

  const iconConfig = {
    'not-found': {
      bg: 'bg-slate-100 dark:bg-slate-800',
      color: 'text-slate-600 dark:text-slate-400',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    'forbidden': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      color: 'text-red-600 dark:text-red-400',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    'expired': {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      color: 'text-orange-600 dark:text-orange-400',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    'error': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      color: 'text-red-600 dark:text-red-400',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    }
  }

  const icon = iconConfig[errorInfo.icon]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <BizuitCard className="p-8 max-w-2xl w-full shadow-xl">
        <div className="text-center">
          {/* Icon */}
          <div className={`w-20 h-20 ${icon.bg} rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm`}>
            <div className={icon.color}>
              {icon.icon}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-slate-100">
            {errorInfo.title}
          </h2>

          {/* Main Message */}
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            {errorInfo.message}
          </p>

          {/* User Action Box */}
          <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl mb-8 text-left shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-2">
                  ¿Qué puedes hacer?
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                  {errorInfo.userAction}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            {errorInfo.canRetry && onRetry && (
              <Button
                onClick={onRetry}
                className="flex-1 h-12 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
              >
                🔄 Reintentar
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1 h-12 text-base font-semibold border-2"
            >
              ← Volver
            </Button>
          </div>

          {/* Troubleshooting Section */}
          <div className="mt-8 text-sm">
            <details className="text-left bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <summary className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Solución de Problemas</span>
              </summary>
              <div className="mt-4 ml-7 space-y-3">
                {troubleshootingTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                    <span className="text-blue-500 dark:text-blue-400 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>

          {/* Technical Details (for admins) */}
          {errorInfo.technicalDetails && (
            <div className="mt-4 text-xs">
              <details className="text-left bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <summary className="cursor-pointer hover:text-slate-600 dark:hover:text-slate-400 text-slate-500 dark:text-slate-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>Detalles Técnicos (para administradores)</span>
                </summary>
                <div className="mt-3 p-4 bg-slate-900 dark:bg-slate-950 rounded-lg">
                  <pre className="text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap break-words">
                    {errorInfo.technicalDetails}
                  </pre>
                </div>
              </details>
            </div>
          )}
        </div>
      </BizuitCard>
    </div>
  )
}
