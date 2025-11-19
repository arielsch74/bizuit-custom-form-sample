'use client'

import { useBizuitTheme } from '@tyconsa/bizuit-ui-components'
import { useEffect, useState } from 'react'

export function ThemeDebug() {
  const { colorTheme, theme, language, setColorTheme } = useBizuitTheme()
  const [mounted, setMounted] = useState(false)
  const [htmlClasses, setHtmlClasses] = useState<string>('')

  useEffect(() => {
    setMounted(true)
    // Check HTML classes
    const classes = document.documentElement.className
    setHtmlClasses(classes)
  }, [colorTheme, theme])

  const clearStorage = () => {
    localStorage.clear()
    window.location.reload()
  }

  const forceSync = () => {
    // Force re-apply the color theme
    setColorTheme(colorTheme)
  }

  if (!mounted) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white p-4 rounded-lg text-xs font-mono space-y-2">
      <div>Theme: {theme}</div>
      <div>Color: {colorTheme}</div>
      <div>Language: {language}</div>
      <div>HTML Classes: {htmlClasses}</div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={clearStorage}
          className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs"
        >
          Clear Storage
        </button>
        <button
          onClick={forceSync}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs"
        >
          Force Sync
        </button>
      </div>
    </div>
  )
}
