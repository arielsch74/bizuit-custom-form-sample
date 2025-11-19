'use client'

import { useBizuitTheme } from '@tyconsa/bizuit-ui-components'
import { translations, type TranslationKey } from './translations'

export function useAppTranslation() {
  const { language } = useBizuitTheme()

  const t = (key: TranslationKey): string => {
    const lang = language === 'en' || language === 'es' ? language : 'es'
    return translations[lang][key] || key
  }

  return { t, language }
}
