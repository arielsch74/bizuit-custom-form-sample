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

        <div className="mt-16">
          <h3 className="text-2xl font-bold mb-2 text-center">📚 {tApp('home.sdkExamples.title')}</h3>
          <p className="text-sm opacity-50 mb-8 text-center max-w-3xl mx-auto">
            {tApp('home.sdkExamples.description')}
          </p>

          {/* Comparison Card */}
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-amber-50 to-green-50 dark:from-amber-950/20 dark:to-green-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
              <h4 className="font-bold text-lg mb-4 text-center">🤔 {tApp('home.comparison.title')}</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-amber-300 dark:border-amber-700">
                  <h5 className="font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                    ⚙️ {tApp('home.comparison.processService.title')}
                  </h5>
                  <p className="text-xs mb-3 text-gray-600 dark:text-gray-400">
                    {tApp('home.comparison.processService.description')}
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>{tApp('home.comparison.processService.pro1')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>{tApp('home.comparison.processService.pro2')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>{tApp('home.comparison.processService.pro3')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠</span>
                      <span>{tApp('home.comparison.processService.con1')}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-green-300 dark:border-green-700">
                  <h5 className="font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                    ✨ {tApp('home.comparison.formService.title')}
                  </h5>
                  <p className="text-xs mb-3 text-gray-600 dark:text-gray-400">
                    {tApp('home.comparison.formService.description')}
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>{tApp('home.comparison.formService.pro1')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>{tApp('home.comparison.formService.pro2')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>{tApp('home.comparison.formService.pro3')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>{tApp('home.comparison.formService.pro4')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: ProcessService (Low-Level API) */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-grow h-px bg-amber-300 dark:bg-amber-700"></div>
              <h4 className="text-xl font-bold text-amber-600 dark:text-amber-400">
                ⚙️ {tApp('home.processService.title')}
              </h4>
              <div className="flex-grow h-px bg-amber-300 dark:bg-amber-700"></div>
            </div>
            <p className="text-sm text-center mb-6 text-gray-600 dark:text-gray-400">
              {tApp('home.processService.description')}
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/example-1-process-start"
                className="group rounded-lg border border-amber-200 dark:border-amber-800 px-5 py-4 transition-colors hover:border-amber-400 hover:bg-amber-50 hover:dark:border-amber-600 hover:dark:bg-amber-900/20"
              >
                <h4 className="mb-2 text-lg font-semibold">
                  {tApp('home.processService.example1.title')}{' '}
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    →
                  </span>
                </h4>
                <p className="text-sm opacity-70">
                  {tApp('home.processService.example1.description')}
                </p>
                <p className="text-xs mt-2 text-amber-600 dark:text-amber-400">
                  {tApp('home.processService.example1.methods')}
                </p>
              </Link>

              <Link
                href="/example-2-process-get-instance"
                className="group rounded-lg border border-amber-200 dark:border-amber-800 px-5 py-4 transition-colors hover:border-amber-400 hover:bg-amber-50 hover:dark:border-amber-600 hover:dark:bg-amber-900/20"
              >
                <h4 className="mb-2 text-lg font-semibold">
                  {tApp('home.processService.example2.title')}{' '}
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    →
                  </span>
                </h4>
                <p className="text-sm opacity-70">
                  {tApp('home.processService.example2.description')}
                </p>
                <p className="text-xs mt-2 text-amber-600 dark:text-amber-400">
                  {tApp('home.processService.example2.methods')}
                </p>
              </Link>

              <Link
                href="/example-3-process-continue"
                className="group rounded-lg border border-amber-200 dark:border-amber-800 px-5 py-4 transition-colors hover:border-amber-400 hover:bg-amber-50 hover:dark:border-amber-600 hover:dark:bg-amber-900/20"
              >
                <h4 className="mb-2 text-lg font-semibold">
                  {tApp('home.processService.example3.title')}{' '}
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    →
                  </span>
                </h4>
                <p className="text-sm opacity-70">
                  {tApp('home.processService.example3.description')}
                </p>
                <p className="text-xs mt-2 text-amber-600 dark:text-amber-400">
                  {tApp('home.processService.example3.methods')}
                </p>
              </Link>

              <Link
                href="/example-4-server-side"
                className="group rounded-lg border border-purple-500 px-5 py-4 transition-colors hover:border-purple-400 hover:bg-purple-50 hover:dark:border-purple-600 hover:dark:bg-purple-900/20 relative"
              >
                <div className="absolute top-2 right-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                  {tApp('home.processService.example4.badge')}
                </div>
                <h4 className="mb-2 text-lg font-semibold">
                  {tApp('home.processService.example4.title')}{' '}
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    →
                  </span>
                </h4>
                <p className="text-sm opacity-70">
                  {tApp('home.processService.example4.description')}
                </p>
                <p className="text-xs mt-2 text-purple-600 dark:text-purple-400">
                  {tApp('home.processService.example4.methods')} 🔐
                </p>
              </Link>
            </div>
          </div>

          {/* SECTION 2: FormService (High-Level API) */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-grow h-px bg-green-300 dark:bg-green-700"></div>
              <h4 className="text-xl font-bold text-green-600 dark:text-green-400">
                ✨ {tApp('home.formService.title')}
              </h4>
              <div className="flex-grow h-px bg-green-300 dark:bg-green-700"></div>
            </div>
            <p className="text-sm text-center mb-6 text-gray-600 dark:text-gray-400">
              {tApp('home.formService.description')}
            </p>

            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-4">
              <Link
                href="/example-5-form-dynamic"
                className="group rounded-lg border border-green-200 dark:border-green-800 px-5 py-4 transition-colors hover:border-green-400 hover:bg-green-50 hover:dark:border-green-600 hover:dark:bg-green-900/20"
              >
                <h4 className="mb-2 text-lg font-semibold">
                  {tApp('home.formService.example1.title')}{' '}
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    →
                  </span>
                </h4>
                <p className="text-sm opacity-70">
                  {tApp('home.formService.example1.description')}
                </p>
                <p className="text-xs mt-2 text-green-600 dark:text-green-400">
                  {tApp('home.formService.example1.methods')}
                </p>
              </Link>

              <Link
                href="/example-6-form-continue"
                className="group rounded-lg border border-green-200 dark:border-green-800 px-5 py-4 transition-colors hover:border-green-400 hover:bg-green-50 hover:dark:border-green-600 hover:dark:bg-green-900/20"
              >
                <h4 className="mb-2 text-lg font-semibold">
                  {tApp('home.formService.example2.title')}{' '}
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    →
                  </span>
                </h4>
                <p className="text-sm opacity-70">
                  {tApp('home.formService.example2.description')}
                </p>
                <p className="text-xs mt-2 text-green-600 dark:text-green-400">
                  {tApp('home.formService.example2.methods')}
                </p>
              </Link>

              <Link
                href="/example-7-form-selective"
                className="group rounded-lg border border-green-500 px-5 py-4 transition-colors hover:border-green-400 hover:bg-green-50 hover:dark:border-green-600 hover:dark:bg-green-900/20 relative"
              >
                <div className="absolute top-2 right-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                  {tApp('home.formService.example3.badge')} ⭐
                </div>
                <h4 className="mb-2 text-lg font-semibold">
                  {tApp('home.formService.example3.title')}{' '}
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    →
                  </span>
                </h4>
                <p className="text-sm opacity-70">
                  {tApp('home.formService.example3.description')}
                </p>
                <p className="text-xs mt-2 text-green-600 dark:text-green-400">
                  {tApp('home.formService.example3.methods')} 🎯
                </p>
              </Link>
            </div>
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
