import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/ui/Logo'
import { ToastContainer } from '@/components/ui/Toast'
import { Users, Star, Award, CreditCard, BookOpen, BarChart3 } from 'lucide-react'

const ITEMS = [
  { href: '/admin',                 label: 'Resumen',         icon: BarChart3 },
  { href: '/admin/tecnicos',        label: 'Técnicos',        icon: Users },
  { href: '/admin/resenas',         label: 'Reseñas',         icon: Star },
  { href: '/admin/certificaciones', label: 'Certificaciones', icon: Award },
  { href: '/admin/pagos',           label: 'Pagos',           icon: CreditCard },
  { href: '/admin/blog',            label: 'Blog',            icon: BookOpen },
  { href: '/admin/estadisticas',    label: 'Estadísticas',    icon: BarChart3 },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'admin') redirect('/')

  return (
    <div className="flex bg-azul/[0.02] min-h-screen">
      <aside className="hidden lg:block w-60 shrink-0 bg-azul text-white min-h-screen">
        <div className="p-4">
          <Logo size="sm" variant="light" />
          <div className="text-xs text-white/50 mt-2 uppercase tracking-wide">Admin</div>
        </div>
        <nav className="space-y-0.5 px-2">
          {ITEMS.map(it => {
            const Icon = it.icon
            return (
              <Link key={it.href} href={it.href} className="flex items-center gap-2 px-3 py-2 rounded text-sm text-white/80 hover:bg-white/5 hover:text-white">
                <Icon size={16} />
                {it.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-10">{children}</main>
      <ToastContainer />
    </div>
  )
}
