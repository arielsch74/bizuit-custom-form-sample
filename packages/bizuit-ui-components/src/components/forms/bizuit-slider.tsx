/**
 * BizuitSlider Component
 * Customizable slider with single/range values, marks, and tooltips
 * Built on Radix UI Slider - fully responsive
 */

'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '../../lib/utils'

export interface SliderMark {
  value: number
  label?: string
}

export interface BizuitSliderProps {
  /** Current value(s) */
  value?: number | number[]
  /** On change callback */
  onChange?: (value: number | number[]) => void
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Step increment */
  step?: number
  /** Enable range (two handles) */
  range?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Custom marks */
  marks?: SliderMark[]
  /** Show tooltip */
  showTooltip?: boolean
  /** Orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Custom className */
  className?: string
  /** Format tooltip value */
  formatValue?: (value: number) => string
}

export function BizuitSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  range = false,
  disabled = false,
  marks,
  showTooltip = true,
  orientation = 'horizontal',
  className,
  formatValue = (v) => String(v),
}: BizuitSliderProps) {
  const [internalValue, setInternalValue] = React.useState<number[]>(() => {
    if (value === undefined) {
      return range ? [min, max] : [min]
    }
    return Array.isArray(value) ? value : [value]
  })

  const [isDragging, setIsDragging] = React.useState(false)

  // Sync with external value
  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(Array.isArray(value) ? value : [value])
    }
  }, [value])

  // Handle value change
  const handleValueChange = (newValue: number[]) => {
    setInternalValue(newValue)
    onChange?.(range ? newValue : newValue[0])
  }

  return (
    <div className={cn('relative w-full py-4', className)}>
      <SliderPrimitive.Root
        value={internalValue}
        onValueChange={handleValueChange}
        onValueCommit={handleValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        orientation={orientation}
        className={cn(
          'relative flex touch-none select-none items-center',
          orientation === 'horizontal' ? 'w-full' : 'h-full flex-col',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
      >
        <SliderPrimitive.Track
          className={cn(
            'relative grow rounded-full bg-secondary',
            orientation === 'horizontal' ? 'h-2 w-full' : 'w-2 h-full'
          )}
        >
          <SliderPrimitive.Range
            className={cn(
              'absolute rounded-full bg-primary',
              orientation === 'horizontal' ? 'h-full' : 'w-full'
            )}
          />
        </SliderPrimitive.Track>

        {internalValue.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className={cn(
              'block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-50',
              'touch-manipulation active:scale-110',
              showTooltip && 'group relative'
            )}
          >
            {showTooltip && (isDragging || 'hover') && (
              <div
                className={cn(
                  'absolute left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded-md bg-popover text-popover-foreground shadow-md border',
                  'opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity',
                  orientation === 'horizontal' ? '-top-8' : '-left-16'
                )}
              >
                {formatValue(internalValue[index])}
              </div>
            )}
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Root>

      {/* Marks */}
      {marks && marks.length > 0 && (
        <div
          className={cn(
            'absolute flex justify-between text-xs text-muted-foreground',
            orientation === 'horizontal'
              ? 'left-0 right-0 top-full mt-2'
              : 'top-0 bottom-0 left-full ml-2 flex-col'
          )}
        >
          {marks.map((mark) => {
            const position = ((mark.value - min) / (max - min)) * 100

            return (
              <div
                key={mark.value}
                style={{
                  [orientation === 'horizontal' ? 'left' : 'top']: `${position}%`,
                }}
                className={cn(
                  'absolute',
                  orientation === 'horizontal'
                    ? '-translate-x-1/2'
                    : '-translate-y-1/2'
                )}
              >
                {mark.label || mark.value}
              </div>
            )
          })}
        </div>
      )}

      {/* Value display */}
      <div className="mt-6 flex justify-between text-sm">
        <span>
          {range
            ? `${formatValue(internalValue[0])} - ${formatValue(internalValue[1])}`
            : formatValue(internalValue[0])}
        </span>
        <span className="text-muted-foreground">
          {min} - {max}
        </span>
      </div>
    </div>
  )
}
