import { Heading, Section, Text, Link } from '@react-email/components'
import { EmailLayout, btn, txt } from './_layout'

export default function PlanVencido({ tecnicoNombre }: { tecnicoNombre: string }) {
  const url = process.env.NEXT_PUBLIC_APP_URL || 'https://solotecnicos.cl'
  return (
    <EmailLayout preview="Tu plan venció — reactiva los beneficios">
      <Heading style={{ color: '#C8102E', fontFamily: 'Georgia, serif', fontSize: 24 }}>
        Tu plan venció
      </Heading>
      <Text style={txt}>Hola {tecnicoNombre}, tu plan PRO/Elite venció y tu cuenta volvió a Gratis.</Text>
      <Text style={txt}>Tus datos están a salvo, pero perdiste WhatsApp visible, estadísticas, agenda y más.</Text>
      <Section style={{ margin: '24px 0' }}>
        <Link href={`${url}/dashboard/plan`} style={btn}>Reactivar mi plan</Link>
      </Section>
    </EmailLayout>
  )
}
