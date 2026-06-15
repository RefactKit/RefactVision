import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import { getTranslations, type Locale, setLocaleCookie, type Translations } from '.'

interface I18nContextValue {
  locale: Locale
  dir: 'ltr' | 'rtl'
  t: Translations
  setLocale: (l: Locale) => void
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  dir: 'ltr',
  t: getTranslations('en'),
  setLocale: () => {},
})

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode
  initialLocale?: Locale
}) {
  // Use the locale from the server as the source of truth for initial render
  const [locale, setLocaleState] = useState<Locale>(initialLocale || 'en')

  function setLocale(next: Locale) {
    setLocaleState(next)
    setLocaleCookie(next)
  }

  const dir = locale === 'ar' || locale === 'ar-ma' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = locale
  }, [dir, locale])

  return (
    <I18nContext.Provider value={{ locale, dir, t: getTranslations(locale), setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
