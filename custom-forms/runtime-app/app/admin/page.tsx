'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Upload, Clock, Database, TrendingUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface DashboardStats {
  totalForms: number
  recentUpdates: number
  totalSize: number
  avgFormSize: number
}

interface RecentForm {
  name: string
  version: string
  publishedAt: string
  sizeKb: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentForms, setRecentForms] = useState<RecentForm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener forms desde el backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/custom-forms`)

      if (!response.ok) {
        throw new Error('Error al cargar los forms')
      }

      const forms = await response.json()

      // Convertir sizeBytes a sizeKb para todos los forms
      const formsWithKb = forms.map((f: any) => ({
        ...f,
        name: f.formName,
        displayName: f.description?.split(' para ')[0] || f.formName,
        version: f.currentVersion,
        sizeKb: (f.sizeBytes || 0) / 1024
      }))

      // Calcular estadísticas
      const totalForms = formsWithKb.length
      const totalSize = formsWithKb.reduce((sum: number, f: any) => sum + f.sizeKb, 0)
      const avgFormSize = totalForms > 0 ? totalSize / totalForms : 0

      // Forms actualizados en los últimos 7 días
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentUpdates = formsWithKb.filter((f: any) =>
        new Date(f.publishedAt) > sevenDaysAgo
      ).length

      setStats({
        totalForms,
        recentUpdates,
        totalSize,
        avgFormSize,
      })

      // Obtener los 5 forms más recientes
      const sortedForms = [...formsWithKb]
        .sort((a: any, b: any) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        )
        .slice(0, 5)

      setRecentForms(sortedForms)
    } catch (err: any) {
      console.error('Error loading dashboard:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatSize = (kb: number) => {
    if (kb < 1024) return `${kb.toFixed(0)} KB`
    return `${(kb / 1024).toFixed(2)} MB`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
              Error al cargar el dashboard
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Vista general del sistema de Custom Forms
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Forms */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-primary">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            Total Forms
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {stats?.totalForms || 0}
          </p>
        </div>

        {/* Recent Updates */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <CheckCircle className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            Actualizaciones (7d)
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {stats?.recentUpdates || 0}
          </p>
        </div>

        {/* Total Size */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-green-500" />
            </div>
            <Database className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            Espacio Total
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatSize(stats?.totalSize || 0)}
          </p>
        </div>

        {/* Average Form Size */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-amber-500" />
            </div>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            Tamaño Promedio
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatSize(stats?.avgFormSize || 0)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/upload-forms"
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-primary"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
              <Upload className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                Upload Forms
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Subir paquete de deployment
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/forms"
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                Gestionar Forms
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ver y administrar formularios
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Forms */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Formularios Recientes
          </h2>
          <Link
            href="/admin/forms"
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            Ver todos →
          </Link>
        </div>

        {recentForms.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">
              No hay formularios registrados
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentForms.map((form, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                      {form.displayName || form.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Proceso: {form.processName || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    v{form.version}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {formatSize(form.sizeKb || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
