import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MessageSquare, Star, Search, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default async function MiCuentaPage() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login?next=/mi-cuenta')

  const [cotizacionesRes, resenasRes] = await Promise.all([
    sb.from('cotizaciones').select('id, estado, created_at', { count: 'exact' }).eq('cliente_user_id', user.id),
    sb.from('resenas').select('id, created_at', { count: 'exact' }).eq('autor_user_id', user.id),
  ])

  const nombre = user.user_metadata?.nombre || user.email?.split('@')[0] || 'Cliente'

  return (
    <div className="container-st py-10 max-w-5xl">
      <h1 className="font-display text-3xl text-azul font-bold mb-1">Hola, {nombre} 👋</h1>
      <p className="text-gris-4 mb-8">Resumen de tu actividad en SoloTécnicos</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Link href="/mi-cuenta/cotizaciones" className="card hover:shadow-card transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-md bg-azul-mid/10 flex items-center justify-center">
              <MessageSquare size={20} className="text-azul-mid" />
            </div>
            <div className="font-display text-3xl font-bold text-azul">{cotizacionesRes.count || 0}</div>
          </div>
          <div className="text-xs text-gris-3 uppercase tracking-wide font-semibold">Cotizaciones</div>
          <div className="text-sm text-gris-4 mt-1">Solicitudes enviadas</div>
        </Link>

        <Link href="/mi-cuenta/resenas" className="card hover:shadow-card transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-md bg-oro/10 flex items-center justify-center">
              <Star size={20} className="text-oro" />
            </div>
            <div className="font-display text-3xl font-bold text-azul">{resenasRes.count || 0}</div>
          </div>
          <div className="text-xs text-gris-3 uppercase tracking-wide font-semibold">Reseñas</div>
          <div className="text-sm text-gris-4 mt-1">Opiniones que dejaste</div>
        </Link>

        <Link href="/buscar" className="card hover:shadow-card transition-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-md bg-verde/10 flex items-center justify-center">
              <Search size={20} className="text-verde" />
            </div>
            <div className="font-display text-base font-bold text-azul">Buscar técnicos</div>
          </div>
          <div className="text-xs text-gris-3 uppercase tracking-wide font-semibold">Encontrar más</div>
          <div className="text-sm text-gris-4 mt-1">Explora el directorio</div>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/mi-cuenta/cotizaciones" className="card hover:bg-papel transition-colors">
          <h3 className="font-display text-lg text-azul font-bold mb-1">📩 Mis cotizaciones</h3>
          <p className="text-sm text-gris-4 mb-3">Ve todas las cotizaciones que has solicitado, su estado y respuestas.</p>
          <span className="text-sm text-azul-mid font-medium">Ver historial →</span>
        </Link>

        <Link href="/mi-cuenta/resenas" className="card hover:bg-papel transition-colors">
          <h3 className="font-display text-lg text-azul font-bold mb-1">⭐ Mis reseñas</h3>
          <p className="text-sm text-gris-4 mb-3">Tus opiniones sobre los técnicos que has contratado.</p>
          <span className="text-sm text-azul-mid font-medium">Ver mis reseñas →</span>
        </Link>

        <Link href="/mi-cuenta/perfil" className="card hover:bg-papel transition-colors">
          <h3 className="font-display text-lg text-azul font-bold mb-1">⚙️ Mi perfil</h3>
          <p className="text-sm text-gris-4 mb-3">Actualiza tus datos personales y contraseña.</p>
          <span className="text-sm text-azul-mid font-medium">Configuración →</span>
        </Link>

        <div className="card bg-gradient-cool text-white">
          <h3 className="font-display text-lg font-bold mb-1 !text-white">¿Necesitas un nuevo técnico?</h3>
          <p className="text-sm text-white/90 mb-3">Busca en el directorio o usa el comparador para elegir mejor.</p>
          <Link href="/buscar">
            <Button className="bg-white !text-azul hover:bg-papel" size="sm">Buscar técnicos →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
