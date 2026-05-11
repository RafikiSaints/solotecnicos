import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const slugs = (url.searchParams.get('t') || '').split(',').filter(Boolean).slice(0, 3)
  if (!slugs.length) return NextResponse.json({ tecnicos: [] })
  const sb = createServiceClient()
  const { data } = await sb.from('tecnicos').select('*, regiones(nombre)').in('slug', slugs).eq('activo', true)
  return NextResponse.json({ tecnicos: data || [] })
}
