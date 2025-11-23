/**
 * Developer Documentation Page
 * Public access - no authentication required
 */

import Link from 'next/link'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-white font-semibold text-lg">BIZUIT Custom Forms</span>
            </Link>
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Developer Documentation
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Everything you need to develop, test, and deploy custom forms for BIZUIT BPM
          </p>
        </div>

        {/* Quick Start Card */}
        <div className="max-w-5xl mx-auto bg-slate-800/50 rounded-2xl border border-slate-700 p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <span className="text-3xl">🚀</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Quick Start</h2>
              <p className="text-slate-400">Get up and running in 5 minutes</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Prerequisites */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">📋 Prerequisites</h3>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Node.js 18+ and npm</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Python 3.10+ (for backend API)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Git and GitHub account</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Installation */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">⚙️ Installation</h3>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <pre className="text-sm text-slate-300 overflow-x-auto">
                  <code>{`# Clone the repository
git clone <repo-url>
cd custom-forms

# Install dependencies
npm install

# Setup forms-examples submodule
git submodule init
git submodule update

# Start all services (automated)
./start-all.sh`}</code>
                </pre>
              </div>
              <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 font-medium">✨ That's it! You now have:</p>
                <ul className="mt-2 space-y-1 text-slate-300 ml-4">
                  <li>• Backend API on <code className="text-orange-400">http://localhost:8000</code></li>
                  <li>• Showcase on <code className="text-orange-400">http://localhost:3000</code></li>
                  <li>• Runtime on <code className="text-orange-400">http://localhost:3001</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Core Concepts Grid */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Core Concepts</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Authentication */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-orange-500/50 transition">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">🔐</span>
                <h3 className="text-xl font-semibold text-white">Authentication</h3>
              </div>
              <p className="text-slate-400 mb-4">
                Token-based authentication with development and production modes
              </p>
              <div className="space-y-3">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-sm font-mono text-orange-400 mb-2">Production</p>
                  <p className="text-sm text-slate-300">JWT token from Dashboard required</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-sm font-mono text-green-400 mb-2">Development</p>
                  <p className="text-sm text-slate-300">Dev credentials for local testing</p>
                  <pre className="mt-2 text-xs text-slate-400 overflow-x-auto">
                    <code>NEXT_PUBLIC_ALLOW_DEV_MODE=true</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Environment Variables */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-orange-500/50 transition">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">🔧</span>
                <h3 className="text-xl font-semibold text-white">Environment Config</h3>
              </div>
              <p className="text-slate-400 mb-4">
                Two types of environment variables with different behaviors
              </p>
              <div className="space-y-3">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-sm font-mono text-blue-400 mb-2">Build-Time</p>
                  <p className="text-sm text-slate-300 mb-2">NEXT_PUBLIC_* variables</p>
                  <p className="text-xs text-slate-400">Baked into JS, rebuild required</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-sm font-mono text-purple-400 mb-2">Server-Side</p>
                  <p className="text-sm text-slate-300 mb-2">No prefix</p>
                  <p className="text-xs text-slate-400">Runtime, restart required</p>
                </div>
              </div>
            </div>

            {/* Development Modes */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-orange-500/50 transition">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">💻</span>
                <h3 className="text-xl font-semibold text-white">Development Modes</h3>
              </div>
              <p className="text-slate-400 mb-4">
                Two workflows for different development scenarios
              </p>
              <div className="space-y-3">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-green-400 mb-2">Full Stack</p>
                  <p className="text-sm text-slate-300 mb-1">Backend + Frontend</p>
                  <p className="text-xs text-slate-400">For form functionality development</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-orange-400 mb-2">Fat Bundle</p>
                  <p className="text-sm text-slate-300 mb-1">Standalone dev.html</p>
                  <p className="text-xs text-slate-400">For quick UI iterations</p>
                </div>
              </div>
            </div>

            {/* Testing */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-orange-500/50 transition">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">🧪</span>
                <h3 className="text-xl font-semibold text-white">Testing Your Form</h3>
              </div>
              <p className="text-slate-400 mb-4">
                Multiple testing approaches for different stages
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <span className="text-green-400">✓</span>
                  <span>Local: <code className="text-orange-400">localhost:8080/dev.html</code></span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <span className="text-green-400">✓</span>
                  <span>Runtime: <code className="text-orange-400">localhost:3001/forms/my-form</code></span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <span className="text-green-400">✓</span>
                  <span>Production: Upload ZIP via admin panel</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Development Workflows */}
        <div className="max-w-5xl mx-auto bg-slate-800/50 rounded-2xl border border-slate-700 p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Development Workflows</h2>

          <div className="space-y-8">
            {/* Workflow 1 */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <span className="text-2xl">🔄</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Option 1: Full Stack Development</h3>
                  <p className="text-sm text-slate-400">Recommended for form functionality</p>
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <pre className="text-sm text-slate-300 overflow-x-auto">
                  <code>{`# Terminal 1: Start all services
./start-all.sh

# Terminal 2: View logs
tail -f logs/backend-api.log
tail -f logs/runtime-app.log

# Test your form
open http://localhost:3001/forms/my-form`}</code>
                </pre>
              </div>
            </div>

            {/* Workflow 2 */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Option 2: Fast Development (Fat Bundle)</h3>
                  <p className="text-sm text-slate-400">For UI-only iterations</p>
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <pre className="text-sm text-slate-300 overflow-x-auto">
                  <code>{`# Terminal 1: Build fat bundle
cd forms-examples/my-form
npm run build

# Terminal 2: Serve via HTTP
cd dist
python3 -m http.server 8080

# Terminal 3: Open dev.html
open http://localhost:8080/dev.html`}</code>
                </pre>
              </div>
              <div className="mt-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-blue-300">
                  <strong>Fat Bundle:</strong> Self-contained JavaScript with React, UI libs, and your form code. Perfect for quick UI testing!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Testing on Port 3001 */}
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-8 mb-8">
          <div className="flex items-start space-x-4 mb-4">
            <span className="text-4xl">⚠️</span>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Important: Testing on Port 3001</h2>
              <p className="text-slate-300">
                Port 3001 loads forms <strong>from the database</strong>, not from your local filesystem
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Requirements:</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="text-orange-400 mt-0.5">1.</span>
                  <span>Form must be <strong>built</strong> and packaged as ZIP</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-400 mt-0.5">2.</span>
                  <span>ZIP must be <strong>uploaded</strong> via admin panel</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-400 mt-0.5">3.</span>
                  <span>Form must exist in <code className="text-orange-400">CustomForms</code> table</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-400 mt-0.5">4.</span>
                  <span>Backend API must be running on port 8000</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Upload Process:</h3>
              <pre className="text-sm text-slate-300 overflow-x-auto">
                <code>{`# 1. Build your form
cd forms-examples/my-form
npm run build

# 2. Get latest ZIP from upload/
cd upload
ls -t *.zip | head -1  # Latest ZIP

# 3. Go to admin panel
open http://localhost:3001/admin

# 4. Upload ZIP and test
open http://localhost:3001/forms/my-form`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Deployment */}
        <div className="max-w-5xl mx-auto bg-slate-800/50 rounded-2xl border border-slate-700 p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Deployment Process</h2>

          <div className="space-y-6">
            {/* GitHub Workflow */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">🤖</span>
                <h3 className="text-xl font-semibold text-white">Automatic (GitHub Actions)</h3>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
                <p className="text-slate-300">
                  <strong>Triggers:</strong> Push to <code className="text-orange-400">main</code> branch with changes in <code className="text-orange-400">forms-examples/*/src/**</code>
                </p>
                <div className="border-l-4 border-green-500 pl-4 space-y-2 text-sm text-slate-300">
                  <p>✅ Detects changed forms</p>
                  <p>✅ Builds each form independently</p>
                  <p>✅ Bumps version (semantic versioning)</p>
                  <p>✅ Creates deployment ZIP</p>
                  <p>✅ Uploads to GitHub Actions artifacts</p>
                  <p>✅ Commits ZIP to repo</p>
                  <p>✅ Creates git tag (e.g., <code className="text-orange-400">my-form-v1.0.5</code>)</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mt-3">
                  <p className="text-sm text-blue-300">
                    <strong>Download:</strong> Go to <strong>Actions</strong> → Latest run → <strong>Artifacts</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Manual */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">✋</span>
                <h3 className="text-xl font-semibold text-white">Manual Deployment</h3>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <pre className="text-sm text-slate-300 overflow-x-auto">
                  <code>{`# Build and package
cd forms-examples/my-form
npm run build

# Create ZIP
cd dist
zip -r ../my-form-deployment.zip .

# Upload via admin panel
# http://localhost:3001/admin/upload-forms`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="max-w-5xl mx-auto bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
          <h2 className="text-3xl font-bold text-white mb-6">🐛 Troubleshooting</h2>

          <div className="space-y-6">
            {/* Port in use */}
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Port Already in Use</h3>
              <pre className="text-sm text-slate-300 overflow-x-auto">
                <code>{`# Kill processes
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Showcase
lsof -ti:3001 | xargs kill -9  # Runtime

# Or use automation
./stop-all.sh && ./start-all.sh`}</code>
              </pre>
            </div>

            {/* Form not loading */}
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Form Not Loading on Port 3001</h3>
              <p className="text-slate-300 mb-3">
                <strong>Error:</strong> "Form not found" or blank page
              </p>
              <div className="space-y-2 text-sm text-slate-400">
                <p><strong>Solution:</strong></p>
                <ol className="list-decimal ml-6 space-y-1">
                  <li>Check backend is running: <code className="text-orange-400">http://localhost:8000/docs</code></li>
                  <li>Upload form via admin panel</li>
                  <li>Verify in database: <code className="text-orange-400">SELECT FormName FROM CustomForms</code></li>
                </ol>
              </div>
            </div>

            {/* Token validation */}
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Token Validation Failed</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-slate-300 mb-1">Development mode:</p>
                  <pre className="text-xs text-slate-400">
                    <code>NEXT_PUBLIC_ALLOW_DEV_MODE=true</code>
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-300 mb-1">Production mode:</p>
                  <p className="text-xs text-slate-400">Use real Dashboard token in URL</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="max-w-5xl mx-auto mt-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">📚 Additional Resources</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-orange-500 transition group"
            >
              <div className="text-3xl mb-3">📡</div>
              <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition">Backend API Docs</h3>
              <p className="text-sm text-slate-400 mt-2">FastAPI Swagger UI</p>
            </a>
            <a
              href="http://localhost:3000"
              target="_blank"
              className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-orange-500 transition group"
            >
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition">Showcase Examples</h3>
              <p className="text-sm text-slate-400 mt-2">Live form demonstrations</p>
            </a>
            <Link
              href="/admin"
              className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-orange-500 transition group"
            >
              <div className="text-3xl mb-3">⚙️</div>
              <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition">Admin Panel</h3>
              <p className="text-sm text-slate-400 mt-2">Upload and manage forms</p>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-5xl mx-auto mt-16 pt-8 border-t border-slate-700 text-center">
          <p className="text-slate-400">
            Need help? Check the <Link href="/" className="text-orange-400 hover:text-orange-300">main documentation</Link> or ask the team!
          </p>
          <p className="text-slate-500 mt-2 text-sm">
            Happy coding! 🚀
          </p>
        </div>
      </main>
    </div>
  )
}
