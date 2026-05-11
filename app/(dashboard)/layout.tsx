import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarDashboard } from '@/components/dashboard/SidebarDashboard'
import { ToastContainer } from '@/components/ui/Toast'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const { data: tecnico } = await sb.from('tecnicos').select('*').eq('user_id', user.id).maybeSingle()
  if (!tecnico) redirect('/completar-perfil')

  const { count: noLeidos } = await sb.from('cotizaciones')
    .select('id', { count: 'exact', head: true })
    .eq('tecnico_id', tecnico.id)
    .eq('estado', 'pendiente')

  return (
    <div className="flex bg-papel min-h-screen">
      <SidebarDashboard tecnico={tecnico} mensajesNoLeidos={noLeidos || 0} />
      <main className="flex-1 p-4 lg:p-8 overflow-x-auto">{children}</main>
      <ToastContainer />
    </div>
  )
}
