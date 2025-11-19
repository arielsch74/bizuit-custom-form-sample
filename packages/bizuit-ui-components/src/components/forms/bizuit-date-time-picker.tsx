/**
 * BizuitDateTimePicker Component
 * Advanced date/time picker with locale support, ranges, and mobile optimization
 * Built on react-day-picker with custom time input
 */

'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { cn } from '../../lib/utils'
import * as PopoverPrimitive from '@radix-ui/react-popover'

export interface BizuitDateTimePickerProps {
  /** Selected date */
  value?: Date
  /** On change callback */
  onChange?: (date: Date | undefined) => void
  /** Mode: date, time, or datetime */
  mode?: 'date' | 'time' | 'datetime'
  /** Date format string */
  format?: string
  /** Min date */
  minDate?: Date
  /** Max date */
  maxDate?: Date
  /** Locale */
  locale?: 'es' | 'en'
  /** Disabled state */
  disabled?: boolean
  /** Placeholder */
  placeholder?: string
  /** Custom className */
  className?: string
  /** Show clear button */
  clearable?: boolean
  /** 24-hour format */
  use24Hour?: boolean
}

export function BizuitDateTimePicker({
  value,
  onChange,
  mode = 'date',
  format: formatString,
  minDate,
  maxDate,
  locale = 'es',
  disabled = false,
  placeholder,
  className,
  clearable = true,
  use24Hour = true,
}: BizuitDateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)
  const [timeValue, setTimeValue] = React.useState<string>('')

  // Sync with external value
  React.useEffect(() => {
    setSelectedDate(value)
    if (value && (mode === 'time' || mode === 'datetime')) {
      setTimeValue(
        format(value, use24Hour ? 'HH:mm' : 'hh:mm a', { locale: es })
      )
    }
  }, [value, mode, use24Hour])

  // Default format strings
  const defaultFormat = React.useMemo(() => {
    if (formatString) return formatString

    switch (mode) {
      case 'date':
        return locale === 'es' ? 'dd/MM/yyyy' : 'MM/dd/yyyy'
      case 'time':
        return use24Hour ? 'HH:mm' : 'hh:mm a'
      case 'datetime':
        return locale === 'es'
          ? `dd/MM/yyyy ${use24Hour ? 'HH:mm' : 'hh:mm a'}`
          : `MM/dd/yyyy ${use24Hour ? 'HH:mm' : 'hh:mm a'}`
    }
  }, [mode, locale, use24Hour, formatString])

  // Default placeholder
  const defaultPlaceholder = React.useMemo(() => {
    if (placeholder) return placeholder

    switch (mode) {
      case 'date':
        return 'Seleccionar fecha'
      case 'time':
        return 'Seleccionar hora'
      case 'datetime':
        return 'Seleccionar fecha y hora'
    }
  }, [mode, placeholder])

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined)
      onChange?.(undefined)
      return
    }

    // Preserve time if datetime mode
    if (mode === 'datetime' && selectedDate) {
      date.setHours(selectedDate.getHours())
      date.setMinutes(selectedDate.getMinutes())
    }

    setSelectedDate(date)

    if (mode === 'date') {
      onChange?.(date)
      setOpen(false)
    } else {
      onChange?.(date)
    }
  }

  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    setTimeValue(time)

    if (!time) return

    const [hours, minutes] = time.split(':').map(Number)
    const newDate = selectedDate ? new Date(selectedDate) : new Date()
    newDate.setHours(hours)
    newDate.setMinutes(minutes)

    setSelectedDate(newDate)
    onChange?.(newDate)
  }

  // Format display value
  const displayValue = React.useMemo(() => {
    if (!selectedDate) return ''

    return format(selectedDate, defaultFormat, {
      locale: locale === 'es' ? es : undefined,
    })
  }, [selectedDate, defaultFormat, locale])

  // Clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDate(undefined)
    setTimeValue('')
    onChange?.(undefined)
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'touch-manipulation',
            !displayValue && 'text-muted-foreground',
            className
          )}
        >
          <span className="flex items-center gap-2">
            {mode === 'time' ? (
              <Clock className="h-4 w-4" />
            ) : (
              <CalendarIcon className="h-4 w-4" />
            )}
            <span>{displayValue || defaultPlaceholder}</span>
          </span>
          {clearable && displayValue && !disabled && (
            <button
              onClick={handleClear}
              className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              ×
            </button>
          )}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className={cn(
            'z-50 rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
        >
          <div className="p-3">
            {(mode === 'date' || mode === 'datetime') && (
              <div key={selectedDate?.toISOString() || 'no-date'}>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => {
                    if (minDate && date < minDate) return true
                    if (maxDate && date > maxDate) return true
                    return false
                  }}
                  locale={locale === 'es' ? es : undefined}
                  className="touch-manipulation"
                  classNames={{
                    months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                    month: 'space-y-4',
                    caption: 'flex justify-center pt-1 relative items-center',
                    caption_label: 'text-sm font-medium',
                    nav: 'space-x-1 flex items-center',
                    nav_button:
                      'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                    nav_button_previous: 'absolute left-1',
                    nav_button_next: 'absolute right-1',
                    table: 'w-full border-collapse space-y-1',
                    head_row: 'flex',
                    head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                    row: 'flex w-full mt-2',
                    cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                    day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md',
                    day_selected:
                      'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                    day_today: 'bg-accent text-accent-foreground',
                    day_outside: 'text-muted-foreground opacity-50',
                    day_disabled: 'text-muted-foreground opacity-50',
                    day_range_middle:
                      'aria-selected:bg-accent aria-selected:text-accent-foreground',
                    day_hidden: 'invisible',
                  }}
                />
              </div>
            )}

            {(mode === 'time' || mode === 'datetime') && (
              <div className="border-t pt-3 mt-3">
                <label className="text-sm font-medium mb-2 block">Hora</label>
                <input
                  type="time"
                  value={timeValue}
                  onChange={handleTimeChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            )}

            {mode === 'datetime' && (
              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Confirmar
                </button>
              </div>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
