'use client'

import * as React from 'react'
import { cn } from '../../lib/utils'

export interface BizuitCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  header?: React.ReactNode
  footer?: React.ReactNode
  variant?: 'default' | 'outline' | 'filled'
  hoverable?: boolean
  clickable?: boolean
}

const BizuitCard = React.forwardRef<HTMLDivElement, BizuitCardProps>(
  (
    {
      className,
      title,
      description,
      header,
      footer,
      children,
      variant = 'default',
      hoverable = false,
      clickable = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border bg-card text-card-foreground shadow-sm',
          variant === 'outline' && 'border-2',
          variant === 'filled' && 'bg-muted border-none',
          hoverable && 'transition-shadow hover:shadow-md',
          clickable && 'cursor-pointer transition-all hover:scale-[1.02]',
          className
        )}
        {...props}
      >
        {header && <div className="p-6 pb-0">{header}</div>}

        {(title || description) && (
          <div className={cn('p-6', header && 'pt-2', footer && children && 'pb-0')}>
            {title && <h3 className="text-2xl font-semibold leading-none tracking-tight">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground mt-1.5">{description}</p>}
          </div>
        )}

        {children && (
          <div className={cn('p-6', (title || description) && 'pt-0')}>{children}</div>
        )}

        {footer && (
          <div className="flex items-center p-6 pt-0">{footer}</div>
        )}
      </div>
    )
  }
)

BizuitCard.displayName = 'BizuitCard'

export { BizuitCard }
