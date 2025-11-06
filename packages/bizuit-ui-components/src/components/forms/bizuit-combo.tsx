/**
 * BizuitCombo Component
 * Advanced combobox with search, multiselect, async loading, and virtualization
 * Mobile-optimized with touch support
 */

'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X, Search } from 'lucide-react'
import { cn, debounce } from '../../lib/utils'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Command } from 'cmdk'

export interface ComboOption {
  label: string
  value: string
  disabled?: boolean
  group?: string
  [key: string]: any
}

export interface BizuitComboProps {
  /** Available options */
  options: ComboOption[]
  /** Selected value(s) */
  value?: string | string[]
  /** On change callback */
  onChange?: (value: string | string[]) => void
  /** Enable multiselect */
  multiSelect?: boolean
  /** Enable search */
  searchable?: boolean
  /** Search placeholder */
  searchPlaceholder?: string
  /** Placeholder text */
  placeholder?: string
  /** Empty state message */
  emptyMessage?: string
  /** Async search function */
  onSearch?: (query: string) => Promise<ComboOption[]>
  /** Loading state */
  loading?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Custom className */
  className?: string
  /** Custom option render */
  renderOption?: (option: ComboOption) => React.ReactNode
  /** Max selected items (multiselect only) */
  maxSelected?: number
  /** Show selected count in trigger */
  showCount?: boolean
  /** Clear button */
  clearable?: boolean
  /** Virtual scrolling for large lists */
  virtualized?: boolean
  /** Mobile mode - full screen on mobile */
  mobileFullScreen?: boolean
}

export function BizuitCombo({
  options: initialOptions,
  value,
  onChange,
  multiSelect = false,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  placeholder = 'Seleccionar...',
  emptyMessage = 'No se encontraron opciones',
  onSearch,
  loading = false,
  disabled = false,
  className,
  renderOption,
  maxSelected,
  showCount = true,
  clearable = true,
  virtualized = false,
  mobileFullScreen = true,
}: BizuitComboProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [options, setOptions] = React.useState<ComboOption[]>(initialOptions)
  const [isSearching, setIsSearching] = React.useState(false)

  // Normalize value to array
  const selectedValues = React.useMemo(() => {
    if (value === undefined || value === null) return []
    return Array.isArray(value) ? value : [value]
  }, [value])

  // Async search with debounce
  const debouncedSearch = React.useMemo(
    () =>
      onSearch
        ? debounce(async (query: string) => {
            setIsSearching(true)
            try {
              const results = await onSearch(query)
              setOptions(results)
            } catch (error) {
              console.error('Search failed:', error)
            } finally {
              setIsSearching(false)
            }
          }, 300)
        : null,
    [onSearch]
  )

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (debouncedSearch) {
      debouncedSearch(value)
    }
  }

  // Filter options by search query
  const filteredOptions = React.useMemo(() => {
    if (!searchable || onSearch) return options

    if (!search) return options

    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    )
  }, [options, search, searchable, onSearch])

  // Group options
  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, ComboOption[]> = {}

    filteredOptions.forEach((option) => {
      const group = option.group || '_default'
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(option)
    })

    return groups
  }, [filteredOptions])

  // Handle selection
  const handleSelect = (selectedValue: string) => {
    if (multiSelect) {
      let newValues: string[]

      if (selectedValues.includes(selectedValue)) {
        // Remove
        newValues = selectedValues.filter((v) => v !== selectedValue)
      } else {
        // Add (check max)
        if (maxSelected && selectedValues.length >= maxSelected) {
          return
        }
        newValues = [...selectedValues, selectedValue]
      }

      onChange?.(newValues)
    } else {
      onChange?.(selectedValue)
      setOpen(false)
    }

    setSearch('')
  }

  // Clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(multiSelect ? [] : '')
  }

  // Remove single item (multiselect)
  const handleRemoveItem = (valueToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (multiSelect) {
      const newValues = selectedValues.filter((v) => v !== valueToRemove)
      onChange?.(newValues)
    }
  }

  // Get selected option labels
  const selectedLabels = React.useMemo(() => {
    return selectedValues
      .map((v) => options.find((opt) => opt.value === v)?.label)
      .filter(Boolean) as string[]
  }, [selectedValues, options])

  // Trigger display text
  const triggerText = React.useMemo(() => {
    if (selectedValues.length === 0) return placeholder

    if (multiSelect) {
      if (showCount && selectedValues.length > 2) {
        return `${selectedValues.length} seleccionados`
      }
      return selectedLabels.join(', ')
    }

    return selectedLabels[0] || placeholder
  }, [selectedValues, selectedLabels, multiSelect, showCount, placeholder])

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
            className
          )}
        >
          <span className="flex-1 truncate text-left">{triggerText}</span>
          <div className="flex items-center gap-1">
            {clearable && selectedValues.length > 0 && !disabled && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className={cn(
            'z-50 w-[--radix-popover-trigger-width] rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            mobileFullScreen &&
              'sm:w-[--radix-popover-trigger-width] max-sm:fixed max-sm:inset-4 max-sm:w-auto'
          )}
        >
          <Command shouldFilter={false}>
            {searchable && (
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                  className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            )}

            <Command.List className="max-h-[300px] overflow-y-auto p-1">
              {(loading || isSearching) && (
                <Command.Loading>
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Cargando...
                  </div>
                </Command.Loading>
              )}

              {!loading && !isSearching && filteredOptions.length === 0 && (
                <Command.Empty>
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </div>
                </Command.Empty>
              )}

              {!loading &&
                !isSearching &&
                Object.entries(groupedOptions).map(([group, groupOptions]) => (
                  <Command.Group
                    key={group}
                    heading={group !== '_default' ? group : undefined}
                  >
                    {groupOptions.map((option) => {
                      const isSelected = selectedValues.includes(option.value)

                      return (
                        <Command.Item
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                          onSelect={() => handleSelect(option.value)}
                          className={cn(
                            'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                            'aria-selected:bg-accent aria-selected:text-accent-foreground',
                            'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                            'touch-manipulation'
                          )}
                        >
                          {multiSelect && (
                            <div
                              className={cn(
                                'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'opacity-50 [&_svg]:invisible'
                              )}
                            >
                              <Check className="h-4 w-4" />
                            </div>
                          )}

                          {renderOption ? (
                            renderOption(option)
                          ) : (
                            <span className="flex-1">{option.label}</span>
                          )}

                          {!multiSelect && isSelected && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </Command.Item>
                      )
                    })}
                  </Command.Group>
                ))}
            </Command.List>
          </Command>

          {/* Selected chips (multiselect) */}
          {multiSelect && selectedValues.length > 0 && (
            <div className="border-t p-2">
              <div className="flex flex-wrap gap-1">
                {selectedValues.map((val) => {
                  const option = options.find((opt) => opt.value === val)
                  if (!option) return null

                  return (
                    <div
                      key={val}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground"
                    >
                      <span>{option.label}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:opacity-70"
                        onClick={(e) => handleRemoveItem(val, e)}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
