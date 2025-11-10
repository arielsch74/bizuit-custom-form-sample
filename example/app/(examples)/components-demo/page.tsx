'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Package, Languages } from 'lucide-react'
import ComponentsSidebar from './ComponentsSidebar'
import ComponentView from './ComponentView'
import { ALL_COMPONENTS_DOCS } from './all-components-docs'
import { useTranslation, useBizuitTheme } from '@tyconsa/bizuit-ui-components'

function ComponentsDemoContent() {
  const [selectedComponentId, setSelectedComponentId] = useState('button')
  const { t } = useTranslation()
  const { language, setLanguage } = useBizuitTheme()

  const selectedComponent = ALL_COMPONENTS_DOCS.find(
    (comp) => comp.id === selectedComponentId
  )

  // Calculate stats
  const categories = [...new Set(ALL_COMPONENTS_DOCS.map((c) => c.category))]
  const categoryCount = categories.length

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <ComponentsSidebar
        selectedComponentId={selectedComponentId}
        onComponentSelect={setSelectedComponentId}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Header with back link and language selector */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="text-sm text-primary hover:underline"
            >
              {t('ui.backToHome')}
            </Link>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-primary text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  language === 'es'
                    ? 'bg-primary text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Español
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {selectedComponent ? (
            <ComponentView component={selectedComponent} />
          ) : (
            <WelcomeScreen
              totalComponents={ALL_COMPONENTS_DOCS.length}
              categoryCount={categoryCount}
            />
          )}
        </div>
      </main>
    </div>
  )
}

function WelcomeScreen({
  totalComponents,
  categoryCount,
}: {
  totalComponents: number
  categoryCount: number
}) {
  const { t } = useTranslation()

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-4">
          <Package className="h-10 w-10" />
        </div>

        <div className="space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-300 dark:to-slate-100 bg-clip-text text-transparent">
            {t('welcome.title')}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('welcome.subtitle')}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-500">
          <Sparkles className="h-4 w-4" />
          <span>{t('welcome.version')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {totalComponents}
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t('welcome.totalComponents')}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            {t('welcome.totalComponentsDesc')}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {categoryCount}
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t('welcome.categories')}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            {t('welcome.categoriesDesc')}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            100%
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t('welcome.typescript')}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            {t('welcome.typescriptDesc')}
          </p>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl border border-blue-200 dark:border-blue-900 p-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
            <ArrowLeft className="h-6 w-6 text-white rotate-180" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t('welcome.startExploring')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {t('welcome.selectComponent')}
            </p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>
                  <strong>{t('welcome.detailedDescription')}</strong> {t('welcome.detailedDescriptionText')}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>
                  <strong>{t('welcome.completeProps')}</strong> {t('welcome.completePropsText')}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>
                  <strong>{t('welcome.interactiveExamples')}</strong> {t('welcome.interactiveExamplesText')}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Install */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {t('welcome.quickInstall')}
        </h3>
        <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 font-mono text-sm text-emerald-400">
          npm install @tyconsa/bizuit-ui-components
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('welcome.thenImport')}
        </p>
        <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-300">
          <span className="text-purple-400">import</span>{' '}
          <span className="text-yellow-400">{'{'}</span> BizuitSlider,
          BizuitTabs, BizuitMedia{' '}
          <span className="text-yellow-400">{'}'}</span>{' '}
          <span className="text-purple-400">from</span>{' '}
          <span className="text-emerald-400">
            '@tyconsa/bizuit-ui-components'
          </span>
        </div>
      </div>
    </div>
  )
}

export default function ComponentsDemo() {
  return <ComponentsDemoContent />
}
