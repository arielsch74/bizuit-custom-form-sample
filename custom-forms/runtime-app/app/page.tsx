'use client'

import Link from 'next/link'
import { useAppTranslation } from '@/lib/useAppTranslation'
import { SettingsToolbarFloating } from '@/components/settings-toolbar-floating'

export default function HomePage() {
  const backendApiUrl = process.env.NEXT_PUBLIC_API_URL
  const { t } = useAppTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
      <SettingsToolbarFloating />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6">
              <span className="text-primary-foreground font-bold text-4xl">B</span>
            </div>
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
              {t('home.title')}
            </h1>
            <p className="text-xl text-slate-700 dark:text-slate-300">
              {t('home.subtitle')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <FeatureCard
              icon="🔄"
              title={t('features.hotReload.title')}
              description={t('features.hotReload.description')}
            />
            <FeatureCard
              icon="📦"
              title={t('features.versioning.title')}
              description={t('features.versioning.description')}
            />
            <FeatureCard
              icon="🎯"
              title={t('features.registry.title')}
              description={t('features.registry.description')}
            />
            <FeatureCard
              icon="⚡"
              title={t('features.dynamic.title')}
              description={t('features.dynamic.description')}
            />
          </div>

          {/* Admin CTA */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              {t('home.adminPanel')}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              {t('home.adminDescription')}
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              {t('home.goToAdmin')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
            <div className="flex gap-3">
              <div className="text-2xl">ℹ️</div>
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  {t('info.howItWorks')}
                </h3>
                <p className="text-orange-800 dark:text-orange-200 text-sm">
                  {t('info.description')}
                  <strong> {t('info.formPath')}</strong> {t('info.whenNeeded')}
                </p>
              </div>
            </div>
          </div>

          {/* Documentation Links */}
          <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            <p className="mb-2">{t('home.documentation')}</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <a
                href="https://github.com/tyconsa/bizuit-custom-forms"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary dark:hover:text-primary underline"
              >
                GitHub
              </a>
              <span>•</span>
              <Link
                href="/admin"
                className="hover:text-primary dark:hover:text-primary underline"
              >
                {t('home.adminPanel.link')}
              </Link>
              {backendApiUrl && (
                <>
                  <span>•</span>
                  <a
                    href={`${backendApiUrl}/docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary dark:hover:text-primary underline"
                  >
                    API Docs
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300 text-sm">{description}</p>
    </div>
  )
}
