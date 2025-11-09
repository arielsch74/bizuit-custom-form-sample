'use client'

import { useState } from 'react'
import { Sandpack } from '@codesandbox/sandpack-react'
import { Card } from '@/components/ui/card'

interface LiveCodeEditorProps {
  title: string
  description?: string
  files: {
    [filename: string]: string
  }
  template?: 'react' | 'react-ts' | 'vanilla' | 'vanilla-ts'
}

export function LiveCodeEditor({
  title,
  description,
  files,
  template = 'react-ts'
}: LiveCodeEditorProps) {
  const [isCodeVisible, setIsCodeVisible] = useState(false)

  const handleToggle = () => {
    console.log('Toggle clicked, current state:', isCodeVisible)
    setIsCodeVisible(prev => !prev)
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <span className="text-2xl">⚡</span>
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{description}</p>
          )}
        </div>

        <button
          onClick={handleToggle}
          className={`
            shrink-0 px-6 py-3 rounded-lg font-semibold text-sm
            transition-all duration-200 ease-in-out
            shadow-md hover:shadow-xl
            flex items-center gap-2
            ${isCodeVisible
              ? 'bg-gray-600 hover:bg-gray-700 text-white'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
            }
          `}
        >
          {isCodeVisible ? (
            <>
              <span>👁️</span>
              Ocultar Código
            </>
          ) : (
            <>
              <span>💻</span>
              Ver/Editar Código
            </>
          )}
        </button>
      </div>

      {/* Sandpack Editor - CodePen Style */}
      <div className="rounded-lg overflow-hidden border border-border shadow-lg">
        <Sandpack
          key={isCodeVisible ? 'editor-visible' : 'editor-hidden'}
          template="react"
          files={files}
          theme="light"
          options={{
            showNavigator: false,
            showTabs: isCodeVisible,
            showLineNumbers: isCodeVisible,
            showInlineErrors: isCodeVisible,
            wrapContent: true,
            editorHeight: 700,
            editorWidthPercentage: isCodeVisible ? 50 : 0,
            activeFile: Object.keys(files)[0],
            showConsole: false,
            showConsoleButton: false,
          }}
          customSetup={{
            dependencies: {
              '@tyconsa/bizuit-form-sdk': 'latest',
              '@tyconsa/bizuit-ui-components': 'latest',
            }
          }}
        />
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm leading-relaxed">
          <strong className="text-blue-900 dark:text-blue-100 text-base">💡 Tip:</strong>{' '}
          <span className="text-blue-800 dark:text-blue-200">
            {isCodeVisible
              ? 'Edita el código en el panel izquierdo y verás los cambios EN TIEMPO REAL en el panel derecho.'
              : 'Haz clic en "Ver/Editar Código" para ver y modificar el código fuente del formulario.'}
          </span>
        </p>
      </div>
    </Card>
  )
}
