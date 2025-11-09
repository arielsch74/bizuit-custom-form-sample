'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface RadioOption {
  label: string
  value: string
  disabled?: boolean
  description?: string
}

export interface BizuitRadioButtonProps {
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  disabled?: boolean
  className?: string
  name?: string
  required?: boolean
  label?: string
  error?: string
}

const BizuitRadioButton = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  BizuitRadioButtonProps
>(
  (
    {
      options,
      value,
      onChange,
      orientation = 'vertical',
      disabled = false,
      className,
      name,
      required = false,
      label,
      error,
    },
    ref
  ) => {
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <RadioGroupPrimitive.Root
          ref={ref}
          className={cn(
            'flex gap-4',
            orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
          )}
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          name={name}
          required={required}
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-start space-x-2">
              <RadioGroupPrimitive.Item
                value={option.value}
                disabled={option.disabled || disabled}
                className={cn(
                  'aspect-square h-4 w-4 rounded-full border border-primary text-primary',
                  'ring-offset-background focus:outline-none focus-visible:ring-2',
                  'focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'mt-0.5' // Align with text
                )}
              >
                <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                  <Circle className="h-2.5 w-2.5 fill-current text-current" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>

              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor={option.value}
                  className={cn(
                    'text-sm font-medium leading-none cursor-pointer',
                    'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  )}
                >
                  {option.label}
                </label>
                {option.description && (
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </RadioGroupPrimitive.Root>

        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    )
  }
)

BizuitRadioButton.displayName = 'BizuitRadioButton'

export { BizuitRadioButton }
