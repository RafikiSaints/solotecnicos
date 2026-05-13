import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { data: tecnico } = await sb.from('tecnicos').select('id, logo_storage_path').eq('user_id', user.id).maybeSingle()
    if (!tecnico) return NextResponse.json({ error: 'No tienes perfil de técnico' }, { status: 403 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Sin archivo' }, { status: 400 })
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'El logo debe pesar máx 2MB' }, { status: 400 })
    }

    const service = createServiceClient()

    // Borrar logo anterior si existía
    if (tecnico.logo_storage_path) {
      await service.storage.from('tecnico-fotos').remove([tecnico.logo_storage_path]).catch(() => {})
    }

    const ext = file.name.split('.').pop() || 'png'
    const path = `${tecnico.id}/logo-${Date.now()}.${ext}`
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: upErr } = await service.storage
      .from('tecnico-fotos')
      .upload(path, buffer, { contentType: file.type, upsert: false })
    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 })
    }

    const { data: { publicUrl } } = service.storage.from('tecnico-fotos').getPublicUrl(path)

    await service.from('tecnicos').update({
      logo_url: publicUrl,
      logo_storage_path: path,
    }).eq('id', tecnico.id)

    return NextResponse.json({ ok: true, url: publicUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const service = createServiceClient()
    const { data: tecnico } = await service.from('tecnicos').select('id, logo_storage_path').eq('user_id', user.id).maybeSingle()
    if (!tecnico) return NextResponse.json({ error: 'Sin perfil' }, { status: 403 })

    if (tecnico.logo_storage_path) {
      await service.storage.from('tecnico-fotos').remove([tecnico.logo_storage_path]).catch(() => {})
    }
    await service.from('tecnicos').update({ logo_url: null, logo_storage_path: null }).eq('id', tecnico.id)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
