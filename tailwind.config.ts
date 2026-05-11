import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './emails/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        azul:       '#0D2444',
        'azul-mid': '#163660',
        'azul-soft':'#1E4A82',
        rojo:       '#C8102E',
        'rojo-hover':'#A50D25',
        blanco:     '#FAFAF8',
        papel:      '#F2F1EE',
        borde:      '#D8D5CE',
        'gris-3':   '#8A877F',
        'gris-4':   '#4A4840',
        oro:        '#C89A2E',
        verde:      '#1A7A4A',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans:    ['var(--font-instrument)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '14px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(13,36,68,0.04), 0 4px 16px rgba(13,36,68,0.06)',
        card: '0 1px 3px rgba(13,36,68,0.06), 0 8px 24px rgba(13,36,68,0.04)',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
