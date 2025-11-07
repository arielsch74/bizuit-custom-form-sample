'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppToolbar } from '@/components/app-toolbar'
import { useTranslation } from '@bizuit/ui-components'

export default function Home() {
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show loading state until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <AppToolbar />
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Bizuit Form Example
          </h1>
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <AppToolbar />
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {t('home.title')}
        </h1>

        <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-2 lg:text-left gap-4">
          <Link
            href="/start-process"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            <h2 className="mb-3 text-2xl font-semibold">
              {t('home.startProcess')}{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              {t('home.startProcess.description')}
            </p>
          </Link>

          <Link
            href="/continue-process"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            <h2 className="mb-3 text-2xl font-semibold">
              {t('home.continueProcess')}{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              {t('home.continueProcess.description')}
            </p>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold mb-4">{t('home.components.title')}</h3>
          <p className="text-sm opacity-50 mb-4">
            {t('home.components.description')}
          </p>

          <Link
            href="/components-demo"
            className="inline-block group rounded-lg border border-transparent px-8 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 mb-6"
          >
            <span className="text-lg font-semibold">
              {t('home.components.demo')}{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </span>
          </Link>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-muted">
              <p className="font-mono">BizuitDataGrid</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="font-mono">BizuitCombo</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="font-mono">BizuitDateTimePicker</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="font-mono">BizuitSlider</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="font-mono">BizuitFileUpload</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="font-mono">+ More</p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 rounded-lg border border-border bg-card">
          <h4 className="font-semibold mb-2">📦 {t('home.packages.title')}</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">@tyconsa/bizuit-form-sdk</code> - SDK Core</li>
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">@tyconsa/bizuit-ui-components</code> - UI Components</li>
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">Next.js 15</code> - Framework</li>
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">Tailwind CSS</code> - Styling</li>
            <li><code className="text-xs bg-muted px-1 py-0.5 rounded">TypeScript 5</code> - Type Safety</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
