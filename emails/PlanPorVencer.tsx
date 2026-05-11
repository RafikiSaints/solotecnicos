import { Heading, Section, Text, Link } from '@react-email/components'
import { EmailLayout, btn, txt } from './_layout'

export default function PlanPorVencer({ tecnicoNombre, venceEn }: { tecnicoNombre: string; venceEn: string }) {
  const url = process.env.NEXT_PUBLIC_APP_URL || 'https://solotecnicos.cl'
  const fecha = new Date(venceEn).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
  return (
    <EmailLayout preview="Tu plan vence en 7 días">
      <Heading style={{ color: '#0D2444', fontFamily: 'Georgia, serif', fontSize: 24 }}>
        Tu plan vence en 7 días ⏰
      </Heading>
      <Text style={txt}>Hola {tecnicoNombre},</Text>
      <Text style={txt}>Tu plan vence el <strong>{fecha}</strong>. Renueva ahora para no perder los beneficios premium.</Text>
      <Section style={{ margin: '24px 0' }}>
        <Link href={`${url}/dashboard/plan`} style={btn}>Renovar mi plan</Link>
      </Section>
    </EmailLayout>
  )
}
