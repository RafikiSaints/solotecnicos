import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlanGestion } from './PlanGestion'

export default async function PlanPage({ searchParams }: { searchParams: { ok?: string; error?: string } }) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login?next=/dashboard/plan')
  const { data: tecnico } = await sb.from('tecnicos').select('*').eq('user_id', user.id).single()
  if (!tecnico) redirect('/completar-perfil')

  const { data: suscripciones } = await sb.from('suscripciones')
    .select('*').eq('tecnico_id', tecnico.id).order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl text-azul mb-1 font-bold">Mi plan</h1>
      <p className="text-gris-4 mb-6">Gestiona tu suscripción y pagos</p>

      {searchParams.ok === '1' && (
        <div className="mb-6 rounded-lg border-2 border-verde/30 bg-verde/10 p-4 flex items-center gap-3 animate-fade-in">
          <span className="text-2xl">🎉</span>
          <div className="flex-1">
            <strong className="text-verde">¡Pago confirmado!</strong>
            <p className="text-sm text-gris-4">Tu plan está activo. Te enviamos un email con los detalles.</p>
          </div>
        </div>
      )}
      {searchParams.error && (
        <div className="mb-6 rounded-lg border-2 border-rojo/30 bg-rojo/10 p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <strong className="text-rojo">No pudimos activar tu plan automáticamente</strong>
            <p className="text-sm text-gris-4">
              {searchParams.error === 'pago-no-confirmado' && 'El pago no fue confirmado por Flow.'}
              {searchParams.error === 'tecnico-no-encontrado' && 'No encontramos tu cuenta. Contáctanos.'}
              {searchParams.error === 'sin-token' && 'Falta el token de Flow.'}
              {!['pago-no-confirmado','tecnico-no-encontrado','sin-token'].includes(searchParams.error) && `Error: ${searchParams.error}`}
              {' '}Si pagaste correctamente, escríbenos a hola@solotecnicos.cl con el número de orden.
            </p>
          </div>
        </div>
      )}

      <PlanGestion tecnico={tecnico} email={user.email || ''} suscripciones={suscripciones || []} />
    </div>
  )
}
