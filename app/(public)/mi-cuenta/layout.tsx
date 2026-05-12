import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function MiCuentaLayout({ children }: { children: React.ReactNode }) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login?next=/mi-cuenta')

  // Si es técnico, redirigir a su dashboard
  if (user.user_metadata?.role === 'tecnico') {
    redirect('/dashboard')
  }

  // Asegurar que tiene perfil cliente (lo crea si no existe — por si vino por OAuth)
  const { data: cliente } = await sb.from('clientes').select('id').eq('user_id', user.id).maybeSingle()
  if (!cliente) {
    // Crearlo vía service_role en otra ruta — por ahora seguimos
    // El user puede igual ver la página, sus cotizaciones se asocian por user_id directamente
  }

  return <>{children}</>
}
