import { TablaPlanes } from '@/components/planes/TablaPlanes'

export const metadata = {
  title: 'Planes y precios',
  description: 'Planes para técnicos: empieza gratis o desbloquea funciones PRO. Cancela cuando quieras.',
}

const FAQ = [
  { q: '¿Puedo cancelar cuando quiera?', a: 'Sí. Puedes cancelar tu plan en cualquier momento desde tu dashboard, sin trámites adicionales.' },
  { q: '¿Qué pasa si no pago la mensualidad?', a: 'Tienes 3 días de gracia. Después tu cuenta se degrada a plan Gratis automáticamente, pero conservas todos tus datos.' },
  { q: '¿Hay descuento por pagar anual?', a: 'Sí. Al pagar anual obtienes 2 meses gratis sobre el plan mensual.' },
  { q: '¿Las reseñas son verificadas?', a: 'Sí. Moderamos cada reseña antes de publicarla. Los usuarios con cuenta Google tienen badge de "verificada".' },
  { q: '¿Puedo cambiar de plan?', a: 'Sí, en cualquier momento. Si subes de plan, pagas la diferencia prorrateada. Si bajas, se aplica al próximo ciclo.' },
]

export default function PlanesPage() {
  return (
    <div className="container-st py-12 md:py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-azul mb-3">Planes y precios</h1>
        <p className="text-gris-4">Empieza gratis y mejora cuando estés listo. Sin tarjeta para registrarte.</p>
      </div>

      <TablaPlanes />

      <section className="mt-20 max-w-3xl mx-auto">
        <h2 className="font-display text-3xl text-azul mb-6 text-center">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {FAQ.map(f => (
            <details key={f.q} className="card">
              <summary className="cursor-pointer font-medium text-azul">{f.q}</summary>
              <p className="text-sm text-gris-4 mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-16 text-center">
        <h3 className="font-display text-2xl text-azul mb-2">Empieza gratis hoy</h3>
        <p className="text-gris-4 mb-4">Sin tarjeta, sin compromiso.</p>
        <a href="/registro-tecnico" className="btn-primary inline-flex">Crear cuenta gratis →</a>
      </section>
    </div>
  )
}
