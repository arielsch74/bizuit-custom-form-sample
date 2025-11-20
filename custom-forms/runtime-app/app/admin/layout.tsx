'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Upload, FileText, LogOut, User, Menu, X } from 'lucide-react'
import { SettingsToolbar } from '@/components/settings-toolbar'
import { useAppTranslation } from '@/lib/useAppTranslation'
import { apiFetch } from '@/lib/api-client'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t } = useAppTranslation()
  const backendApiUrl = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    // Verificar autenticación (excepto en la página de login)
    // Normalizar pathname removiendo barra final para comparación
    const normalizedPath = pathname?.replace(/\/$/, '') || ''

    if (normalizedPath !== '/admin/login') {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [pathname, router])

  const checkAuth = async () => {
    try {
      // Use apiFetch to ensure basePath is added (Next.js doesn't add it for client fetch)
      const response = await apiFetch('/api/auth/session', {
        credentials: 'include', // Include cookies
      })

      if (!response.ok) {
        router.push('/admin/login')
        setLoading(false)
        return
      }

      const data = await response.json()

      if (data.authenticated) {
        setUser(data.user)
        setLoading(false)
      } else {
        router.push('/admin/login')
        setLoading(false)
      }
    } catch (error) {
      router.push('/admin/login')
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      // Use apiFetch to ensure basePath is added (Next.js doesn't add it for client fetch)
      await apiFetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }

    // Delete cookies client-side (IIS compatibility)
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/'
    document.cookie = `admin_token=; path=${basePath}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    document.cookie = `admin_user_data=; path=${basePath}; expires=Thu, 01 Jan 1970 00:00:00 GMT`

    router.push('/')
  }

  // Si estamos en login, no mostrar el layout
  // Normalizar pathname removiendo barra final para comparación
  const normalizedPath = pathname?.replace(/\/$/, '') || ''

  if (normalizedPath === '/admin/login') {
    return <>{children}</>
  }

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario después de verificar, no mostrar nada (está redirigiendo a login)
  if (!user) {
    return null
  }

  const navigation = [
    { name: t('nav.dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('nav.formsManagement'), href: '/admin/forms', icon: FileText },
    { name: t('nav.uploadForms'), href: '/admin/upload-forms', icon: Upload },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo y título */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link href="/admin" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">B</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t('admin.title')}
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{t('admin.subtitle')}</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Settings & User Menu */}
            <div className="flex items-center gap-2">
              {/* Settings Button */}
              <SettingsToolbar />

              {/* Separator */}
              <div className="h-8 w-px bg-slate-300 dark:bg-slate-600 mx-1" />

              {/* User Info */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {user.displayName || user.username}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
              </div>
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('admin.logout')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              BIZUIT Custom Forms © {new Date().getFullYear()} - Tycon S.A.
            </p>
            <div className="flex gap-4">
              {backendApiUrl && (
                <a
                  href={`${backendApiUrl}/docs`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary"
                >
                  Documentación
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
