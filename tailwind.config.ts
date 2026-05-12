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
        // ── Paleta principal (más vibrante) ──
        azul:        '#1E3A8A',  // azul real vivo
        'azul-mid':  '#2563EB',
        'azul-soft': '#3B82F6',
        rojo:        '#EF4444',  // rojo coral moderno
        'rojo-hover':'#DC2626',
        coral:       '#F97316',  // naranja vibrante
        // ── Fondo y neutros ──
        blanco:      '#FFFFFF',
        papel:       '#F8FAFC',  // gris muy suave azulado
        borde:       '#E2E8F0',
        'gris-3':    '#64748B',
        'gris-4':    '#334155',
        // ── Acentos ──
        oro:         '#F59E0B',  // ámbar vivo (premium PRO)
        'oro-soft':  '#FCD34D',
        verde:       '#10B981',  // verde esmeralda (verificado)
        cyan:        '#06B6D4',  // turquesa (acentos modernos)
        purpura:     '#8B5CF6',  // morado (Elite)
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06)',
        card: '0 2px 8px rgba(15,23,42,0.06), 0 16px 48px rgba(15,23,42,0.08)',
        glow: '0 0 0 4px rgba(37,99,235,0.15)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #06B6D4 100%)',
        'gradient-warm': 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
        'gradient-cool': 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)',
        'mesh-pattern': "radial-gradient(at 20% 30%, rgba(6,182,212,0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(139,92,246,0.18) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(37,99,235,0.18) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(249,115,22,0.15) 0px, transparent 50%)",
      },
    },
  },
  plugins: [],
}

export default config
