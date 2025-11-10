'use client'

import React from 'react'
import { ComponentDoc } from './all-components-docs'
import { PropsTable } from './PropsTable'
import { LiveCodeEditor } from '@/components/live-code-editor'
import { BizuitTabs, useTranslation, useBizuitTheme } from '@tyconsa/bizuit-ui-components'
import * as LucideIcons from 'lucide-react'

interface ComponentViewProps {
  component: ComponentDoc
}

export default function ComponentView({ component }: ComponentViewProps) {
  const { t } = useTranslation()
  const { language } = useBizuitTheme()

  console.log('ComponentView DEBUG:', {
    componentId: component.id,
    language,
    hasDescriptionEs: !!component.description_es,
    description: component.description,
    description_es: component.description_es,
    propsCount: component.props?.length
  })

  // Get the icon component from lucide-react
  const IconComponent = (LucideIcons as any)[component.icon]

  // Get the translated content based on language
  const description = language === 'es' && component.description_es
    ? component.description_es
    : component.description

  const detailedDescription = language === 'es' && component.detailedDescription_es
    ? component.detailedDescription_es
    : component.detailedDescription

  const useCases = language === 'es' && component.useCases_es
    ? component.useCases_es
    : component.useCases

  // Tab items for BizuitTabs
  const tabItems = [
    {
      value: 'overview',
      label: t('ui.overview'),
      icon: IconComponent ? <IconComponent className="h-4 w-4" /> : null,
      content: (
        <div className="space-y-6 p-6">
          {/* Description Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">{t('ui.description')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {detailedDescription}
            </p>
          </div>

          {/* Use Cases Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">{t('ui.useCases')}</h3>
            <ul className="space-y-2">
              {useCases.map((useCase, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-muted-foreground"
                >
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed">{useCase}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Installation Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">{t('ui.installation')}</h3>
            <div className="rounded-lg bg-slate-950 p-4 overflow-x-auto">
              <code className="text-sm text-slate-100 font-mono">
                npm install @tyconsa/bizuit-ui-components
              </code>
            </div>
            <div className="rounded-lg bg-slate-950 p-4 overflow-x-auto mt-2">
              <code className="text-sm text-slate-100 font-mono block">
                <span className="text-purple-400">import</span>{' '}
                {'{'} {component.name}{' '}
                {'}'} <span className="text-purple-400">from</span>{' '}
                <span className="text-green-400">
                  '@tyconsa/bizuit-ui-components'
                </span>
              </code>
            </div>
          </div>
        </div>
      ),
    },
    {
      value: 'props',
      label: t('ui.props'),
      icon: <LucideIcons.ListTree className="h-4 w-4" />,
      content: (
        <div className="p-6">
          <PropsTable props={component.props} />
        </div>
      ),
    },
    {
      value: 'example',
      label: t('ui.liveExample'),
      icon: <LucideIcons.Play className="h-4 w-4" />,
      content: (
        <div className="p-6">
          <LiveCodeEditor
            title={`${component.name} ${t('ui.example')}`}
            description={t('ui.editCodeDescription')}
            files={component.codeExample}
          />
        </div>
      ),
    },
    {
      value: 'code',
      label: t('ui.sourceCode'),
      icon: <LucideIcons.Code className="h-4 w-4" />,
      content: (
        <div className="p-6 space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              {t('ui.viewSourceCode')} {component.name} {t('ui.inYourProject')}
            </p>
          </div>
          {Object.entries(component.codeExample).map(([filename, code]) => (
            <div key={filename} className="space-y-2">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800 rounded-t-lg">
                <span className="text-sm font-mono text-slate-200">{filename}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(code)
                    alert(t('ui.codeCopied'))
                  }}
                  className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
                >
                  {t('ui.copy')}
                </button>
              </div>
              <pre className="rounded-b-lg bg-slate-950 p-4 overflow-x-auto">
                <code className="text-sm text-slate-100 font-mono whitespace-pre">
                  {code}
                </code>
              </pre>
            </div>
          ))}
        </div>
      ),
    },
  ]

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 shrink-0">
            {IconComponent && (
              <IconComponent className="h-8 w-8 text-primary" />
            )}
          </div>

          {/* Title and Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-foreground">
                {component.name}
              </h1>
              {/* Category Badge */}
              <span
                className={`
                  inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                  ${
                    component.category === 'ui'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : component.category === 'forms'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : component.category === 'layout'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          : component.category === 'media'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
                  }
                `}
              >
                {component.category.toUpperCase()}
              </span>
            </div>
            <p className="mt-2 text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <BizuitTabs
        items={tabItems}
        defaultValue="overview"
        variant="underline"
        className="w-full"
      />
    </div>
  )
}
