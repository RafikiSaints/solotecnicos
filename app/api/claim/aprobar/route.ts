import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { enviarEmail } from '@/lib/resend'
import Bienvenida from '@/emails/Bienvenida'

/**
 * Aprueba una solicitud de claim:
 * 1. Verifica que el admin esté autenticado
 * 2. Crea (o encuentra) cuenta auth con el email del solicitante
 * 3. Asocia el técnico al user_id
 * 4. Envía email de bienvenida con link "Establecer contraseña"
 */
export async function POST(req: Request) {
  try {
    const sb = createClient()
    const { data: { user: adminUser } } = await sb.auth.getUser()
    if (!adminUser) return NextResponse.json({ error: 'no autenticado' }, { status: 401 })
    if (adminUser.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'no autorizado' }, { status: 403 })
    }

    const { claim_id } = await req.json()
    if (!claim_id) return NextResponse.json({ error: 'falta claim_id' }, { status: 400 })

    const svc = createServiceClient()

    // Obtener la solicitud
    const { data: claim } = await svc.from('claim_requests').select('*, tecnicos(id, nombre_empresa, user_id)').eq('id', claim_id).single()
    if (!claim) return NextResponse.json({ error: 'solicitud no encontrada' }, { status: 404 })
    if (claim.estado !== 'pendiente') return NextResponse.json({ error: 'solicitud no está pendiente' }, { status: 400 })
    if (claim.tecnicos?.user_id) return NextResponse.json({ error: 'el perfil ya está reclamado' }, { status: 400 })

    // Buscar si ya existe user con ese email
    const { data: usuarios } = await svc.auth.admin.listUsers()
    let user = usuarios?.users?.find(u => u.email === claim.email)

    if (!user) {
      // Crear nueva cuenta auth (sin password, el técnico la establecerá vía email)
      const { data: nuevoUser, error: errCreate } = await svc.auth.admin.createUser({
        email: claim.email,
        email_confirm: true,
        user_metadata: { role: 'tecnico', nombre: claim.nombre_solicitante },
      })
      if (errCreate || !nuevoUser.user) {
        return NextResponse.json({ error: `Error creando usuario: ${errCreate?.message}` }, { status: 500 })
      }
      user = nuevoUser.user
    }

    // Asociar técnico al user_id
    await svc.from('tecnicos').update({ user_id: user.id }).eq('id', claim.tecnico_id)

    // Marcar solicitud como aprobada
    await svc.from('claim_requests').update({
      estado: 'aprobada',
      aprobada_por: adminUser.id,
      aprobada_en: new Date().toISOString(),
      user_id_creado: user.id,
    }).eq('id', claim_id)

    // Generar link mágico para que setee password
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://solotecnicos.cl'
    const { data: linkData } = await svc.auth.admin.generateLink({
      type: 'recovery',
      email: claim.email,
      options: {
        redirectTo: `${appUrl}/recuperar-password?claim=1`,
      },
    })

    // Email al técnico
    const tecnicoNombre = claim.tecnicos?.nombre_empresa || claim.nombre_solicitante
    await enviarEmail({
      to: claim.email,
      subject: `¡Tu perfil "${tecnicoNombre}" está listo en SoloTécnicos!`,
      react: Bienvenida({ nombre: tecnicoNombre }),
    })

    return NextResponse.json({
      ok: true,
      user_id: user.id,
      magic_link: linkData?.properties?.action_link, // por si quieres compartirlo manualmente
    })
  } catch (e: any) {
    console.error('[claim/aprobar] error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
