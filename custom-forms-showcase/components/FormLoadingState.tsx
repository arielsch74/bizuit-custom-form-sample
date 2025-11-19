'use client'

export function FormLoadingState({ formName }: { formName?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-background" />
          </div>
        </div>

        <p className="text-lg font-medium mb-2">Loading form...</p>
        {formName && (
          <p className="text-sm text-muted-foreground">
            {formName}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          This may take a few seconds on first load
        </p>

        <div className="mt-6 max-w-xs mx-auto">
          <div className="flex justify-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
