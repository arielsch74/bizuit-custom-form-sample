'use client'

import { useState, useEffect } from 'react'
import { Sandpack } from '@codesandbox/sandpack-react'
import { Card } from '@/components/ui/card'
import { useBizuitTheme, type ColorTheme } from '@tyconsa/bizuit-ui-components'

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
  const [mounted, setMounted] = useState(false)

  // Resolver el tema actual
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
    const isDark = resolvedTheme === 'dark'

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

    // En dark mode, reemplazar backgrounds y borders claros por oscuros en CSS también
    if (isDark) {
      processedCSS = processedCSS
        // Backgrounds
        .replace(/#f9fafb/g, '#0f172a')
        .replace(/#f3f4f6/g, '#1e293b')
        // Borders
        .replace(/#e5e7eb/g, '#334155')
        .replace(/#d1d5db/g, '#475569')
        // Text colors
        .replace(/#111827/g, '#f1f5f9')
        .replace(/#1f2937/g, '#e2e8f0')
        .replace(/#374151/g, '#cbd5e1')
        .replace(/#6b7280/g, '#94a3b8')
        .replace(/#9ca3af/g, '#64748b')
    }

    // Agregar reglas para modo dark si está activo
    if (isDark) {
      processedCSS += `

/* Dark Mode Styles */
body {
  background-color: #0f172a !important;
  color: #e2e8f0 !important;
}

h1, h2, h3, h4, h5, h6, p, span, div {
  color: #f1f5f9 !important;
}

.container {
  background-color: #0f172a !important;
  color: #e2e8f0 !important;
}

.card {
  background-color: #1e293b !important;
  color: #e2e8f0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5) !important;
}

.card-title {
  color: #f1f5f9 !important;
}

label, .form-label {
  color: #cbd5e1 !important;
}

.form-input, input[type="text"], input[type="email"], input[type="number"], input[type="date"], input[type="time"], textarea, select {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  color: #f1f5f9 !important;
}

.form-input:focus, input:focus, textarea:focus, select:focus {
  border-color: ${colors.primary} !important;
  background-color: #1e293b !important;
}

.form-input.no-send {
  background-color: #1e293b !important;
  opacity: 0.7;
}

.hint {
  color: #94a3b8 !important;
}

.warning {
  color: #fbbf24 !important;
}

.modal-content {
  background-color: #1e293b !important;
  color: #e2e8f0 !important;
}

.modal-body {
  background-color: #1e293b !important;
}

.param-item {
  background-color: #0f172a !important;
  border: 1px solid #334155;
}

.param-name {
  color: #cbd5e1 !important;
}

.param-value {
  color: #94a3b8 !important;
}

.params-title.visible {
  background-color: #064e3b !important;
  color: #6ee7b7 !important;
}

.params-title.hidden {
  background-color: #1e3a8a !important;
  color: #93c5fd !important;
}

.params-total {
  background: linear-gradient(135deg, #581c87 0%, #6b21a8 100%) !important;
  color: #e9d5ff !important;
}

.no-send-section {
  border-top-color: #334155 !important;
}
`
    }

    return processedCSS
  }

  // Generar JavaScript dinámico para reemplazar colores en inline styles
  const generateDynamicJS = (baseJS: string): string => {
    const colors = colorMap[colorTheme]
    const isDark = resolvedTheme === 'dark'

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

    // En dark mode, reemplazar backgrounds y borders claros por oscuros, Y agregar color a inline styles
    if (isDark) {
      processedJS = processedJS
        // Backgrounds claros → oscuros (en inline styles JavaScript)
        .replace(/background:\s*'#f9fafb'/g, "background: '#0f172a'")
        .replace(/background:\s*"#f9fafb"/g, 'background: "#0f172a"')
        .replace(/background:\s*'#f3f4f6'/g, "background: '#1e293b'")
        .replace(/background:\s*"#f3f4f6"/g, 'background: "#1e293b"')
        .replace(/background:\s*'white'/g, "background: '#1e293b'")
        .replace(/background:\s*"white"/g, 'background: "#1e293b"')

        // Borders claros → oscuros
        .replace(/border:\s*'1px solid #e5e7eb'/g, "border: '1px solid #334155'")
        .replace(/border:\s*"1px solid #e5e7eb"/g, 'border: "1px solid #334155"')
        .replace(/border:\s*'1px solid #d1d5db'/g, "border: '1px solid #475569'")
        .replace(/border:\s*"1px solid #d1d5db"/g, 'border: "1px solid #475569"')
        .replace(/border:\s*'2px solid #d1d5db'/g, "border: '2px solid #475569'")
        .replace(/border:\s*"2px solid #d1d5db"/g, 'border: "2px solid #475569"')
        .replace(/border:\s*'2px dashed #d1d5db'/g, "border: '2px dashed #475569'")
        .replace(/border:\s*"2px dashed #d1d5db"/g, 'border: "2px dashed #475569"')

        // Text colors oscuros → claros
        .replace(/color:\s*'#111827'/g, "color: '#f1f5f9'")
        .replace(/color:\s*"#111827"/g, 'color: "#f1f5f9"')
        .replace(/color:\s*'#1f2937'/g, "color: '#e2e8f0'")
        .replace(/color:\s*"#1f2937"/g, 'color: "#e2e8f0"')
        .replace(/color:\s*'#374151'/g, "color: '#cbd5e1'")
        .replace(/color:\s*"#374151"/g, 'color: "#cbd5e1"')
        .replace(/color:\s*'#6b7280'/g, "color: '#94a3b8'")
        .replace(/color:\s*"#6b7280"/g, 'color: "#94a3b8"')

        // CRÍTICO: Agregar color a inline styles que NO tienen color pero tienen fontSize
        // Esto captura h2, h3, p, etc que tienen inline styles sin color
        .replace(/style=\{\{([^}]*fontSize[^}]*)\}\}/g, (match, innerStyle) => {
          // Si ya tiene color, no modificar
          if (innerStyle.includes('color:')) {
            return match
          }
          // Agregar color al final del style object
          return `style={{${innerStyle}, color: '#f1f5f9'}}`
        })
    }

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
          files={processedFiles}
          theme={resolvedTheme}
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
            Edita el código en el panel izquierdo y verás los cambios EN TIEMPO REAL en el panel derecho.
          </span>
        </p>
      </div>
    </div>
  )
}
