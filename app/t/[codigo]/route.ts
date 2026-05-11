import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: Request, { params }: { params: { codigo: string } }) {
  const sb = createServiceClient()
  // Buscar por link_personalizado o slug
  const { data: tecnico } = await sb.from('tecnicos')
    .select('slug, id')
    .or(`link_personalizado.eq.${params.codigo},slug.eq.${params.codigo}`)
    .maybeSingle()

  if (!tecnico) {
    return NextResponse.redirect(new URL('/buscar', req.url))
  }

  // Registrar visita en background
  sb.from('visitas').insert({ tecnico_id: tecnico.id, tipo: 'perfil', hora: new Date().getHours() }).then(() => {})

  return NextResponse.redirect(new URL(`/tecnico/${tecnico.slug}`, req.url))
}
