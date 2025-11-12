import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Bizuit Custom Forms
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Runtime para formularios dinámicos con hot reload
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <FeatureCard
              icon="🔄"
              title="Hot Reload"
              description="Detección automática de nuevas versiones cada 10 segundos"
            />
            <FeatureCard
              icon="📦"
              title="Versionado"
              description="Control de versiones con historial completo"
            />
            <FeatureCard
              icon="🎯"
              title="Form Registry"
              description="Registro centralizado con metadata de forms"
            />
            <FeatureCard
              icon="⚡"
              title="Dynamic Loading"
              description="Carga dinámica de formularios configurables"
            />
          </div>

          {/* CTA */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Ver Formularios Disponibles
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Explora la lista completa de formularios dinámicos registrados en el sistema
            </p>
            <Link
              href="/forms"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Ver Formularios
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex gap-3">
              <div className="text-2xl">ℹ️</div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Servidor de Desarrollo
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  Este runtime app está configurado para correr en el puerto <strong>3001</strong> para no
                  conflictuar con el proyecto de ejemplo que corre en el puerto 3000.
                </p>
              </div>
            </div>
          </div>

          {/* Documentation Links */}
          <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            <p className="mb-2">Documentación:</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <a
                href="https://github.com/tyconsa/bizuit-custom-forms"
                className="hover:text-blue-600 dark:hover:text-blue-400 underline"
              >
                README Principal
              </a>
              <span>•</span>
              <a
                href="/docs/DYNAMIC_FORMS.md"
                className="hover:text-blue-600 dark:hover:text-blue-400 underline"
              >
                Estado del Sistema
              </a>
              <span>•</span>
              <a
                href="/docs/HOT_RELOAD.md"
                className="hover:text-blue-600 dark:hover:text-blue-400 underline"
              >
                Hot Reload
              </a>
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
