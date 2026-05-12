'use client'
import Link from 'next/link'
import { Menu, X, LogOut, LayoutDashboard, ExternalLink, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import type { User as SbUser } from '@supabase/supabase-js'

const LINKS = [
  { href: '/buscar', label: 'Buscar técnicos' },
  { href: '/emergencias', label: 'Emergencias' },
  { href: '/comparar', label: 'Comparar' },
  { href: '/planes', label: 'Planes' },
  { href: '/blog', label: 'Blog' },
]

type UserType = 'tecnico' | 'cliente' | 'admin' | null

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<SbUser | null>(null)
  const [tipo, setTipo] = useState<UserType>(null)
  const [slug, setSlug] = useState<string | null>(null)
  const [menuUser, setMenuUser] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) cargarInfoUsuario(user)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) cargarInfoUsuario(session.user)
      else { setSlug(null); setTipo(null) }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function cargarInfoUsuario(u: SbUser) {
    // 1. ¿Es admin?
    if (u.user_metadata?.role === 'admin') {
      setTipo('admin')
      return
    }
    // 2. ¿Es técnico? (tiene perfil en tecnicos)
    const { data: tec } = await supabase.from('tecnicos').select('slug').eq('user_id', u.id).maybeSingle()
    if (tec) {
      setTipo('tecnico')
      setSlug(tec.slug)
      return
    }
    // 3. Es cliente (tiene perfil en clientes o solo está en auth con rol cliente)
    setTipo('cliente')
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    setUser(null)
    setMenuUser(false)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-borde">
      <div className="container-st flex items-center justify-between py-3">
        <Logo size="md" />
        <nav className="hidden lg:flex items-center gap-7">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} className="text-sm text-gris-4 hover:text-azul transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden lg:flex items-center gap-2 relative">
          {user ? (
            <>
              {tipo === 'tecnico' && (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard size={14} /> Mi dashboard
                  </Button>
                </Link>
              )}
              {tipo === 'cliente' && (
                <Link href="/mi-cuenta">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard size={14} /> Mi cuenta
                  </Button>
                </Link>
              )}
              {tipo === 'admin' && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard size={14} /> Admin
                  </Button>
                </Link>
              )}
              <button
                onClick={() => setMenuUser(m => !m)}
                className="h-9 w-9 rounded-full bg-azul text-white flex items-center justify-center font-semibold text-sm hover:bg-azul-mid"
              >
                {(user.email || 'U').charAt(0).toUpperCase()}
              </button>
              {menuUser && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-borde rounded-lg shadow-card py-1 z-50">
                  <div className="px-3 py-2 border-b border-borde text-xs text-gris-3 truncate">{user.email}</div>
                  {tipo === 'tecnico' && slug && (
                    <Link
                      href={`/tecnico/${slug}`}
                      onClick={() => setMenuUser(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gris-4 hover:bg-papel"
                    >
                      <ExternalLink size={14} /> Ver mi perfil público
                    </Link>
                  )}
                  {tipo === 'tecnico' && (
                    <Link href="/dashboard/perfil" onClick={() => setMenuUser(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gris-4 hover:bg-papel">
                      <User size={14} /> Editar perfil
                    </Link>
                  )}
                  {tipo === 'cliente' && (
                    <>
                      <Link href="/mi-cuenta/cotizaciones" onClick={() => setMenuUser(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gris-4 hover:bg-papel">
                        📩 Mis cotizaciones
                      </Link>
                      <Link href="/mi-cuenta/resenas" onClick={() => setMenuUser(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gris-4 hover:bg-papel">
                        ⭐ Mis reseñas
                      </Link>
                      <Link href="/mi-cuenta/perfil" onClick={() => setMenuUser(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gris-4 hover:bg-papel">
                        <User size={14} /> Editar perfil
                      </Link>
                    </>
                  )}
                  <button
                    onClick={cerrarSesion}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-rojo hover:bg-rojo/5 w-full text-left border-t border-borde"
                  >
                    <LogOut size={14} /> Cerrar sesión
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size="sm">Iniciar sesión</Button></Link>
              <Link href="/registro-tecnico"><Button size="sm">Soy técnico →</Button></Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 -mr-2 text-azul"
          onClick={() => setOpen(o => !o)}
          aria-label="menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-borde bg-white">
          <div className="container-st py-3 flex flex-col gap-1">
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-2 text-azul font-medium">
                {l.label}
              </Link>
            ))}
            <div className="border-t border-borde mt-2 pt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <Button variant="secondary" size="sm" className="w-full">
                      <LayoutDashboard size={14} /> Mi dashboard
                    </Button>
                  </Link>
                  {slug && (
                    <Link href={`/tecnico/${slug}`} onClick={() => setOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink size={14} /> Ver mi perfil público
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={cerrarSesion} className="w-full">
                    <LogOut size={14} /> Cerrar sesión
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Iniciar sesión</Button>
                  </Link>
                  <Link href="/registro-cliente" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Crear cuenta cliente</Button>
                  </Link>
                  <Link href="/registro-tecnico" onClick={() => setOpen(false)}>
                    <Button size="sm" className="w-full">Soy técnico</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
