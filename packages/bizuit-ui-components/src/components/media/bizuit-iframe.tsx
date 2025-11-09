'use client'

import * as React from 'react'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

export interface BizuitIFrameProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  src: string
  title: string
  width?: string | number
  height?: string | number
  loading?: 'eager' | 'lazy'
  showLoader?: boolean
  onLoad?: () => void
  onError?: () => void
}

const BizuitIFrame = React.forwardRef<HTMLIFrameElement, BizuitIFrameProps>(
  (
    {
      src,
      title,
      width = '100%',
      height = 500,
      loading = 'lazy',
      showLoader = true,
      onLoad,
      onError,
      className,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = React.useState(showLoader)
    const [hasError, setHasError] = React.useState(false)

    const handleLoad = () => {
      setIsLoading(false)
      onLoad?.()
    }

    const handleError = () => {
      setIsLoading(false)
      setHasError(true)
      onError?.()
    }

    return (
      <div className={cn('relative w-full', className)} style={{ width, height }}>
        {isLoading && showLoader && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg border">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg border">
            <div className="text-center p-6">
              <p className="text-sm font-medium text-muted-foreground">
                Error al cargar el contenido
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                No se pudo cargar: {src}
              </p>
            </div>
          </div>
        )}

        <iframe
          ref={ref}
          src={src}
          title={title}
          width="100%"
          height="100%"
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'rounded-lg border bg-background',
            isLoading && 'opacity-0',
            hasError && 'hidden'
          )}
          {...props}
        />
      </div>
    )
  }
)

BizuitIFrame.displayName = 'BizuitIFrame'

export { BizuitIFrame }
