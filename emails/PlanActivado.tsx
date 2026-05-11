import { Heading, Section, Text, Link } from '@react-email/components'
import { EmailLayout, btn, txt } from './_layout'

export default function PlanActivado({ tecnicoNombre, plan, venceEn }: { tecnicoNombre: string; plan: string; venceEn: string }) {
  const url = process.env.NEXT_PUBLIC_APP_URL || 'https://solotecnicos.cl'
  const fecha = new Date(venceEn).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
  return (
    <EmailLayout preview={`Plan ${plan} activado`}>
      <Heading style={{ color: '#0D2444', fontFamily: 'Georgia, serif', fontSize: 24 }}>
        ¡Plan {plan.toUpperCase()} activado! ✨
      </Heading>
      <Text style={txt}>Hola {tecnicoNombre}, tu pago fue confirmado.</Text>
      <Section style={{ background: '#F2F1EE', padding: 16, borderRadius: 8, margin: '16px 0' }}>
        <Text style={{ ...txt, margin: 0 }}><strong>Plan:</strong> {plan.toUpperCase()}</Text>
        <Text style={{ ...txt, marginTop: 4 }}><strong>Vence:</strong> {fecha}</Text>
      </Section>
      <Text style={txt}>Desde ahora tienes acceso a todos los beneficios de tu plan.</Text>
      <Section style={{ margin: '24px 0' }}>
        <Link href={`${url}/dashboard`} style={btn}>Ir al dashboard</Link>
      </Section>
    </EmailLayout>
  )
}
