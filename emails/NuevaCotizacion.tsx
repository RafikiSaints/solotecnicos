import { Heading, Section, Text, Link } from '@react-email/components'
import { EmailLayout, btn, txt } from './_layout'

interface Props {
  tecnicoNombre: string
  cliente: string
  descripcion: string
  plan: 'gratis' | 'pro' | 'elite'
}

export default function NuevaCotizacion({ tecnicoNombre, cliente, descripcion, plan }: Props) {
  const url = process.env.NEXT_PUBLIC_APP_URL || 'https://solotecnicos.cl'
  return (
    <EmailLayout preview={`Nueva cotización de ${cliente}`}>
      <Heading style={{ color: '#0D2444', fontFamily: 'Georgia, serif', fontSize: 24 }}>
        Nueva cotización 🔔
      </Heading>
      <Text style={txt}>Hola {tecnicoNombre}, recibiste una nueva solicitud de cotización.</Text>
      <Section style={{ background: '#F2F1EE', padding: 16, borderRadius: 8, margin: '16px 0' }}>
        <Text style={{ ...txt, margin: 0 }}><strong>De:</strong> {cliente}</Text>
        <Text style={{ ...txt, marginTop: 8 }}><strong>Descripción:</strong></Text>
        <Text style={txt}>{descripcion}</Text>
      </Section>
      {plan === 'gratis' && (
        <Text style={{ ...txt, color: '#8A877F', fontSize: 12 }}>
          💡 Con plan PRO ves las fotos del cliente y respondes en menos tiempo.
        </Text>
      )}
      <Section style={{ margin: '24px 0' }}>
        <Link href={`${url}/dashboard/mensajes`} style={btn}>Ver mensaje completo</Link>
      </Section>
    </EmailLayout>
  )
}
