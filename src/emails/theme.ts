export const theme = {
  colors: {
    bg: '#ffffff',
    'bg-2': '#f7f7f7',
    fg: '#111111',
    'fg-2': '#444444',
    'fg-3': '#888888',
    'fg-inverted': '#ffffff',
    primary: '#10b981', // RefactKit Teal
    'stroke-strong': '#e5e5e5',
  },
  borderRadius: {
    lg: '10px',
    xl: '12px',
    full: '9999px',
  },
}

export const tailwindConfig = {
  theme: {
    extend: {
      colors: theme.colors,
      borderRadius: theme.borderRadius,
      spacing: {
        'mobile-px': '16px',
        'desktop-px': '40px',
      },
      fontSize: {
        'font-11': ['11px', '16px'],
        'font-13': ['13px', '18px'],
        'font-16': ['16px', '24px'],
        'font-28': ['28px', '36px'],
        'font-32': ['32px', '40px'],
        'font-40': ['40px', '48px'],
      },
    },
  },
}
