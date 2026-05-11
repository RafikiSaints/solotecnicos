import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditorPerfil } from '@/components/dashboard/EditorPerfil'

export default async function PerfilEditorPage() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const { data: tecnico } = await sb.from('tecnicos').select('*').eq('user_id', user.id).single()
  if (!tecnico) redirect('/registro-tecnico')

  const [{ data: regiones }, { data: categorias }, { data: catsRel }, { data: servicios }] = await Promise.all([
    sb.from('regiones').select('*').order('orden'),
    sb.from('categorias').select('*').order('orden'),
    sb.from('tecnico_categorias').select('categoria_id').eq('tecnico_id', tecnico.id),
    sb.from('tecnico_servicios').select('*').eq('tecnico_id', tecnico.id).order('orden'),
  ])

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl text-azul mb-1">Editar perfil</h1>
      <p className="text-gris-4 mb-6">Los cambios se guardan automáticamente</p>
      <EditorPerfil
        tecnico={tecnico}
        regiones={regiones || []}
        categorias={categorias || []}
        categoriasSeleccionadas={(catsRel || []).map(c => c.categoria_id)}
        servicios={servicios || []}
      />
    </div>
  )
}
