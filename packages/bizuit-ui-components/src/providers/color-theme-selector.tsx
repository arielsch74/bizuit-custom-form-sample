'use client'

import * as React from 'react'
import { Palette } from 'lucide-react'
import { useBizuitTheme, type ColorTheme } from './theme-provider'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '../lib/utils'

const colorThemes: { value: ColorTheme; label: string; color: string }[] = [
  { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { value: 'green', label: 'Green', color: 'bg-green-500' },
  { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
  { value: 'red', label: 'Red', color: 'bg-red-500' },
  { value: 'slate', label: 'Slate', color: 'bg-slate-500' },
]

export function ColorThemeSelector() {
  const { colorTheme, setColorTheme } = useBizuitTheme()
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const currentTheme = colorThemes.find((t) => t.value === colorTheme)

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          title="Select color theme"
        >
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">{currentTheme?.label}</span>
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={4}
          className={cn(
            'z-50 min-w-[200px] rounded-md border bg-popover p-2 text-popover-foreground shadow-md outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
        >
          <div className="space-y-1">
            {colorThemes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => {
                  setColorTheme(theme.value)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  colorTheme === theme.value && 'bg-accent'
                )}
              >
                <div className={cn('h-4 w-4 rounded-full', theme.color)} />
                <span>{theme.label}</span>
                {colorTheme === theme.value && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
