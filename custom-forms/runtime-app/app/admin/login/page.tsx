'use client'

import { useLoginForm } from '@/hooks/useLoginForm'

export default function AdminLoginPage() {
  const { username, password, loading, error, setUsername, setPassword, handleLogin } = useLoginForm('/admin')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-700">
        <h1 className="text-3xl font-bold text-white dark:text-white mb-2 text-center">
          Admin Login
        </h1>
        <p className="text-slate-400 dark:text-slate-400 mb-8 text-center">
          BIZUIT Custom Forms
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 dark:text-slate-300 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              className="w-full px-4 py-3 bg-slate-700 dark:bg-slate-700 border border-slate-600 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 dark:text-slate-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-slate-700 dark:bg-slate-700 border border-slate-600 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white dark:text-white placeholder:text-slate-400"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 bg-orange-900/20 border border-orange-700 rounded-lg p-4">
          <p className="text-sm text-orange-400">
            <strong>Nota:</strong> Usa tus credenciales de BIZUIT Dashboard.
          </p>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-slate-400 hover:text-orange-500 underline">
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  )
}
