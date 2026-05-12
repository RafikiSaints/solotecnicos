import { createServiceClient } from '@/lib/supabase/server'
import { CrearTecnicoForm } from './CrearTecnicoForm'

export default async function CrearTecnico() {
  const sb = createServiceClient()
  const [{ data: regiones }, { data: categorias }] = await Promise.all([
    sb.from('regiones').select('*').order('orden'),
    sb.from('categorias').select('*').order('orden'),
  ])

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-azul font-bold mb-1">Crear técnico manual</h1>
      <p className="text-sm text-gris-3 mb-4">
        Crea un perfil sin cuenta de usuario. El técnico podrá <strong>reclamarlo</strong> después
        haciendo click en el botón "¿Es tu negocio?" en su perfil público.
      </p>

      <div className="card bg-azul-mid/5 border-azul-mid/30 mb-4">
        <h3 className="font-display text-azul font-bold text-sm mb-2">💡 ¿Para qué sirve esto?</h3>
        <p className="text-sm text-gris-4">
          Te permite <strong>poblar el directorio</strong> con técnicos que encuentres en internet,
          páginas amarillas, redes sociales, etc. Su perfil queda visible inmediatamente con la info que cargues.
          Cuando ellos descubran que están listados, pueden reclamar el perfil y empezar a gestionarlo.
        </p>
      </div>

      <CrearTecnicoForm regiones={regiones || []} categorias={categorias || []} />
    </div>
  )
}
