import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { enviarEmail } from '@/lib/resend'
import Bienvenida from '@/emails/Bienvenida'

/**
 * Vincula un usuario existente (por email) a un perfil de técnico.
 * Útil para:
 *  - Convertir un cliente registrado en técnico
 *  - Asignar dueño a un técnico huérfano (creado por admin)
 *  - Crear cuenta nueva si el email no existe
 */
const schema = z.object({
  tecnico_id: z.string().uuid(),
  email: z.string().email(),
  crear_si_no_existe: z.boolean().optional().default(true),
  enviar_email_bienvenida: z.boolean().optional().default(true),
})

export async function POST(req: Request) {
  try {
    // Solo admin
    const sb = createClient()
    const { data: { user: adminUser } } = await sb.auth.getUser()
    if (!adminUser || adminUser.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'no autorizado' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = schema.parse(body)
    const svc = createServiceClient()

    // 1. Verificar que el técnico existe
    const { data: tecnico } = await svc.from('tecnicos')
      .select('id, nombre_empresa, user_id')
      .eq('id', parsed.tecnico_id)
      .single()
    if (!tecnico) return NextResponse.json({ error: 'Técnico no encontrado' }, { status: 404 })
    if (tecnico.user_id) {
      return NextResponse.json({
        error: 'Este técnico ya tiene un usuario asociado. Primero desvincula al actual.'
      }, { status: 400 })
    }

    // 2. Buscar usuario por email
    const { data: usuarios } = await svc.auth.admin.listUsers()
    let user = usuarios?.users?.find(u => u.email?.toLowerCase() === parsed.email.toLowerCase())

    // 3. Si no existe y crear_si_no_existe = true, crearlo
    if (!user) {
      if (!parsed.crear_si_no_existe) {
        return NextResponse.json({ error: 'Usuario no encontrado y no se solicitó crearlo' }, { status: 404 })
      }
      const { data: nuevoUser, error: errCreate } = await svc.auth.admin.createUser({
        email: parsed.email,
        email_confirm: true,
        user_metadata: { role: 'tecnico' },
      })
      if (errCreate || !nuevoUser.user) {
        return NextResponse.json({ error: `Error creando usuario: ${errCreate?.message}` }, { status: 500 })
      }
      user = nuevoUser.user
    }

    // 4. Verificar que este usuario no tenga ya otro técnico vinculado
    const { data: otroTec } = await svc.from('tecnicos').select('id, nombre_empresa').eq('user_id', user.id).maybeSingle()
    if (otroTec && otroTec.id !== tecnico.id) {
      return NextResponse.json({
        error: `Este usuario ya tiene vinculado otro técnico: "${otroTec.nombre_empresa}". Un usuario solo puede tener 1 perfil de técnico.`
      }, { status: 400 })
    }

    // 5. Vincular
    await svc.from('tecnicos').update({ user_id: user.id }).eq('id', tecnico.id)

    // 6. Actualizar metadata del usuario a "tecnico"
    if (user.user_metadata?.role !== 'tecnico') {
      await svc.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, role: 'tecnico' },
      })
    }

    // 7. Enviar email de bienvenida (opcional)
    if (parsed.enviar_email_bienvenida && parsed.email) {
      try {
        await enviarEmail({
          to: parsed.email,
          subject: `¡Tu perfil "${tecnico.nombre_empresa}" está listo!`,
          react: Bienvenida({ nombre: tecnico.nombre_empresa }),
        })
      } catch (e) {
        console.warn('Email bienvenida falló:', e)
      }
    }

    return NextResponse.json({
      ok: true,
      user_id: user.id,
      tecnico_nombre: tecnico.nombre_empresa,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

/**
 * DELETE: desvincula al usuario del técnico (vuelve a "huérfano")
 */
export async function DELETE(req: Request) {
  try {
    const sb = createClient()
    const { data: { user: adminUser } } = await sb.auth.getUser()
    if (!adminUser || adminUser.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'no autorizado' }, { status: 403 })
    }

    const { tecnico_id } = await req.json()
    if (!tecnico_id) return NextResponse.json({ error: 'falta tecnico_id' }, { status: 400 })

    const svc = createServiceClient()
    await svc.from('tecnicos').update({ user_id: null }).eq('id', tecnico_id)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
