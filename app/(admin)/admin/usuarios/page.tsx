import { createServiceClient } from '@/lib/supabase/server'
import { UsuariosTable } from './UsuariosTable'

export default async function AdminUsuarios() {
  const svc = createServiceClient()
  const { data } = await svc.auth.admin.listUsers()
  const usuarios = data?.users || []

  // Cruzar con tabla técnicos para saber quién tiene perfil técnico
  const { data: tecnicos } = await svc.from('tecnicos').select('user_id, nombre_empresa, slug')
  const tecnicosMap = new Map((tecnicos || []).filter((t: any) => t.user_id).map((t: any) => [t.user_id, t]))

  const { data: clientes } = await svc.from('clientes').select('user_id, nombre')
  const clientesMap = new Map((clientes || []).map((c: any) => [c.user_id, c]))

  const rows = usuarios.map(u => {
    const tecnico = tecnicosMap.get(u.id)
    const cliente = clientesMap.get(u.id)
    let tipo: 'admin' | 'tecnico' | 'cliente' | 'sin_perfil' = 'sin_perfil'
    if (u.user_metadata?.role === 'admin') tipo = 'admin'
    else if (tecnico) tipo = 'tecnico'
    else if (cliente || u.user_metadata?.role === 'cliente') tipo = 'cliente'

    return {
      id: u.id,
      email: u.email || '',
      tipo,
      nombre: (tecnico as any)?.nombre_empresa || (cliente as any)?.nombre || u.user_metadata?.nombre || '—',
      slug: (tecnico as any)?.slug || null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at || null,
      confirmed_at: u.email_confirmed_at || null,
    }
  })

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-display text-3xl text-azul font-bold">Usuarios</h1>
        <p className="text-sm text-gris-3">
          Todas las cuentas registradas. Desde aquí puedes convertir clientes a técnicos.
        </p>
      </div>
      <UsuariosTable usuarios={rows} />
    </div>
  )
}
