export const metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de SoloTécnicos.',
}

export default function TerminosPage() {
  return (
    <div className="container-st py-12 max-w-3xl prose-st">
      <h1 className="font-display text-4xl text-azul font-extrabold mb-2">Términos y Condiciones</h1>
      <p className="text-sm text-gris-3 mb-8">Última actualización: {new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</p>

      <div className="space-y-8 text-gris-4 leading-relaxed">
        <section>
          <h2 className="font-display text-2xl text-azul mt-6 mb-3">1. Aceptación de los términos</h2>
          <p>Al acceder y usar SoloTécnicos (el "Servicio"), aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo, te pedimos no usar el sitio.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-azul mt-6 mb-3">2. Descripción del servicio</h2>
          <p>SoloTécnicos es un directorio que conecta clientes con técnicos independientes en Chile. Nosotros no prestamos servicios técnicos directamente — solo facilitamos el contacto. Las transacciones, garantías y acuerdos son entre cliente y técnico.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-azul mt-6 mb-3">3. Cuentas de usuario</h2>
          <p>Para registrarte como técnico debes proporcionar información veraz y mantenerla actualizada. Eres responsable de la seguridad de tu cuenta. Podemos suspender cuentas que incumplan estos términos.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-azul mt-6 mb-3">4. Reseñas y contenido</h2>
          <p>Las reseñas deben ser honestas, basadas en experiencias reales. Está prohibido publicar reseñas falsas, difamatorias, ofensivas o que promuevan productos/servicios externos. Nos reservamos el derecho de moderar y eliminar contenido inapropiado.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-azul mt-6 mb-3">5. Planes y pagos</h2>
          <p>Los técnicos pueden contratar planes pagados (PRO, Elite) que desbloquean funciones premium. Los pagos se procesan a través de Flow.cl. Puedes cancelar tu suscripción en cualquier momento desde tu dashboard. Las cancelaciones se aplican al término del período pagado.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-azul mt-6 mb-3">6. Responsabilidad</h2>
          <p>SoloTécnicos no se hace responsable por la calidad de los servicios prestados por los técnicos listados. Recomendamos verificar credenciales, revisar reseñas y solicitar cotizaciones antes de contratar.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-azul mt-6 mb-3">7. Propiedad intelectual</h2>
          <p>Todo el contenido del sitio (diseño, código, logos) es propiedad de SoloTécnicos. Las fotos y datos que subes a tu perfil siguen siendo tuyos, pero nos otorgas licencia para mostrarlos en el directorio.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-azul mt-6 mb-3">8. Modificaciones</h2>
          <p>Podemos actualizar estos términos en cualquier momento. Los cambios se notifican por email a los usuarios registrados.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-azul mt-6 mb-3">9. Contacto</h2>
          <p>Para consultas sobre estos términos: <a href="mailto:hola@solotecnicos.cl" className="text-azul-mid hover:underline">hola@solotecnicos.cl</a></p>
        </section>
      </div>
    </div>
  )
}
