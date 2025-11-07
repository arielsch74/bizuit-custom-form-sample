'use client'

import { ThemeToggle, ColorThemeSelector, LanguageSelector } from '@bizuit/ui-components'

export function AppToolbar() {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border bg-card p-2 shadow-lg">
      <ThemeToggle />
      <div className="h-6 w-px bg-border" />
      <ColorThemeSelector />
      <div className="h-6 w-px bg-border" />
      <LanguageSelector />
    </div>
  )
}
