'use client'

import { useEffect, useRef, useState } from 'react'

interface FormVersionInfo {
  version: string
  updatedAt: string
}

interface UseFormHotReloadOptions {
  formName: string
  currentVersion: string
  onVersionChange?: (newVersion: string) => void
  pollingInterval?: number // ms
  enabled?: boolean
}

/**
 * Hook para detectar cambios en la versión de un form y triggear hot reload
 *
 * Simula el comportamiento de producción donde:
 * 1. Se publica una nueva versión del form en la BD
 * 2. Este hook detecta el cambio via polling
 * 3. Se invalida el cache y se recarga el form actualizado
 */
export function useFormHotReload({
  formName,
  currentVersion,
  onVersionChange,
  pollingInterval = 10000, // 10 segundos por defecto
  enabled = true
}: UseFormHotReloadOptions) {
  const [latestVersion, setLatestVersion] = useState<string | null>(null)
  const [hasUpdate, setHasUpdate] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkForUpdates = async () => {
    try {
      const response = await fetch('/api/custom-forms/versions', {
        cache: 'no-store'
      })

      if (!response.ok) {
        console.warn('[Hot Reload] Failed to check versions:', response.statusText)
        return
      }

      const versions: Record<string, FormVersionInfo> = await response.json()
      const formVersionInfo = versions[formName]

      if (!formVersionInfo) {
        console.warn(`[Hot Reload] No version info for form: ${formName}`)
        return
      }

      const remoteVersion = formVersionInfo.version
      setLatestVersion(remoteVersion)

      // Detectar si hay una nueva versión
      if (remoteVersion !== currentVersion) {
        console.log(
          `[Hot Reload] 🔥 New version detected for ${formName}:`,
          `${currentVersion} → ${remoteVersion}`
        )
        setHasUpdate(true)

        if (onVersionChange) {
          onVersionChange(remoteVersion)
        }
      } else {
        console.log(`[Hot Reload] ✅ ${formName} is up to date: ${currentVersion}`)
      }
    } catch (error) {
      console.error('[Hot Reload] Error checking for updates:', error)
    }
  }

  useEffect(() => {
    if (!enabled) {
      console.log('[Hot Reload] Disabled for', formName)
      return
    }

    console.log(
      `[Hot Reload] 🚀 Monitoring ${formName} for updates (checking every ${pollingInterval}ms)`
    )

    // Check inmediato
    checkForUpdates()

    // Polling interval
    intervalRef.current = setInterval(checkForUpdates, pollingInterval)

    return () => {
      if (intervalRef.current) {
        console.log(`[Hot Reload] 🛑 Stopped monitoring ${formName}`)
        clearInterval(intervalRef.current)
      }
    }
  }, [formName, currentVersion, pollingInterval, enabled])

  return {
    latestVersion,
    hasUpdate,
    checkNow: checkForUpdates
  }
}
