import { useEffect, useState } from 'react'

const COLOR_THEME_KEY = 'RefactVision-color-theme'

export type ColorTheme = 'default' | 'vega' | 'maia' | 'lyra' | 'mira' | 'luma' | 'refactkit'

export function useColorTheme() {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(COLOR_THEME_KEY) as ColorTheme) || 'default'
    }
    return 'default'
  })

  const setColorTheme = (newTheme: ColorTheme) => {
    setColorThemeState(newTheme)
    localStorage.setItem(COLOR_THEME_KEY, newTheme)
    if (newTheme === 'default') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem(COLOR_THEME_KEY) as ColorTheme
    if (savedTheme && savedTheme !== 'default') {
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  }, [])

  return { colorTheme, setColorTheme }
}
