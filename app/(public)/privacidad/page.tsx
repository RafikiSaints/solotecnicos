export const metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y manejo de datos de SoloTécnicos.',
}

export default function PrivacidadPage() {
  return (
    <div className="container-st py-12 max-w-3xl prose-st">
      <h1 className="font-display text-4xl text-azul font-extrabold mb-2">Política de Privacidad</h1>
      <p className="text-sm text-gris-3 mb-8">Última actualización: {new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</p>

      <div className="space-y-8 text-gris-4 leading-relaxed">
        <section>
          <h2 className="font-display text-2xl text-azul mt-6 mb-3">1. Información que recopilamos</h2>
          <p>Recopilamos los siguientes datos:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Datos de registro</strong> (técnicos): email, nombre, teléfono, dirección, fotos, descripción del negocio.</li>
            <li><strong>Datos de uso</strong>: visitas, búsquedas, clicks en perfiles (anonimizados).</li>
            <li><strong>Datos de cotización</strong> (clientes): nombre, email, teléfono, descripción del trabajo solicitado.</li>
            <li><strong>Reseñas</strong>: nombre del autor, opiniones, calificaciones.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-azul mt-6 mb-3">2. Cómo usamos tus datos</h2>
          <p>Usamos tus datos para:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Mostrar perfiles de técnicos al público.</li>
            <li>Facilitar contacto entre cliente y técnico.</li>
            <li>Enviar notificaciones (cotizaciones, reseñas, recordatorios).</li>
            <li>Mejorar el servicio a través de estadísticas agregadas.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-azul mt-6 mb-3">3. Compartir datos con terceros</h2>
          <p>No vendemos tus datos. Solo los compartimos con:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Flow.cl</strong> para procesar pagos.</li>
            <li><strong>Resend</strong> para enviar emails transaccionales.</li>
            <li><strong>Supabase</strong> donde se almacena nuestra base de datos.</li>
            <li><strong>Vercel</strong> donde está alojado el sitio.</li>
          </ul>
          <p className="mt-2">Estos proveedores son confiables y tienen sus propias políticas de privacidad.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-azul mt-6 mb-3">4. Cookies</h2>
          <p>Usamos cookies para mantener tu sesión iniciada y recordar tus preferencias. No usamos cookies de seguimiento de terceros para publicidad.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-azul mt-6 mb-3">5. Tus derechos</h2>
          <p>Conforme a la Ley 19.628 sobre Protección de Datos Personales en Chile, tienes derecho a:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Acceder a tus datos.</li>
            <li>Modificarlos en cualquier momento desde tu dashboard.</li>
            <li>Solicitar su eliminación enviando un email a <a href="mailto:hola@solotecnicos.cl" className="text-azul-mid hover:underline">hola@solotecnicos.cl</a>.</li>
            <li>Oponerte al tratamiento de tus datos.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-azul mt-6 mb-3">6. Seguridad</h2>
          <p>Usamos cifrado HTTPS en todo el sitio, contraseñas hasheadas (bcrypt) y RLS (Row-Level Security) en la base de datos. Aun así, ningún sistema es 100% inviolable; te recomendamos usar contraseñas seguras y únicas.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-azul mt-6 mb-3">7. Menores de edad</h2>
          <p>El servicio está dirigido a mayores de 18 años. No recopilamos intencionalmente datos de menores.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-azul mt-6 mb-3">8. Contacto</h2>
          <p>Si tienes dudas sobre esta política: <a href="mailto:hola@solotecnicos.cl" className="text-azul-mid hover:underline">hola@solotecnicos.cl</a></p>
        </section>
      </div>
    </div>
  )
}
