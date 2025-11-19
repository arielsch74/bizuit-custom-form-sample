'use client'

import Link from 'next/link'
import { SettingsToolbar } from '@/components/settings-toolbar'

export default function HomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
      <SettingsToolbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6">
              <span className="text-white font-bold text-4xl">B</span>
            </div>
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
              BIZUIT Custom Forms
            </h1>
            <p className="text-xl text-slate-700 dark:text-slate-300">
              Sistema de formularios dinámicos para BIZUIT BPM
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
              title="Carga Dinámica"
              description="Formularios cargados a demanda desde BIZUIT"
            />
          </div>

          {/* Admin CTA */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Panel de Administración
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Accede al panel de administración para gestionar formularios, subir deployments y ver estadísticas
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Ir al Admin
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
                  ¿Cómo funciona?
                </h3>
                <p className="text-orange-800 dark:text-orange-200 text-sm">
                  Los formularios se cargan dinámicamente cuando BIZUIT los solicita mediante tokens de seguridad.
                  No es necesario navegar manualmente a los formularios - BIZUIT los abrirá automáticamente en
                  <strong> /form/[nombre-formulario]</strong> cuando sea necesario.
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
                className="hover:text-primary dark:hover:text-primary underline"
              >
                GitHub
              </a>
              <span>•</span>
              <Link
                href="/admin"
                className="hover:text-primary dark:hover:text-primary underline"
              >
                Panel Admin
              </Link>
              <span>•</span>
              <a
                href={`${apiUrl}/docs`}
                className="hover:text-primary dark:hover:text-primary underline"
              >
                API Docs
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
