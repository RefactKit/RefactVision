import { useEffect, useState } from 'react'

const FONT_KEY = 'RefactVision-font'

export type Font = 'default' | 'google-sans' | 'zain' | 'geist' | 'baloo'

export function useFont() {
  const [font, setFontState] = useState<Font>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(FONT_KEY) as Font) || 'default'
    }
    return 'default'
  })

  const setFont = (newFont: Font) => {
    setFontState(newFont)
    localStorage.setItem(FONT_KEY, newFont)
    if (newFont === 'default') {
      document.documentElement.removeAttribute('data-font')
    } else {
      document.documentElement.setAttribute('data-font', newFont)
    }
  }

  useEffect(() => {
    const savedFont = localStorage.getItem(FONT_KEY) as Font
    if (savedFont && savedFont !== 'default') {
      document.documentElement.setAttribute('data-font', savedFont)
    }
  }, [])

  return { font, setFont }
}
