import { Heading, Section, Text, Link } from '@react-email/components'
import { EmailLayout, btn, txt } from './_layout'

export default function PagoFallido({ tecnicoNombre }: { tecnicoNombre: string }) {
  const url = process.env.NEXT_PUBLIC_APP_URL || 'https://solotecnicos.cl'
  return (
    <EmailLayout preview="Tu pago falló — tienes 3 días de gracia">
      <Heading style={{ color: '#C8102E', fontFamily: 'Georgia, serif', fontSize: 24 }}>
        Tu pago no pudo procesarse
      </Heading>
      <Text style={txt}>Hola {tecnicoNombre}, no pudimos cobrar tu suscripción.</Text>
      <Text style={txt}>Tienes <strong>3 días de gracia</strong> para actualizar tu medio de pago antes de que tu plan se degrade a Gratis.</Text>
      <Section style={{ margin: '24px 0' }}>
        <Link href={`${url}/dashboard/plan`} style={btn}>Actualizar pago</Link>
      </Section>
    </EmailLayout>
  )
}
