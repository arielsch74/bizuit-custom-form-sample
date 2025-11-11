'use client'

import { Card, Button } from '@tyconsa/bizuit-ui-components'

interface Props {
  error: string
  formName: string
  onRetry?: () => void
}

export function FormErrorBoundary({ error, formName, onRetry }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="p-6 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold mb-2">Error Loading Form</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Form &quot;{formName}&quot; could not be loaded
          </p>

          <div className="p-3 bg-red-50 text-red-700 text-sm rounded mb-4 text-left">
            <div className="font-semibold mb-1">Error Details:</div>
            <div className="font-mono text-xs break-words">{error}</div>
          </div>

          <div className="flex gap-2">
            {onRetry && (
              <Button onClick={onRetry} className="flex-1">
                Retry
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1"
            >
              Go Back
            </Button>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <details className="text-left">
              <summary className="cursor-pointer hover:underline">
                Troubleshooting
              </summary>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Verify the form package is published to npm</li>
                <li>Check if the form name is correct</li>
                <li>Ensure all CDN providers are accessible</li>
                <li>Check browser console for detailed errors</li>
              </ul>
            </details>
          </div>
        </div>
      </Card>
    </div>
  )
}
