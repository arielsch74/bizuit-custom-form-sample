'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@tyconsa/bizuit-ui-components'
import { useAppTranslation } from '@/lib/useAppTranslation'

export default function Home() {
  const { t } = useTranslation() // Base translations
  const { t: tApp } = useAppTranslation() // App-specific translations
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleComponentsDemo = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsNavigating(true)
    router.push('/components-demo')
  }

  // Show loading state until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
          <h1 className="text-4xl font-bold mb-8 text-center">
            BIZUIT Custom Forms Samples
          </h1>
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4 text-center">
          BIZUIT Custom Forms Samples
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Interactive examples and live demos for Bizuit BPM integration
        </p>

        {/* Getting Started CTA */}
        <div className="mb-8">
          <Link
            href="/getting-started"
            className="block max-w-2xl mx-auto bg-gradient-to-r from-primary to-blue-600 text-primary-foreground rounded-lg p-6 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold mb-2 flex items-center gap-2">
                  🚀 {tApp('home.gettingStarted')}
                  <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </div>
                <p className="text-sm opacity-90">
                  {tApp('home.gettingStarted.description')}
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-3 lg:text-left gap-4">
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

          <Link
            href="/forms"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-green-300 hover:bg-green-50 hover:dark:border-green-700 hover:dark:bg-green-950/30 relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium dark:bg-green-900 dark:text-green-100">
              NEW
            </div>
            <h2 className="mb-3 text-2xl font-semibold">
              Custom Forms{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Browse and load dynamic forms from any monorepo
            </p>
          </Link>
        </div>

        <div className="mt-16">
          <h3 className="text-xl font-semibold mb-4 text-center">📚 {t('home.examples.title')}</h3>
          <p className="text-sm opacity-50 mb-6 text-center">
            {t('home.examples.description')}
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <Link
              href="/example-1-dynamic"
              className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:dark:border-blue-700 hover:dark:bg-blue-900/20"
            >
              <h4 className="mb-2 text-lg font-semibold">
                {t('home.example1.title')}{' '}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  →
                </span>
              </h4>
              <p className="text-sm opacity-70">
                {t('home.example1.description')}
              </p>
              <p className="text-xs mt-2 text-blue-600 dark:text-blue-400">
                {t('home.example1.uses')}
              </p>
            </Link>

            <Link
              href="/example-2-manual-all"
              className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:dark:border-amber-700 hover:dark:bg-amber-900/20"
            >
              <h4 className="mb-2 text-lg font-semibold">
                {t('home.example2.title')}{' '}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  →
                </span>
              </h4>
              <p className="text-sm opacity-70">
                {t('home.example2.description')}
              </p>
              <p className="text-xs mt-2 text-amber-600 dark:text-amber-400">
                {t('home.example2.uses')}
              </p>
            </Link>

            <Link
              href="/example-3-manual-selective"
              className="group rounded-lg border border-green-500 px-5 py-4 transition-colors hover:border-green-400 hover:bg-green-50 hover:dark:border-green-600 hover:dark:bg-green-900/20 relative"
            >
              <div className="absolute top-2 right-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                {t('home.example3.badge')} ⭐
              </div>
              <h4 className="mb-2 text-lg font-semibold">
                {t('home.example3.title')}{' '}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  →
                </span>
              </h4>
              <p className="text-sm opacity-70">
                {t('home.example3.description')}
              </p>
              <p className="text-xs mt-2 text-green-600 dark:text-green-400">
                {t('home.example3.uses')} 🎯
              </p>
            </Link>
          </div>

          <h3 className="text-xl font-semibold mb-4 text-center">{t('home.components.title')}</h3>
          <p className="text-sm opacity-50 mb-4 text-center">
            {t('home.components.description')}
          </p>

          <button
            onClick={handleComponentsDemo}
            disabled={isNavigating}
            className="inline-block group rounded-lg border border-transparent px-8 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 mb-6 mx-auto block text-center disabled:opacity-50 disabled:cursor-wait"
          >
            <span className="text-lg font-semibold flex items-center justify-center gap-2">
              {isNavigating ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cargando...
                </>
              ) : (
                <>
                  {t('home.components.demo')}{' '}
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    →
                  </span>
                </>
              )}
            </span>
          </button>

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
