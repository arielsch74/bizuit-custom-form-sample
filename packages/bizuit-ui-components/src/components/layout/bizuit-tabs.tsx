'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../../lib/utils'

export interface TabItem {
  value: string
  label: string
  content: React.ReactNode
  disabled?: boolean
  icon?: React.ReactNode
}

export interface BizuitTabsProps {
  items: TabItem[]
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  className?: string
  variant?: 'default' | 'pills' | 'underline'
}

const BizuitTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  BizuitTabsProps
>(
  (
    {
      items,
      defaultValue,
      value,
      onChange,
      orientation = 'horizontal',
      className,
      variant = 'default',
    },
    ref
  ) => {
    return (
      <TabsPrimitive.Root
        ref={ref}
        className={cn('w-full', className)}
        defaultValue={defaultValue || items[0]?.value}
        value={value}
        onValueChange={onChange}
        orientation={orientation}
      >
        <TabsPrimitive.List
          className={cn(
            'inline-flex items-center justify-start',
            orientation === 'horizontal'
              ? 'h-10 rounded-md bg-muted p-1 text-muted-foreground w-full'
              : 'flex-col h-auto space-y-1 w-48',
            variant === 'underline' && 'bg-transparent p-0 border-b',
            variant === 'pills' && 'bg-transparent p-0 gap-2'
          )}
        >
          {items.map((item) => (
            <TabsPrimitive.Trigger
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              className={cn(
                'inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5',
                'text-sm font-medium ring-offset-background transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',

                // Default variant
                variant === 'default' &&
                  'rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',

                // Pills variant
                variant === 'pills' &&
                  'rounded-full border border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary',

                // Underline variant
                variant === 'underline' &&
                  'border-b-2 border-transparent rounded-none data-[state=active]:border-primary data-[state=active]:text-foreground',

                orientation === 'vertical' && 'w-full justify-start'
              )}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>

        {items.map((item) => (
          <TabsPrimitive.Content
            key={item.value}
            value={item.value}
            className={cn(
              'mt-2 ring-offset-background focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            {item.content}
          </TabsPrimitive.Content>
        ))}
      </TabsPrimitive.Root>
    )
  }
)

BizuitTabs.displayName = 'BizuitTabs'

export { BizuitTabs }
