import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * Subida de foto al bucket tecnico-fotos usando service_role.
 * Evita problemas de RLS y centraliza la validación.
 */
export async function POST(req: Request) {
  try {
    // 1. Verificar usuario autenticado
    const sb = createClient()
    const { data: { user }, error: authErr } = await sb.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 2. Encontrar el técnico del usuario
    const { data: tecnico } = await sb.from('tecnicos').select('id').eq('user_id', user.id).maybeSingle()
    if (!tecnico) {
      return NextResponse.json({ error: 'No tienes perfil de técnico' }, { status: 403 })
    }

    // 3. Leer el archivo del FormData
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Sin archivo' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Archivo muy grande (máx 5MB)' }, { status: 400 })
    }

    // 4. Subir con service_role (salta RLS)
    const service = createServiceClient()
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${tecnico.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: upErr } = await service.storage
      .from('tecnico-fotos')
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (upErr) {
      console.error('upload service error', upErr)
      return NextResponse.json({ error: upErr.message }, { status: 500 })
    }

    // 5. URL pública
    const { data: { publicUrl } } = service.storage.from('tecnico-fotos').getPublicUrl(path)

    // 6. Insertar registro en tabla tecnico_fotos
    const { data: foto, error: insErr } = await service.from('tecnico_fotos').insert({
      tecnico_id: tecnico.id,
      url: publicUrl,
      storage_path: path,
    }).select().single()

    if (insErr) {
      // Si falla el insert, borrar la foto subida
      await service.storage.from('tecnico-fotos').remove([path])
      return NextResponse.json({ error: insErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, foto })
  } catch (e: any) {
    console.error('upload exception', e)
    return NextResponse.json({ error: e.message || 'Error inesperado' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { foto_id } = await req.json()
    if (!foto_id) return NextResponse.json({ error: 'Falta foto_id' }, { status: 400 })

    const service = createServiceClient()
    const { data: foto } = await service.from('tecnico_fotos')
      .select('storage_path, tecnico_id, tecnicos(user_id)')
      .eq('id', foto_id)
      .single()

    if (!foto || (foto.tecnicos as any)?.user_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (foto.storage_path) {
      await service.storage.from('tecnico-fotos').remove([foto.storage_path])
    }
    await service.from('tecnico_fotos').delete().eq('id', foto_id)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
