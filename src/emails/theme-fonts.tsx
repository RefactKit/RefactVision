import { Font } from '@react-email/components'
import React from 'react'

export const EmailFonts = () => (
  <>
    <Font
      fontFamily="Geist"
      fallbackFontFamily="Arial"
      webFont={{
        url: 'https://cdn.jsdelivr.net/npm/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2',
        format: 'woff2',
      }}
      fontWeight={400}
      fontStyle="normal"
    />
  </>
)
