import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CompletarPerfilForm } from './CompletarPerfilForm'

export const metadata = { title: 'Completa tu perfil de técnico' }

export default async function CompletarPerfilPage() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  // Si ya tiene técnico, mandar al dashboard
  const { data: existente } = await sb.from('tecnicos').select('id').eq('user_id', user.id).maybeSingle()
  if (existente) redirect('/dashboard')

  const [{ data: regiones }, { data: categorias }] = await Promise.all([
    sb.from('regiones').select('*').order('orden'),
    sb.from('categorias').select('*').order('orden'),
  ])

  return (
    <div className="container-st py-12 max-w-xl">
      <h1 className="font-display text-3xl text-azul mb-1">Completa tu perfil</h1>
      <p className="text-gris-4 mb-6">Ya iniciaste sesión, ahora necesitamos algunos datos básicos para crear tu perfil de técnico.</p>
      <div className="card">
        <CompletarPerfilForm
          userId={user.id}
          email={user.email || ''}
          regiones={regiones || []}
          categorias={categorias || []}
        />
      </div>
    </div>
  )
}
