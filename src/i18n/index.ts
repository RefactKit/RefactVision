import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import Cookies from 'js-cookie'
import { ar } from './locales/ar'
import { arMa } from './locales/ar-ma'
import { be } from './locales/be'
import { de } from './locales/de'
import { en, type Translations } from './locales/en'
import { es } from './locales/es'
import { fr } from './locales/fr'
import { hi } from './locales/hi'
import { it } from './locales/it'
import { pt } from './locales/pt'
import { ru } from './locales/ru'
import { tr } from './locales/tr'
import { zh } from './locales/zh'

// Re-export so context.tsx can import Translations from '.'
export type { Translations } from './locales/en'

export type Locale =
  | 'en'
  | 'fr'
  | 'be'
  | 'de'
  | 'hi'
  | 'ar'
  | 'ar-ma'
  | 'es'
  | 'pt'
  | 'zh'
  | 'it'
  | 'ru'
  | 'tr'

export const LOCALE_COOKIE = 'lk_locale'

const locales: Record<Locale, Translations> = {
  en,
  fr,
  be,
  de,
  hi,
  ar,
  'ar-ma': arMa,
  es,
  pt,
  zh,
  it,
  ru,
  tr,
}

export function getTranslations(locale: Locale): Translations {
  return locales[locale] ?? en
}

/** Read locale from the cookie on the client (browser) */
export function detectLocale(): Locale {
  if (typeof document !== 'undefined') {
    const val = Cookies.get(LOCALE_COOKIE)
    if (val === 'ar') return 'ar'
    if (val === 'ar-ma') return 'ar-ma'
    if (val === 'es') return 'es'
    if (val === 'be') return 'be'
    if (val === 'de') return 'de'
    if (val === 'hi') return 'hi'
    if (val === 'pt') return 'pt'
    if (val === 'zh') return 'zh'
    if (val === 'en') return 'en'
    if (val === 'it') return 'it'
    if (val === 'ru') return 'ru'
    if (val === 'tr') return 'tr'
    return 'fr'
  }
  return 'fr'
}

/** Read locale from the request cookie on the server */
export const getServerLocale = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  const cookieHeader = request.headers.get('Cookie') ?? ''
  const match = cookieHeader.match(new RegExp(`(^|; ) ?${LOCALE_COOKIE}=([^;]+)`))
  const val = match ? match[2] : null
  if (val === 'ar') return 'ar'
  if (val === 'ar-ma') return 'ar-ma'
  if (val === 'es') return 'es'
  if (val === 'be') return 'be'
  if (val === 'de') return 'de'
  if (val === 'hi') return 'hi'
  if (val === 'pt') return 'pt'
  if (val === 'zh') return 'zh'
  if (val === 'en') return 'en'
  if (val === 'it') return 'it'
  if (val === 'ru') return 'ru'
  if (val === 'tr') return 'tr'
  return 'fr'
})

export function setLocaleCookie(locale: Locale) {
  Cookies.set(LOCALE_COOKIE, locale, { expires: 365, sameSite: 'lax' })
}

export { ar, arMa, be, de, en, es, fr, hi, it, pt, ru, tr, zh }
