/**
 * Developer Documentation Page
 * Public access - no authentication required
 * Comprehensive guide for junior developers
 * Uses translation system for multilanguage support
 */

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAppTranslation } from '@/lib/useAppTranslation'

export default function DocsPage() {
  const { t, language } = useAppTranslation()
  const [activeSection, setActiveSection] = useState<string>('quickstart')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <div>
                <span className="text-white font-semibold text-lg block">BIZUIT Custom Forms</span>
                <span className="text-slate-400 text-xs">{t('docs.title')}</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="text-slate-400 hover:text-white transition text-sm"
              >
                {t('docs.adminPanel')}
              </Link>
              <Link
                href="/"
                className="text-slate-400 hover:text-white transition text-sm"
              >
                {t('docs.backToHome')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="container mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <nav className="sticky top-24 bg-slate-800/50 rounded-xl border border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">{t('docs.nav.contents')}</h3>
            <ul className="space-y-1">
              <NavItem href="#quickstart" active={activeSection === 'quickstart'} onClick={() => setActiveSection('quickstart')}>
                {t('docs.nav.quickstart')}
              </NavItem>
              <NavItem href="#architecture" active={activeSection === 'architecture'} onClick={() => setActiveSection('architecture')}>
                {t('docs.nav.architecture')}
              </NavItem>
              <NavItem href="#routes" active={activeSection === 'routes'} onClick={() => setActiveSection('routes')}>
                {t('docs.nav.routes')}
              </NavItem>
              <NavItem href="#authentication" active={activeSection === 'authentication'} onClick={() => setActiveSection('authentication')}>
                {t('docs.nav.authentication')}
              </NavItem>
              <NavItem href="#environment" active={activeSection === 'environment'} onClick={() => setActiveSection('environment')}>
                {t('docs.nav.environment')}
              </NavItem>
              <NavItem href="#deployment" active={activeSection === 'deployment'} onClick={() => setActiveSection('deployment')}>
                {t('docs.nav.deployment')}
              </NavItem>
            </ul>
          </nav>
        </aside>

        {/* Main Documentation Content */}
        <main className="flex-1 max-w-4xl">
          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              {t('docs.title')}
            </h1>
            <p className="text-xl text-slate-400">
              {t('docs.subtitle')}
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
              <span>🎯 {t('docs.targetAudience')}</span>
              <span>•</span>
              <span>⏱️ {t('docs.readingTime')}</span>
              <span>•</span>
              <span>📅 {t('docs.updated')}</span>
            </div>
          </div>

          {/* Form Examples Repository Callout - PROMINENT PLACEMENT */}
          <div className="mb-12">
            <InfoBox type="info" title={t('docs.examplesRepo.title')}>
              <div className="text-slate-300">
                <p className="mb-3">
                  {t('docs.examplesRepo.description')}{' '}
                  <a
                    href="https://github.com/TYCON-SA/bizuit-custom-form-sample"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300 underline font-semibold"
                  >
                    {t('docs.examplesRepo.link')}
                  </a>
                  {' '}{t('docs.examplesRepo.onGithub')}
                </p>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-white mb-2">{t('docs.examplesRepo.whatsIncluded')}</p>
                    <ul className="space-y-1">
                      <li>✅ {t('docs.examplesRepo.baseTemplate')} (<code className="text-orange-400">form-template/</code>)</li>
                      <li>✅ {t('docs.examplesRepo.buildScripts')}</li>
                      <li>✅ {t('docs.examplesRepo.fatBundle')}</li>
                      <li>✅ {t('docs.examplesRepo.documentation')}</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-2">{t('docs.examplesRepo.readyFor')}</p>
                    <ul className="space-y-1">
                      <li>🚀 {t('docs.examplesRepo.cicd')}</li>
                      <li>📦 {t('docs.examplesRepo.offlineDeployment')}</li>
                      <li>🔄 {t('docs.examplesRepo.versioning')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </InfoBox>
          </div>

          {/* Architecture Section */}
          <Section id="architecture" title={t('docs.architecture.title')}>
            <p className="text-slate-300 mb-6">
              {t('docs.architecture.description')}
            </p>

            <SubSection title={t('docs.architecture.highLevel')}>
              <CodeBlock language="text">{`┌────────────────┐
│ BIZUIT User    │ 1. Clicks "Open Form"
└────────┬───────┘
         │ 2. Dashboard generates JWT token
         ▼
┌────────────────────────┐
│ Runtime App            │ 3. Validates token
│ /forms/my-form?token=  │ 4. Loads form from DB
└────────┬───────────────┘ 5. Executes form
         │
         ▼
┌────────────────────────┐
│ Backend API            │ • Token validation
│ FastAPI + SQLite       │ • Form storage
└────────────────────────┘ • Version management`}</CodeBlock>
            </SubSection>
          </Section>

          {/* Form Routes & Loaders Section */}
          <Section id="routes" title={t('docs.routes.title')}>
            <p className="text-slate-300 mb-6">
              {t('docs.routes.description')}
            </p>

            <SubSection title={t('docs.routes.comparison')}>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/50 border-b border-slate-700">
                    <tr>
                      <th className="text-left p-3 text-slate-300">Feature</th>
                      <th className="text-left p-3 text-slate-300">/form</th>
                      <th className="text-left p-3 text-slate-300">/formsa</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-400">
                    <tr className="border-b border-slate-800">
                      <td className="p-3 font-semibold text-white">Dashboard token</td>
                      <td className="p-3">Required (prod)<br/>Optional (dev)</td>
                      <td className="p-3">Optional (always)</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-3 font-semibold text-white">ALLOW_DEV_MODE</td>
                      <td className="p-3 text-green-400">✅ Checked</td>
                      <td className="p-3 text-slate-600">❌ Ignored</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-3 font-semibold text-white">Iframe required</td>
                      <td className="p-3 text-slate-600">❌ No</td>
                      <td className="p-3 text-green-400">✅ MUST be iframe</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-3 font-semibold text-white">Origin validation</td>
                      <td className="p-3 text-slate-600">❌ Not validated</td>
                      <td className="p-3 text-green-400">✅ Always validated</td>
                    </tr>
                    <tr className="border-b border-slate-800">
                      <td className="p-3 font-semibold text-white">Direct browser access</td>
                      <td className="p-3 text-green-400">✅ Allowed (dev mode)</td>
                      <td className="p-3 text-red-400">❌ Blocked</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Use case</td>
                      <td className="p-3 text-blue-400">Dashboard forms</td>
                      <td className="p-3 text-purple-400">External embedding</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SubSection>

            <SubSection title={t('docs.routes.standard')}>
              <InfoBox type="info" title={t('docs.routes.purpose')}>
                <p className="text-sm">{t('docs.routes.standardPurpose')}</p>
              </InfoBox>

              <div className="mt-4 space-y-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">{t('docs.routes.securityModel')}:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400">✅</span>
                      <span className="text-slate-300">
                        <strong>Production</strong> (ALLOW_DEV_MODE=false): Requires Dashboard token 's'
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-400">⚠️</span>
                      <span className="text-slate-300">
                        <strong>Development</strong> (ALLOW_DEV_MODE=true): Allows direct access with dev-credentials.js
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">URL Examples:</h4>
                  <CodeBlock language="bash">{`# Production (from Dashboard)
https://server.com/form/my-form?s=aAAV/9xqhAE=&InstanceId=123

# Development (local)
http://localhost:3001/form/my-form
# ← Uses dev-credentials.js`}</CodeBlock>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Parameters Received by Form:</h4>
                  <CodeBlock language="typescript">{`export default function MyForm({ dashboardParams }) {
  const {
    userName,      // "john.doe"
    instanceId,    // "12345"
    eventName,     // "MyProcess"
    activityName,  // "Task1"
    tokenId,       // Internal token ID
    operation,     // 1=edit, 2=view
    apiUrl,        // Dashboard API URL

    // Dev mode only:
    devUsername,   // From dev-credentials.js
    devPassword,   // From dev-credentials.js
    devApiUrl      // From dev-credentials.js
  } = dashboardParams
}`}</CodeBlock>
                </div>
              </div>
            </SubSection>

            <SubSection title="Route 2: /formsa/[formName] (Standalone)">
              <InfoBox type="warning" title="Iframe Only">
                <p className="text-sm">This route ONLY works inside iframes. Direct browser access is blocked.</p>
              </InfoBox>

              <div className="mt-4 space-y-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Security Model:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400">✅</span>
                      <span className="text-slate-300">MUST be loaded inside iframe</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400">✅</span>
                      <span className="text-slate-300">MUST be from allowed origin</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-400">❌</span>
                      <span className="text-slate-300">Direct browser access blocked</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-400">⚠️</span>
                      <span className="text-slate-300">Dashboard token optional</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Configuration:</h4>
                  <CodeBlock language="bash">{`# Allowed origins (comma-separated, supports wildcards)
NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS=https://test.bizuit.com,https://*.example.com

# Allow localhost (development only)
NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME=true`}</CodeBlock>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Embedding Example:</h4>
                  <CodeBlock language="html">{`<!-- External app embedding the form -->
<iframe
  src="https://server.com/formsa/my-form?version=1.0.5"
  width="100%"
  height="800px"
  frameborder="0"
></iframe>

<!-- With Dashboard token (optional) -->
<iframe
  src="https://server.com/formsa/my-form?s=encrypted..."
></iframe>`}</CodeBlock>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Form Must Handle Null Parameters:</h4>
                  <CodeBlock language="typescript">{`export default function MyForm({ dashboardParams }) {
  if (!dashboardParams) {
    // Guest/anonymous mode
    return <GuestModeUI />
  }

  // Authenticated mode
  const { userName, ... } = dashboardParams
}`}</CodeBlock>
                </div>
              </div>
            </SubSection>

            <SubSection title="Query Parameters Supported">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">All Query Parameters:</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <code className="text-orange-400">?version=1.0.5</code>
                    <p className="text-slate-400 mt-1">Load specific version (optional, defaults to currentVersion)</p>
                  </div>
                  <div>
                    <code className="text-orange-400">?s=aAAV/9xqhAE=</code>
                    <p className="text-slate-400 mt-1">Encrypted Dashboard token (TripleDES)</p>
                  </div>
                  <div>
                    <code className="text-orange-400">?InstanceId=12345</code>
                    <p className="text-slate-400 mt-1">Process instance ID (from Dashboard)</p>
                  </div>
                  <div>
                    <code className="text-orange-400">?UserName=john.doe</code>
                    <p className="text-slate-400 mt-1">Authenticated user name</p>
                  </div>
                  <div>
                    <code className="text-orange-400">?eventName=MyProcess</code>
                    <p className="text-slate-400 mt-1">Process name</p>
                  </div>
                  <div>
                    <code className="text-orange-400">?activityName=Task1</code>
                    <p className="text-slate-400 mt-1">Activity name (workflow step)</p>
                  </div>
                  <div>
                    <code className="text-orange-400">?token=Basic123</code>
                    <p className="text-slate-400 mt-1">Additional auth token (legacy support)</p>
                  </div>
                </div>
              </div>
            </SubSection>

            <SubSection title="dashboardParams Object Structure">
              <CodeBlock language="typescript">{`interface DashboardParameters {
  // From Dashboard query string
  instanceId?: string         // Process instance ID
  userName?: string          // Authenticated user
  eventName?: string         // Process name
  activityName?: string      // Activity name
  token?: string             // Additional auth token
  apiUrl?: string           // Dashboard API URL (from config)

  // From backend validation (after 's' token decrypt)
  tokenId?: string          // Internal token ID
  operation?: number        // 1=edit, 2=view
  requesterAddress?: string // IP address
  expirationDate?: string   // Token expiration

  // Dev mode only (ALLOW_DEV_MODE=true)
  devUsername?: string      // From dev-credentials.js
  devPassword?: string      // From dev-credentials.js
  devApiUrl?: string        // From dev-credentials.js
}

// Your form receives this:
<FormComponent dashboardParams={dashboardParams} />`}</CodeBlock>
            </SubSection>
          </Section>

          {/* Authentication Section */}
          <Section id="authentication" title="🔐 Authentication System">
            <p className="text-slate-300 mb-6">
              Forms use JWT tokens from the Dashboard. Dev mode bypasses this for local development.
            </p>

            <SubSection title="Production Flow">
              <div className="space-y-4">
                <Step number={1} title="User in Dashboard clicks 'Open Form'">
                  Dashboard generates JWT token with user context
                </Step>
                <Step number={2} title="Form loads with token in URL">
                  <code className="text-orange-400 text-sm">
                    /forms/my-form?token=eyJhbGc...
                  </code>
                </Step>
                <Step number={3} title="Runtime validates token">
                  Backend API verifies token authenticity
                </Step>
                <Step number={4} title="Form executes with user context">
                  userName, roles, processName available in form
                </Step>
              </div>
            </SubSection>

            <SubSection title="Development Mode">
              <p className="text-slate-300 mb-4">
                For local development, use dev credentials instead of Dashboard tokens:
              </p>
              <CodeBlock language="javascript">{`// dev-credentials.js
export const DEV_CREDENTIALS = {
  username: 'your.email@company.com',
  password: 'YourDashboardPassword',
  apiUrl: 'https://test.bizuit.com/tenantBizuitDashboardapi/api/'
}`}</CodeBlock>

              <InfoBox type="warning" title="Security Warning">
                <ul className="space-y-1 text-sm">
                  <li>⚠️ <code className="text-orange-400">ALLOW_DEV_MODE=true</code> ONLY for local development</li>
                  <li>⚠️ Production MUST have <code className="text-orange-400">ALLOW_DEV_MODE=false</code></li>
                  <li>✅ Server-side variable (different per environment, no rebuild)</li>
                </ul>
              </InfoBox>
            </SubSection>
          </Section>

          {/* Environment Configuration Section */}
          <Section id="environment" title="🔧 Environment Configuration">
            <p className="text-slate-300 mb-6">
              Next.js has two types of environment variables with different behaviors.
            </p>

            <SubSection title="Build-Time vs Server-Side">
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-400 font-semibold mb-2">Build-Time (NEXT_PUBLIC_*)</h4>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>✅ Client-side accessible</li>
                    <li>⚠️ Baked into JavaScript</li>
                    <li>🔄 Rebuild required on change</li>
                  </ul>
                  <CodeBlock language="typescript" className="mt-3">{`const url = process.env.NEXT_PUBLIC_API_URL`}</CodeBlock>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <h4 className="text-purple-400 font-semibold mb-2">Server-Side (no prefix)</h4>
                  <ul className="space-y-1 text-sm text-slate-300">
                    <li>✅ Server-only access</li>
                    <li>✅ Runtime changeable</li>
                    <li>🔄 Restart only (no rebuild)</li>
                  </ul>
                  <CodeBlock language="typescript" className="mt-3">{`const url = process.env.FASTAPI_URL`}</CodeBlock>
                </div>
              </div>
            </SubSection>

            <SubSection title="Complete .env.local Reference">
              <CodeBlock language="bash">{`# =============================================================================
# BIZUIT Dashboard API
# =============================================================================
# Build-time variable - accessible in client code
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=/api/bizuit
# Production: https://test.bizuit.com/tenantBizuitDashboardapi/api

# HTTP timeout (milliseconds)
NEXT_PUBLIC_BIZUIT_TIMEOUT=30000

# =============================================================================
# Backend FastAPI
# =============================================================================
# Server-side only - NOT exposed to client
FASTAPI_URL=http://127.0.0.1:8000

# =============================================================================
# Development Mode - CRITICAL SECURITY
# =============================================================================
# Allow forms without Dashboard token
# Server-side variable - can differ per deployment
#
# DEVELOPMENT: true  → Uses dev-credentials.js
# PRODUCTION:  false → Requires Dashboard token
#
ALLOW_DEV_MODE=true

# =============================================================================
# Deployment Configuration
# =============================================================================
# Base path for subdirectory deployment
# Local: Leave commented out
# Production: /BIZUITCustomForms
# NEXT_PUBLIC_BASE_PATH=/BIZUITCustomForms

# Admin session timeout (minutes)
NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES=30

# =============================================================================
# Iframe Security (Standalone Forms)
# =============================================================================
# Allowed origins for iframe embedding
NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS=https://test.bizuit.com

# Allow localhost for dev iframe testing
NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME=true

# Webhook secret for GitHub Actions
# Generate: openssl rand -hex 32
WEBHOOK_SECRET=your-webhook-secret-here`}</CodeBlock>

              <InfoBox type="info" title="Remember">
                <ul className="space-y-1 text-sm">
                  <li>🔄 Changed <code className="text-orange-400">NEXT_PUBLIC_*</code>? → <strong>Rebuild</strong></li>
                  <li>🔄 Changed server variable? → <strong>Restart</strong> only</li>
                </ul>
              </InfoBox>
            </SubSection>

            <SubSection title="Environment Variables Reference Table">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/50 border-b border-slate-700">
                    <tr>
                      <th className="text-left p-3 text-slate-300">Variable</th>
                      <th className="text-left p-3 text-slate-300">Type</th>
                      <th className="text-center p-3 text-slate-300">Rebuild?</th>
                      <th className="text-left p-3 text-slate-300">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-400">
                    <EnvVarRow
                      name="NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL"
                      type="Build-time"
                      rebuild={true}
                      purpose="Dashboard API base URL"
                    />
                    <EnvVarRow
                      name="NEXT_PUBLIC_BASE_PATH"
                      type="Build-time"
                      rebuild={true}
                      purpose="Deployment subdirectory path"
                    />
                    <EnvVarRow
                      name="FASTAPI_URL"
                      type="Server-side"
                      rebuild={false}
                      purpose="Backend API internal URL"
                    />
                    <EnvVarRow
                      name="ALLOW_DEV_MODE"
                      type="Server-side"
                      rebuild={false}
                      purpose="Enable dev credentials"
                      critical={true}
                    />
                    <EnvVarRow
                      name="WEBHOOK_SECRET"
                      type="Server-side"
                      rebuild={false}
                      purpose="GitHub webhook authentication"
                    />
                  </tbody>
                </table>
              </div>
            </SubSection>
          </Section>

          {/* Deployment Section */}
          <Section id="deployment" title="📦 Deployment Process">
            <p className="text-slate-300 mb-6">
              Automated deployment via GitHub Actions with semantic versioning.
            </p>

            <SubSection title={t('docs.deployment.deploymentFlow')}>
              <CodeBlock language="text">{`Local Development
      ↓
 Git Commit
      ↓
 Push to main
      ↓
CI/CD (GitHub Actions or Azure DevOps)
      ↓
  ✅ Detects changed forms
  ✅ Builds each form
  ✅ Creates deployment ZIP
  ✅ Uploads to Artifacts
      ↓
Download from Artifacts
      ↓
Upload to Admin Panel
      ↓
  Production! 🎉`}</CodeBlock>
            </SubSection>

            <SubSection title={t('docs.deployment.versioning')}>
              <p className="text-slate-300 mb-4">
                {t('docs.deployment.versioningDescription')}
              </p>
            </SubSection>

            <SubSection title="Download Artifact">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Option A: GitHub Actions</h4>
                  <CodeBlock language="bash">{`# Via web UI
# Actions → Latest run → Artifacts

# Via CLI
gh run list --limit 1
gh run download <run-id>`}</CodeBlock>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Option B: Repository</h4>
                  <CodeBlock language="bash">{`# Pull latest
git pull origin main

# ZIP already committed
ls bizuit-custom-form-sample/my-form/upload/*.zip`}</CodeBlock>
                </div>
              </div>
            </SubSection>
          </Section>

          {/* Resources */}
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            <ResourceLink
              href="http://localhost:8000/docs"
              icon="📡"
              title={t('docs.resources.backendApi')}
              description={t('docs.resources.backendDesc')}
              external
              newTabText={t('docs.resources.newTab')}
            />
            <ResourceLink
              href="http://localhost:3000"
              icon="🎨"
              title={t('docs.resources.showcase')}
              description={t('docs.resources.showcaseDesc')}
              external
              newTabText={t('docs.resources.newTab')}
            />
            <ResourceLink
              href="/admin"
              icon="⚙️"
              title={t('docs.resources.admin')}
              description={t('docs.resources.adminDesc')}
            />
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-slate-700 text-center">
            <p className="text-slate-400">
              {t('docs.footer.help')}{' '}
              <a href="https://github.com/your-org/your-repo" className="text-orange-400 hover:text-orange-300">
                {t('docs.footer.repository')}
              </a>{' '}
              {t('docs.footer.orAsk')}
            </p>
            <p className="text-slate-500 mt-2 text-sm">{t('docs.footer.happyCoding')} 🚀</p>
          </div>
        </main>
      </div>
    </div>
  )
}

// Components
function NavItem({ href, active, onClick, children }: { href: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        onClick={onClick}
        className={`block px-3 py-2 rounded-lg text-sm transition ${
          active
            ? 'bg-orange-500/20 text-orange-400 font-medium'
            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        {children}
      </a>
    </li>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <h2 className="text-3xl font-bold text-white mb-6 pb-2 border-b border-slate-700">
        {title}
      </h2>
      {children}
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  )
}

function CodeBlock({ language, children, className = '' }: { language?: string; children: string; className?: string }) {
  return (
    <div className={`bg-slate-950 rounded-lg border border-slate-700 overflow-hidden ${className}`}>
      {language && (
        <div className="bg-slate-900 border-b border-slate-700 px-4 py-2">
          <span className="text-xs text-slate-500 uppercase font-mono">{language}</span>
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-slate-300 font-mono">{children}</code>
      </pre>
    </div>
  )
}

function InfoBox({
  type,
  title,
  children,
  className = '',
}: {
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  className?: string
}) {
  const styles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    success: 'bg-green-500/10 border-green-500/30 text-green-300',
    warning: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
    error: 'bg-red-500/10 border-red-500/30 text-red-300',
  }

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  }

  return (
    <div className={`border rounded-lg p-4 ${styles[type]} ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icons[type]}</span>
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-2">{title}</h4>}
          <div className="text-slate-300">{children}</div>
        </div>
      </div>
    </div>
  )
}

function Step({ number, title, children }: { number: number; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="text-white font-semibold mb-2">{title}</h4>
        {children && <div className="text-slate-400">{children}</div>}
      </div>
    </div>
  )
}

function EnvVarRow({
  name,
  type,
  rebuild,
  purpose,
  critical,
}: {
  name: string
  type: string
  rebuild: boolean
  purpose: string
  critical?: boolean
}) {
  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/30">
      <td className="p-3">
        <code className={`text-sm ${critical ? 'text-orange-400 font-semibold' : 'text-slate-300'}`}>
          {name}
        </code>
      </td>
      <td className="p-3">
        <span className={`text-xs px-2 py-1 rounded ${type === 'Build-time' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
          {type}
        </span>
      </td>
      <td className="p-3 text-center">
        {rebuild ? <span className="text-orange-400">✅</span> : <span className="text-slate-600">❌</span>}
      </td>
      <td className="p-3">{purpose}</td>
    </tr>
  )
}

function ResourceLink({
  href,
  icon,
  title,
  description,
  external,
  newTabText,
}: {
  href: string
  icon: string
  title: string
  description: string
  external?: boolean
  newTabText?: string
}) {
  const Component = external ? 'a' : Link
  const props = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <Component
      href={href}
      {...props}
      className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-orange-500 transition group"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition">
        {title}
      </h3>
      <p className="text-sm text-slate-400 mt-2">{description}</p>
      {external && <span className="text-xs text-slate-500 mt-1 block">{newTabText || 'Opens in new tab'} ↗</span>}
    </Component>
  )
}
