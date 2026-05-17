'use client'

type Red = 'facebook' | 'instagram' | 'youtube' | 'tiktok'

interface Props {
  facebook?: string | null
  instagram?: string | null
  youtube?: string | null
  tiktok?: string | null
  /** "card" = cards blancas (sobre hero azul), "chip" = pills compactas */
  variant?: 'card' | 'chip'
}

/**
 * Extrae el "handle" (nombre de usuario visible) de la URL de cada red.
 * Si no puede parsearla, devuelve el nombre de la red como fallback.
 */
function extractHandle(url: string, red: Red): string {
  if (!url) return ''
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    const path = u.pathname.replace(/^\/+|\/+$/g, '')
    if (!path) return defaultName(red)
    const segs = path.split('/').filter(Boolean)
    const first = segs[0] || ''

    if (red === 'instagram' || red === 'tiktok') {
      return '@' + first.replace(/^@/, '')
    }
    if (red === 'facebook') {
      // /profile.php?id=X → no podemos derivar el nombre, usamos default
      if (first === 'profile.php') return defaultName(red)
      return first.replace(/^@/, '')
    }
    if (red === 'youtube') {
      if (first.startsWith('@')) return first
      if (['c', 'user', 'channel'].includes(first) && segs[1]) return segs[1]
      return first
    }
  } catch {
    // si no es una URL válida pero el user metió un @handle directo
    if (url.startsWith('@')) return url
  }
  return defaultName(red)
}

function defaultName(red: Red): string {
  return red.charAt(0).toUpperCase() + red.slice(1)
}

const ICONS: Record<Red, JSX.Element> = {
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F58529"/>
          <stop offset="50%" stopColor="#DD2A7B"/>
          <stop offset="100%" stopColor="#8134AF"/>
        </linearGradient>
      </defs>
      <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.197.157 3.355.673 2.014 2.014.673 3.355.157 5.197.072 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.085 1.855.601 3.697 1.942 5.038 1.341 1.341 3.183 1.857 5.038 1.942C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c1.855-.085 3.697-.601 5.038-1.942 1.341-1.341 1.857-3.183 1.942-5.038.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.668-.072-4.948-.085-1.855-.601-3.697-1.942-5.038C20.645.673 18.803.157 16.948.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF0000">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  tiktok: (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#000" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V9.31a8.16 8.16 0 0 0 4.84 1.57v-3.4a4.79 4.79 0 0 1-1.91-.79z"/>
    </svg>
  ),
}

export function RedesSociales({ facebook, instagram, youtube, tiktok, variant = 'card' }: Props) {
  const items: { red: Red; url: string }[] = []
  if (facebook?.trim())  items.push({ red: 'facebook',  url: facebook.trim() })
  if (instagram?.trim()) items.push({ red: 'instagram', url: instagram.trim() })
  if (youtube?.trim())   items.push({ red: 'youtube',   url: youtube.trim() })
  if (tiktok?.trim())    items.push({ red: 'tiktok',    url: tiktok.trim() })

  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map(({ red, url }) => {
        const handle = extractHandle(url, red)
        const finalUrl = url.startsWith('http') ? url : `https://${url}`
        return (
          <a
            key={red}
            href={finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={
              variant === 'card'
                ? 'inline-flex items-center gap-2 bg-white hover:bg-white/95 rounded-lg px-3 py-2 transition-all shadow-md hover:shadow-lg group'
                : 'inline-flex items-center gap-1.5 bg-white border border-borde hover:border-azul-mid rounded-full px-2.5 py-1 text-xs transition-colors'
            }
            title={`Ver perfil en ${defaultName(red)}`}
          >
            {ICONS[red]}
            <span className={variant === 'card' ? 'text-sm font-semibold text-azul' : 'text-azul-mid font-medium'}>
              {handle}
            </span>
            <span className={variant === 'card' ? 'text-azul-mid text-xs group-hover:translate-x-0.5 transition-transform' : 'text-azul-mid text-[10px]'}>
              ↗
            </span>
          </a>
        )
      })}
    </div>
  )
}
