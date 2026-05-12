'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface Props {
  slug: string | null
  email: string
}

export function HeaderDashboard({ slug, email }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between mb-6 -mx-4 lg:-mx-8 px-4 lg:px-8 py-3 bg-white border-b border-borde lg:border-0 lg:bg-transparent lg:py-0">
      <div className="flex items-center gap-3">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gris-4 hover:text-azul">
          <ArrowLeft size={16} /> Volver al sitio
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {slug && (
          <Link href={`/tecnico/${slug}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink size={14} /> Ver mi perfil público
            </Button>
          </Link>
        )}
        <div className="hidden md:flex items-center gap-2 text-xs text-gris-3 ml-2">
          <span className="truncate max-w-[180px]">{email}</span>
          <Button variant="ghost" size="sm" onClick={cerrarSesion}>
            <LogOut size={14} /> Salir
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={cerrarSesion} className="md:hidden">
          <LogOut size={14} />
        </Button>
      </div>
    </div>
  )
}
