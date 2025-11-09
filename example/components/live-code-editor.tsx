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
          template="react"
          files={files}
          theme="auto"
          options={{
            showNavigator: false,
            showTabs: true,
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            editorHeight: 600,
            editorWidthPercentage: 50,
            activeFile: Object.keys(files)[0],
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
