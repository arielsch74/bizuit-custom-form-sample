'use client'

import { useBizuitTheme } from './theme-provider'
import { translations, type TranslationKey } from './translations'

export function useTranslation() {
  const { language } = useBizuitTheme()

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key
  }

  return { t, language }
}
