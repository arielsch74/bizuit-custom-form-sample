/**
 * Custom translation hook for the example application
 *
 * This hook extends the base useTranslation from @tyconsa/bizuit-ui-components
 * with application-specific translations.
 *
 * Architecture:
 * - UI component translations: From @tyconsa/bizuit-ui-components (published to NPM)
 * - App-specific translations: From example/lib/translations.ts (NOT published)
 *
 * This separation ensures we don't need to publish the UI components package
 * every time we add translations for example pages.
 */

'use client'

import { useTranslation as useBaseTranslation } from '@tyconsa/bizuit-ui-components'
import { appTranslations, AppTranslationKey } from './translations'

export function useAppTranslation() {
  const { t: baseT, language } = useBaseTranslation()

  // Extend the base translation function with app-specific translations
  const t = (key: AppTranslationKey | string): string => {
    // Try app translations first
    const appTranslation = appTranslations[language as keyof typeof appTranslations]?.[key as keyof typeof appTranslations.en]

    if (appTranslation) {
      return appTranslation
    }

    // Fallback to base translations (from UI components package)
    return baseT(key as any)
  }

  return { t, language }
}
