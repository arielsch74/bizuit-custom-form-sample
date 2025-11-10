'use client'

import { useState, useEffect } from 'react'
import { Sandpack } from '@codesandbox/sandpack-react'
import { Card } from '@/components/ui/card'
import { useBizuitTheme, useTranslation, type ColorTheme } from '@tyconsa/bizuit-ui-components'

interface LiveCodeEditorProps {
  title: string
  description?: string
  files: {
    [filename: string]: string
  }
  template?: 'react' | 'react-ts' | 'vanilla' | 'vanilla-ts'
}

// Mapa de colores para cada theme
const colorMap: Record<ColorTheme, { primary: string; primaryHover: string; primaryLight: string; primaryDark: string }> = {
  blue: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    primaryLight: '#dbeafe',
    primaryDark: '#1e40af'
  },
  green: {
    primary: '#10b981',
    primaryHover: '#059669',
    primaryLight: '#d1fae5',
    primaryDark: '#047857'
  },
  purple: {
    primary: '#a855f7',
    primaryHover: '#9333ea',
    primaryLight: '#f3e8ff',
    primaryDark: '#7e22ce'
  },
  orange: {
    primary: '#f97316',
    primaryHover: '#ea580c',
    primaryLight: '#ffedd5',
    primaryDark: '#c2410c'
  },
  red: {
    primary: '#ef4444',
    primaryHover: '#dc2626',
    primaryLight: '#fee2e2',
    primaryDark: '#b91c1c'
  },
  slate: {
    primary: '#64748b',
    primaryHover: '#475569',
    primaryLight: '#f1f5f9',
    primaryDark: '#334155'
  }
}

export function LiveCodeEditor({
  title,
  description,
  files,
  template = 'react-ts'
}: LiveCodeEditorProps) {
  const { theme, colorTheme } = useBizuitTheme()
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  // Resolver el tema actual (para el EDITOR del Sandpack)
  const getResolvedTheme = (): 'light' | 'dark' => {
    if (theme === 'system') {
      if (typeof window === 'undefined') return 'light'
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme as 'light' | 'dark'
  }

  const resolvedTheme = getResolvedTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Debug: Log theme changes
  useEffect(() => {
    if (mounted) {
      console.log('[LiveCodeEditor] Theme/Color changed:', { theme, resolvedTheme, colorTheme })
    }
  }, [theme, resolvedTheme, colorTheme, mounted])

  // Generar CSS dinámico con variables del color actual
  const generateDynamicCSS = (baseCSS: string): string => {
    const colors = colorMap[colorTheme]

    // CSS base con colores reemplazados
    let processedCSS = baseCSS
      // Reemplazar colores azules (ejemplo 3)
      .replace(/#3b82f6/g, colors.primary)
      .replace(/#2563eb/g, colors.primaryHover)
      .replace(/#dbeafe/g, colors.primaryLight)
      .replace(/#1e40af/g, colors.primaryDark)
      // Reemplazar colores naranjas (ejemplo 2)
      .replace(/#f97316/g, colors.primary)
      .replace(/#ea580c/g, colors.primaryHover)
      .replace(/#ffedd5/g, colors.primaryLight)
      .replace(/#c2410c/g, colors.primaryDark)
      // Reemplazar variantes RGBA azules
      .replace(/rgba\(59, 130, 246, ([\d.]+)\)/g, (_, alpha) => {
        // Convertir hex a rgba
        const r = parseInt(colors.primary.slice(1, 3), 16)
        const g = parseInt(colors.primary.slice(3, 5), 16)
        const b = parseInt(colors.primary.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      })
      // Reemplazar variantes RGBA naranjas
      .replace(/rgba\(249, 115, 22, ([\d.]+)\)/g, (_, alpha) => {
        const r = parseInt(colors.primary.slice(1, 3), 16)
        const g = parseInt(colors.primary.slice(3, 5), 16)
        const b = parseInt(colors.primary.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      })

    // NOTA: Ya NO forzamos dark mode aquí porque el código dentro del Sandpack
    // tiene su propio ThemeProvider que maneja el tema independientemente.
    // El LiveCodeEditor solo reemplaza colores primarios, no controla el tema del Sandpack.

    return processedCSS
  }

  // Generar JavaScript dinámico para reemplazar colores en inline styles
  const generateDynamicJS = (baseJS: string): string => {
    const colors = colorMap[colorTheme]

    // Reemplazar colores primarios (siempre)
    let processedJS = baseJS
      // Orange primario
      .replace(/#f97316/g, colors.primary)
      .replace(/#ea580c/g, colors.primaryHover)
      .replace(/#ffedd5/g, colors.primaryLight)
      .replace(/#c2410c/g, colors.primaryDark)
      // Blue primario (usado en algunos ejemplos)
      .replace(/#3b82f6/g, colors.primary)
      .replace(/#2563eb/g, colors.primaryHover)
      .replace(/#dbeafe/g, colors.primaryLight)
      .replace(/#1e40af/g, colors.primaryDark)

    // NOTA: Ya NO forzamos dark mode aquí porque el código dentro del Sandpack
    // tiene su propio ThemeProvider que maneja el tema independientemente.
    // El LiveCodeEditor solo reemplaza colores primarios, no controla el tema del Sandpack.

    return processedJS
  }

  // Procesar archivos para inyectar CSS y JS dinámicos
  const processedFiles = Object.entries(files).reduce((acc, [filename, content]) => {
    if (filename.endsWith('.css')) {
      acc[filename] = generateDynamicCSS(content)
    } else if (filename.endsWith('.js') || filename.endsWith('.jsx')) {
      acc[filename] = generateDynamicJS(content)
    } else {
      acc[filename] = content
    }
    return acc
  }, {} as Record<string, string>)

  // No renderizar Sandpack hasta que esté montado para evitar hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        <div className="rounded-lg overflow-hidden border-2 border-primary/20 shadow-xl h-[600px] bg-muted animate-pulse flex items-center justify-center">
          <p className="text-muted-foreground">Cargando editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>

      {/* Sandpack Editor - Always Visible */}
      <div className="rounded-lg overflow-hidden border-2 border-primary/20 shadow-xl">
        <Sandpack
          key={`${resolvedTheme}-${colorTheme}`}
          template="react"
          theme={resolvedTheme}
          files={processedFiles}
          options={{
            showNavigator: false,
            showTabs: true,
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            editorHeight: 600,
            editorWidthPercentage: 50,
            activeFile: Object.keys(processedFiles)[0],
          }}
          customSetup={{
            dependencies: {
              '@tyconsa/bizuit-ui-components': '1.3.2',
              '@tyconsa/bizuit-form-sdk': '1.1.1',
            },
          }}
        />
      </div>

      <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm leading-relaxed">
          <strong className="text-blue-900 dark:text-blue-100">💡 Tip:</strong>{' '}
          <span className="text-blue-800 dark:text-blue-200">
            {t('ui.liveEditorTip')}
          </span>
        </p>
      </div>
    </div>
  )
}
