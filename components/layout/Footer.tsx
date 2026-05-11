import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

export function Footer() {
  return (
    <footer className="mt-24 bg-azul text-white/80">
      <div className="container-st py-14 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          <Logo size="md" variant="light" />
          <p className="text-sm text-white/70 max-w-sm">
            El directorio más completo de técnicos verificados en Chile. Encuentra profesionales cerca de ti con reseñas reales en 7 dimensiones.
          </p>
        </div>
        <FooterCol title="Para clientes" links={[
          { href: '/buscar', label: 'Buscar técnicos' },
          { href: '/emergencias', label: 'Emergencias 24/7' },
          { href: '/comparar', label: 'Comparador' },
          { href: '/blog', label: 'Blog y guías' },
        ]} />
        <FooterCol title="Para técnicos" links={[
          { href: '/registro-tecnico', label: 'Únete gratis' },
          { href: '/planes', label: 'Planes y precios' },
          { href: '/login', label: 'Iniciar sesión' },
        ]} />
        <FooterCol title="Empresa" links={[
          { href: '/blog', label: 'Blog' },
          { href: '/contacto', label: 'Contacto' },
          { href: '/terminos', label: 'Términos' },
          { href: '/privacidad', label: 'Privacidad' },
        ]} />
      </div>
      <div className="border-t border-white/10">
        <div className="container-st py-5 text-xs text-white/50 flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} SoloTécnicos — Hecho en Chile 🇨🇱</span>
          <span>Servicios técnicos verificados en 16 regiones</span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map(l => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-white/70 hover:text-oro transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
