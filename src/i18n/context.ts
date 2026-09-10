import { createContext } from 'react'
import type { Locale, TranslationKey } from './translations'

export const STORAGE_KEY = 'everyday-tools-locale'

export interface I18nContextValue {
  locale: Locale
  t: TranslationKey
  setLocale: (locale: Locale) => void
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'pt') return saved
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'en'
  return nav.startsWith('pt') ? 'pt' : 'en'
}
