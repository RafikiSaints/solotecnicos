import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { EditarPerfilCliente } from './EditarPerfilCliente'

export default async function PerfilCliente() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login?next=/mi-cuenta/perfil')

  const { data: cliente } = await sb.from('clientes').select('*').eq('user_id', user.id).maybeSingle()

  return (
    <div className="container-st py-10 max-w-2xl">
      <Link href="/mi-cuenta" className="text-sm text-gris-4 hover:text-azul inline-flex items-center gap-1 mb-4">
        <ArrowLeft size={14} /> Volver a mi cuenta
      </Link>

      <h1 className="font-display text-3xl text-azul font-bold mb-1">Mi perfil</h1>
      <p className="text-gris-4 mb-6">Edita tus datos personales</p>

      <EditarPerfilCliente
        userId={user.id}
        email={user.email || ''}
        cliente={cliente}
      />
    </div>
  )
}
