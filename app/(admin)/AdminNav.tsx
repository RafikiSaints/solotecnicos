'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Logo } from '@/components/ui/Logo'
import { Menu, X, Users, Star, Award, CreditCard, BookOpen, BarChart3, Tags, UserCheck, UserCog } from 'lucide-react'

const ITEMS = [
  { href: '/admin',                 label: 'Resumen',         icon: BarChart3 },
  { href: '/admin/tecnicos',        label: 'Técnicos',        icon: Users },
  { href: '/admin/usuarios',        label: 'Usuarios',        icon: UserCog },
  { href: '/admin/claims',          label: 'Reclamos',        icon: UserCheck },
  { href: '/admin/categorias',      label: 'Categorías',      icon: Tags },
  { href: '/admin/resenas',         label: 'Reseñas',         icon: Star },
  { href: '/admin/certificaciones', label: 'Certificaciones', icon: Award },
  { href: '/admin/pagos',           label: 'Pagos',           icon: CreditCard },
  { href: '/admin/blog',            label: 'Blog',            icon: BookOpen },
  { href: '/admin/estadisticas',    label: 'Estadísticas',    icon: BarChart3 },
]

export function AdminNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Cerrar el drawer cuando se cambia de ruta
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const navContent = (
    <>
      <div className="p-4">
        <Logo size="sm" variant="light" />
        <div className="text-xs text-white/50 mt-2 uppercase tracking-wide">Admin</div>
      </div>
      <nav className="space-y-0.5 px-2">
        {ITEMS.map(it => {
          const Icon = it.icon
          const active = pathname === it.href || (it.href !== '/admin' && pathname?.startsWith(it.href))
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                active
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-white/80 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {it.label}
            </Link>
          )
        })}
      </nav>
    </>
  )

  return (
    <>
      {/* TOP BAR — solo móvil/tablet */}
      <div className="lg:hidden sticky top-0 z-30 bg-azul text-white flex items-center justify-between px-4 py-3 shadow-md">
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="p-1.5 -ml-1.5 rounded hover:bg-white/10"
        >
          <Menu size={22} />
        </button>
        <Logo size="sm" variant="light" />
        <div className="w-7" /> {/* spacer para centrar el logo */}
      </div>

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:block w-60 shrink-0 bg-azul text-white min-h-screen">
        {navContent}
      </aside>

      {/* OVERLAY + DRAWER MÓVIL */}
      {open && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-azul text-white shadow-2xl overflow-y-auto animate-slide-in-left"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="absolute top-3 right-3 p-1.5 rounded hover:bg-white/10"
            >
              <X size={20} />
            </button>
            {navContent}
          </aside>
        </>
      )}
    </>
  )
}
