'use client'

import { useEffect, useState, useRef } from 'react'
import { Settings, Sun, Moon, Monitor, Check } from 'lucide-react'
import { useBizuitTheme } from '@tyconsa/bizuit-ui-components'

const COLORS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'slate', label: 'Slate', class: 'bg-slate-500' },
]

const LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
]

export function SettingsToolbarFloating() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { theme, colorTheme, language, setTheme, setColorTheme, setLanguage } = useBizuitTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!mounted) {
    return (
      <div className="fixed top-4 right-4 z-[60]">
        <button className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-slate-600 dark:text-slate-400">
          <Settings className="w-5 h-5 animate-pulse" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-[60]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        aria-label="Settings"
      >
        <Settings className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-16 min-w-[240px] max-h-[80vh] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg p-3">
          <div className="flex flex-col gap-3">
            {/* Theme Selection */}
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Theme</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    theme === 'light'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    theme === 'dark'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    theme === 'system'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-700" />

            {/* Color Selection */}
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Color</span>
              <div className="grid grid-cols-2 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setColorTheme(color.value as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      colorTheme === color.value
                        ? 'bg-slate-200 dark:bg-slate-700 ring-2 ring-primary'
                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${color.class}`} />
                    <span className="text-slate-700 dark:text-slate-300 text-xs flex-1">{color.label}</span>
                    {colorTheme === color.value && <Check className="w-3 h-3 text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-700" />

            {/* Language Selection */}
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Language</span>
              <div className="flex flex-col gap-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setLanguage(lang.value as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      language === lang.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="flex-1">{lang.label}</span>
                    {language === lang.value && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
