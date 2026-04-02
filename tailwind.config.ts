import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#0A0E14',
        charcoal: '#141A22',
        pewter: '#1E2630',
        'text-primary': '#F0F2F5',
        'text-secondary': '#8A94A0',
        'text-tertiary': '#5A6370',
        'border-subtle': 'rgba(255, 255, 255, 0.08)',
        accent: {
          DEFAULT: '#7C5CFC',
          light: '#A78BFA',
          dark: '#5B3FD9',
          glow: 'rgba(124, 92, 252, 0.15)',
          surface: 'rgba(124, 92, 252, 0.08)',
        },
        success: '#34D0A8',
        warning: '#FFB84D',
        error: '#FF5C45',
        info: '#4BC2F0',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['Reddit Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        glass: '16px',
      },
      backgroundImage: {
        scanlines:
          'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.02) 1px, rgba(255,255,255,0.02) 2px)',
      },
    },
  },
  plugins: [],
}

export default config
