'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

interface Props {
  formName: string
  formVersion?: string
  children: ReactNode
}

export function FormContainer({ formName, formVersion, children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Home
              </Link>
              <div className="h-4 w-px bg-border" />
              <div>
                <h1 className="text-lg font-semibold">
                  {formName}
                </h1>
                {formVersion && (
                  <p className="text-xs text-muted-foreground">
                    v{formVersion}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                Custom Form
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Powered by <span className="font-semibold">Bizuit Custom Forms</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/docs"
                className="hover:text-foreground transition-colors"
              >
                Documentation
              </Link>
              <Link
                href="/forms"
                className="hover:text-foreground transition-colors"
              >
                All Forms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
