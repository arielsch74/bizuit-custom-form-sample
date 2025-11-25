'use client'

import Link from 'next/link'
import { useTranslation } from '@tyconsa/bizuit-ui-components'
import { useAppTranslation } from '@/lib/useAppTranslation'

export default function GettingStartedPage() {
  const { t: tBase } = useTranslation() // For 'ui.backToHome'
  const { t } = useAppTranslation() // For app-specific translations

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-sm text-primary hover:underline mb-4 inline-block">
            {tBase('ui.backToHome')}
          </Link>
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            {t('gettingStarted.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('gettingStarted.subtitle')}
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-4 mb-16">
          <a
            href="https://www.npmjs.com/package/@tyconsa/bizuit-form-sdk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary transition-colors bg-card"
          >
            <div className="text-3xl">📦</div>
            <div>
              <div className="font-semibold">{t('gettingStarted.npmDocs')}</div>
              <div className="text-sm text-muted-foreground">{t('gettingStarted.npmDocs.description')}</div>
            </div>
          </a>
          <a
            href="https://github.com/TYCON-SA/bizuit-custom-form-sample"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary transition-colors bg-card"
          >
            <div className="text-3xl">💻</div>
            <div>
              <div className="font-semibold">{t('gettingStarted.github')}</div>
              <div className="text-sm text-muted-foreground">{t('gettingStarted.github.description')}</div>
            </div>
          </a>
        </div>

        {/* Process Flow Diagram */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">{t('gettingStarted.processLifecycle')}</h2>
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              {/* Start Process */}
              <div className="flex-1 max-w-xs">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 text-center shadow-lg">
                  <div className="text-4xl mb-3">🚀</div>
                  <h3 className="text-xl font-bold mb-2">{t('gettingStarted.startProcess.title')}</h3>
                  <p className="text-sm opacity-90">{t('gettingStarted.startProcess.description')}</p>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>{t('gettingStarted.startProcess.step1')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>{t('gettingStarted.startProcess.step2')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>{t('gettingStarted.startProcess.step3')}</span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:block text-4xl text-muted-foreground">→</div>
              <div className="md:hidden text-4xl text-muted-foreground rotate-90">→</div>

              {/* Continue Process */}
              <div className="flex-1 max-w-xs">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 text-center shadow-lg">
                  <div className="text-4xl mb-3">⏭️</div>
                  <h3 className="text-xl font-bold mb-2">{t('gettingStarted.continueProcess.title')}</h3>
                  <p className="text-sm opacity-90">{t('gettingStarted.continueProcess.description')}</p>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>{t('gettingStarted.continueProcess.step1')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>{t('gettingStarted.continueProcess.step2')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>{t('gettingStarted.continueProcess.step3')}</span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:block text-4xl text-muted-foreground">→</div>
              <div className="md:hidden text-4xl text-muted-foreground rotate-90">→</div>

              {/* Complete */}
              <div className="flex-1 max-w-xs">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 text-center shadow-lg">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="text-xl font-bold mb-2">{t('gettingStarted.complete.title')}</h3>
                  <p className="text-sm opacity-90">{t('gettingStarted.complete.description')}</p>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>{t('gettingStarted.complete.step1')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>{t('gettingStarted.complete.step2')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>{t('gettingStarted.complete.step3')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start Steps */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">{t('gettingStarted.quickStart')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Start Process Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h3 className="text-2xl font-bold">{t('gettingStarted.quickStart.start.title')}</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-green-500">→</span>
                    {t('gettingStarted.quickStart.start.step1')}
                  </h4>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const params = await sdk.process
  .getParameters('ProcessName', '', token)`}</pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-green-500">→</span>
                    {t('gettingStarted.quickStart.start.step2')}
                  </h4>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{params.map(param => (
  <DynamicFormField
    parameter={param}
    value={formData[param.name]}
    onChange={(val) => setFormData({...formData, [param.name]: val})}
  />
))}`}</pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-green-500">→</span>
                    {t('gettingStarted.quickStart.start.step3')}
                  </h4>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const result = await sdk.process.start({
  processName: 'ProcessName',
  parameters: formDataToParameters(formData)
}, undefined, token)`}</pre>
                </div>
              </div>

              <Link
                href="/start-process"
                className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-3 rounded-lg font-semibold transition-colors"
              >
                {t('gettingStarted.quickStart.start.cta')}
              </Link>
            </div>

            {/* Continue Process Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h3 className="text-2xl font-bold">{t('gettingStarted.quickStart.continue.title')}</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-blue-500">→</span>
                    {t('gettingStarted.quickStart.continue.step1')}
                  </h4>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const result = await loadInstanceDataForContinue(
  sdk, instanceId, token
)
setFormData(result.formData)`}</pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-blue-500">→</span>
                    {t('gettingStarted.quickStart.continue.step2')}
                  </h4>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// Only send editable parameters
const filteredData = {}
processParameters.forEach(param => {
  if (formData[param.name] !== undefined) {
    filteredData[param.name] = formData[param.name]
  }
})`}</pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-blue-500">→</span>
                    {t('gettingStarted.quickStart.continue.step3')}
                  </h4>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const result = await sdk.process.continue({
  instanceId,
  eventName,
  parameters: formDataToParameters(filteredData)
}, undefined, token)`}</pre>
                </div>
              </div>

              <Link
                href="/continue-process"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-lg font-semibold transition-colors"
              >
                {t('gettingStarted.quickStart.continue.cta')}
              </Link>
            </div>
          </div>
        </div>

        {/* Implementation Strategies */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">{t('gettingStarted.strategies.title')}</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('gettingStarted.strategies.description')}
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Strategy 1 */}
            <Link
              href="/example-1-dynamic"
              className="group bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {t('gettingStarted.strategy1.title')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('gettingStarted.strategy1.description')}
              </p>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{t('gettingStarted.strategy1.pro1')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{t('gettingStarted.strategy1.pro2')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">⚠</span>
                  <span>{t('gettingStarted.strategy1.con1')}</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-primary font-semibold group-hover:underline">
                {t('gettingStarted.strategy1.cta')}
              </div>
            </Link>

            {/* Strategy 2 */}
            <Link
              href="/example-2-manual-all"
              className="group bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="text-3xl mb-3">📝</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {t('gettingStarted.strategy2.title')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('gettingStarted.strategy2.description')}
              </p>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{t('gettingStarted.strategy2.pro1')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{t('gettingStarted.strategy2.pro2')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">⚠</span>
                  <span>{t('gettingStarted.strategy2.con1')}</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-primary font-semibold group-hover:underline">
                {t('gettingStarted.strategy2.cta')}
              </div>
            </Link>

            {/* Strategy 3 */}
            <Link
              href="/example-3-manual-selective"
              className="group bg-card border-2 border-primary rounded-lg p-6 hover:shadow-lg transition-all relative"
            >
              <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                {t('gettingStarted.strategy3.badge')}
              </div>
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="text-xl font-bold mb-2 text-primary">
                {t('gettingStarted.strategy3.title')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('gettingStarted.strategy3.description')}
              </p>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{t('gettingStarted.strategy3.pro1')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{t('gettingStarted.strategy3.pro2')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>{t('gettingStarted.strategy3.pro3')}</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-primary font-semibold group-hover:underline">
                {t('gettingStarted.strategy3.cta')}
              </div>
            </Link>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('gettingStarted.help.title')}</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {t('gettingStarted.help.description')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.npmjs.com/package/@tyconsa/bizuit-form-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              {t('gettingStarted.help.sdkDocs')}
            </a>
            <a
              href="https://www.npmjs.com/package/@tyconsa/bizuit-ui-components"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              {t('gettingStarted.help.uiDocs')}
            </a>
            <Link
              href="/components-demo"
              className="bg-card border border-border px-6 py-3 rounded-lg font-semibold hover:border-primary transition-colors"
            >
              {t('gettingStarted.help.demo')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
