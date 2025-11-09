'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'

interface CodeViewerProps {
  title: string
  description?: string
  files: {
    [filename: string]: string
  }
}

export function CodeViewer({ title, description, files }: CodeViewerProps) {
  const fileNames = Object.keys(files)
  const [activeFile, setActiveFile] = useState(fileNames[0])
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeFile])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* Tabs para archivos */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {fileNames.map((filename) => (
          <button
            key={filename}
            onClick={() => setActiveFile(filename)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeFile === filename
                ? 'bg-background text-foreground shadow-sm'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {filename}
          </button>
        ))}
      </div>

      {/* Código fuente */}
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors shadow-lg"
          >
            {copied ? '✓ Copiado!' : 'Copiar Código'}
          </button>
        </div>

        <pre className="bg-gray-900 text-gray-100 p-4 pt-12 rounded-lg overflow-x-auto text-xs leading-relaxed max-h-[500px] overflow-y-auto">
          <code>{files[activeFile]}</code>
        </pre>
      </div>

      <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-md">
        <p className="text-sm">
          <strong className="text-blue-900 dark:text-blue-100">💡 Tip:</strong>{' '}
          <span className="text-blue-800 dark:text-blue-200">
            Este es el código fuente del formulario que ves funcionando abajo. Copia este código y úsalo en tu proyecto.
          </span>
        </p>
      </div>
    </Card>
  )
}
