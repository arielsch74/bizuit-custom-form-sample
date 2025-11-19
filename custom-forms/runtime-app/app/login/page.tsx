'use client'

import { useLoginForm } from '@/hooks/useLoginForm'
import { useAppTranslation } from '@/lib/useAppTranslation'
import { SettingsToolbarFloating } from '@/components/settings-toolbar-floating'

export default function LoginPage() {
  const { username, password, loading, error, setUsername, setPassword, handleLogin } = useLoginForm('/admin')
  const { t } = useAppTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <SettingsToolbarFloating />
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <span className="text-primary-foreground font-bold text-2xl">B</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {t('login.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            {t('login.subtitle')}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t('login.username')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('login.usernamePlaceholder')}
              required
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t('login.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.passwordPlaceholder')}
              required
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary/90 disabled:bg-slate-400 text-primary-foreground font-semibold rounded-lg transition-colors shadow-lg"
          >
            {loading ? t('login.submitting') : t('login.submit')}
          </button>
        </form>

        <div className="mt-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>{t('login.note')}</strong> {t('login.noteText')}
          </p>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary underline">
            {t('login.backToHome')}
          </a>
        </div>
      </div>
    </div>
  )
}
