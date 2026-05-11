'use client'
import Link from 'next/link'
import { Menu, X, Search } from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'

const LINKS = [
  { href: '/buscar', label: 'Buscar técnicos' },
  { href: '/emergencias', label: 'Emergencias' },
  { href: '/comparar', label: 'Comparar' },
  { href: '/planes', label: 'Planes' },
  { href: '/blog', label: 'Blog' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
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
        <div className="hidden lg:flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">Iniciar sesión</Button>
          </Link>
          <Link href="/registro-tecnico">
            <Button size="sm">Soy técnico →</Button>
          </Link>
        </div>
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
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">Iniciar sesión</Button>
              </Link>
              <Link href="/registro-tecnico" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full">Soy técnico</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
