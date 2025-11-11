'use client'

import Link from 'next/link'
import { useTranslation } from '@tyconsa/bizuit-ui-components'

export default function GettingStartedPage() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-sm text-primary hover:underline mb-4 inline-block">
            ← {t('ui.backToHome')}
          </Link>
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Getting Started
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn how to integrate Bizuit BPM processes into your application in minutes
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
              <div className="font-semibold">NPM Package Documentation</div>
              <div className="text-sm text-muted-foreground">Complete API reference & examples</div>
            </div>
          </a>
          <a
            href="https://github.com/bizuit/form-template"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary transition-colors bg-card"
          >
            <div className="text-3xl">💻</div>
            <div>
              <div className="font-semibold">GitHub Repository</div>
              <div className="text-sm text-muted-foreground">Source code & examples</div>
            </div>
          </a>
        </div>

        {/* Process Flow Diagram */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Process Lifecycle</h2>
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              {/* Start Process */}
              <div className="flex-1 max-w-xs">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 text-center shadow-lg">
                  <div className="text-4xl mb-3">🚀</div>
                  <h3 className="text-xl font-bold mb-2">Start Process</h3>
                  <p className="text-sm opacity-90">Initialize a new workflow instance</p>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Get process parameters</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Fill form with data</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Submit with raiseEvent()</span>
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
                  <h3 className="text-xl font-bold mb-2">Continue Process</h3>
                  <p className="text-sm opacity-90">Update an existing instance</p>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Load instance data</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Update parameters</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    <span>Submit with continueInstance()</span>
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
                  <h3 className="text-xl font-bold mb-2">Complete</h3>
                  <p className="text-sm opacity-90">Process finished successfully</p>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Get results</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Handle output parameters</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Display success message</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start Steps */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Quick Start Guide</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Start Process Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h3 className="text-2xl font-bold">Start a Process</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-green-500">→</span>
                    Get Process Parameters
                  </h4>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const params = await sdk.process
  .getProcessParameters('ProcessName', '', token)`}</pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-green-500">→</span>
                    Render Dynamic Fields
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
                    Submit Process
                  </h4>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const result = await sdk.process.raiseEvent({
  eventName: 'ProcessName',
  parameters: formDataToParameters(formData)
}, undefined, token)`}</pre>
                </div>
              </div>

              <Link
                href="/start-process"
                className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-3 rounded-lg font-semibold transition-colors"
              >
                Try Start Process →
              </Link>
            </div>

            {/* Continue Process Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h3 className="text-2xl font-bold">Continue a Process</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-blue-500">→</span>
                    Load Instance Data
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
                    Filter Parameters
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
                    Submit Changes
                  </h4>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`const result = await sdk.process.continueInstance({
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
                Try Continue Process →
              </Link>
            </div>
          </div>
        </div>

        {/* Implementation Strategies */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Implementation Strategies</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose the approach that best fits your use case. All examples are available in this demo app.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Strategy 1 */}
            <Link
              href="/example-1-dynamic"
              className="group bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                Strategy 1: Dynamic Fields
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Auto-generate form fields from API parameters. Perfect for prototypes and generic forms.
              </p>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>No code changes for new parameters</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Fast development</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">⚠</span>
                  <span>Less UI control</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-primary font-semibold group-hover:underline">
                View Example →
              </div>
            </Link>

            {/* Strategy 2 */}
            <Link
              href="/example-2-manual-all"
              className="group bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="text-3xl mb-3">📝</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                Strategy 2: Manual + Send All
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Custom UI with manual field definitions. Good for simple forms with full control.
              </p>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Full UI control</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Custom validations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">⚠</span>
                  <span>Sends all fields</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-primary font-semibold group-hover:underline">
                View Example →
              </div>
            </Link>

            {/* Strategy 3 */}
            <Link
              href="/example-3-manual-selective"
              className="group bg-card border-2 border-primary rounded-lg p-6 hover:shadow-lg transition-all relative"
            >
              <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                RECOMMENDED
              </div>
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="text-xl font-bold mb-2 text-primary">
                Strategy 3: Selective Mapping
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Full control with selective field sending. Best practice for production apps.
              </p>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Complete control</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Value transformations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Better performance</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-primary font-semibold group-hover:underline">
                View Example →
              </div>
            </Link>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Check out the complete documentation on NPM for detailed API reference, advanced patterns, and troubleshooting guides.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.npmjs.com/package/@tyconsa/bizuit-form-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              📦 View SDK Docs
            </a>
            <a
              href="https://www.npmjs.com/package/@tyconsa/bizuit-ui-components"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              🎨 View UI Components
            </a>
            <Link
              href="/components-demo"
              className="bg-card border border-border px-6 py-3 rounded-lg font-semibold hover:border-primary transition-colors"
            >
              🧪 Try Components Demo
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
