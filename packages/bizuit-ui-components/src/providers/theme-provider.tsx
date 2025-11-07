'use client'

import * as React from 'react'

export type Theme = 'dark' | 'light' | 'system'
export type ColorTheme = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'slate'
export type Language = 'en' | 'es'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColorTheme?: ColorTheme
  defaultLanguage?: Language
  storageKey?: string
  colorStorageKey?: string
  languageStorageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  colorTheme: ColorTheme
  setColorTheme: (colorTheme: ColorTheme) => void
  language: Language
  setLanguage: (language: Language) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  colorTheme: 'blue',
  setColorTheme: () => null,
  language: 'es',
  setLanguage: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function BizuitThemeProvider({
  children,
  defaultTheme = 'system',
  defaultColorTheme = 'blue',
  defaultLanguage = 'es',
  storageKey = 'bizuit-ui-theme',
  colorStorageKey = 'bizuit-ui-color-theme',
  languageStorageKey = 'bizuit-ui-language',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(
    () => (typeof window !== 'undefined' && (localStorage.getItem(storageKey) as Theme)) || defaultTheme
  )

  const [colorTheme, setColorTheme] = React.useState<ColorTheme>(
    () => (typeof window !== 'undefined' && (localStorage.getItem(colorStorageKey) as ColorTheme)) || defaultColorTheme
  )

  const [language, setLanguage] = React.useState<Language>(
    () => (typeof window !== 'undefined' && (localStorage.getItem(languageStorageKey) as Language)) || defaultLanguage
  )

  React.useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  React.useEffect(() => {
    const root = window.document.documentElement

    // Remove all color theme classes
    root.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-red', 'theme-slate')

    // Add current color theme class
    root.classList.add(`theme-${colorTheme}`)
  }, [colorTheme])

  React.useEffect(() => {
    const root = window.document.documentElement

    // Set language attribute
    root.setAttribute('lang', language)
  }, [language])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    colorTheme,
    setColorTheme: (colorTheme: ColorTheme) => {
      localStorage.setItem(colorStorageKey, colorTheme)
      setColorTheme(colorTheme)
    },
    language,
    setLanguage: (language: Language) => {
      localStorage.setItem(languageStorageKey, language)
      setLanguage(language)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useBizuitTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useBizuitTheme must be used within a BizuitThemeProvider')

  return context
}
