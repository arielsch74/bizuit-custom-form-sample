'use client'

import { useEffect, useState } from 'react'
import { ThemeToggle, ColorThemeSelector, LanguageSelector } from '@tyconsa/bizuit-ui-components'

export function SettingsToolbar() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border bg-card p-2 shadow-lg">
        <div className="h-10 w-32 animate-pulse bg-muted rounded" />
      </div>
    )
  }

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
