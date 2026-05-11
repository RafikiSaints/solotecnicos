import { Heading, Section, Text, Link } from '@react-email/components'
import { EmailLayout, btn, txt } from './_layout'

export default function NuevoTecnicoZona({ nombre, region, categoria, tecnicoNombre, tecnicoSlug }: {
  nombre: string
  region: string
  categoria: string
  tecnicoNombre: string
  tecnicoSlug: string
}) {
  const url = process.env.NEXT_PUBLIC_APP_URL || 'https://solotecnicos.cl'
  return (
    <EmailLayout preview={`Nuevo técnico de ${categoria} en ${region}`}>
      <Heading style={{ color: '#0D2444', fontFamily: 'Georgia, serif', fontSize: 24 }}>
        Nuevo técnico en tu zona
      </Heading>
      <Text style={txt}>Hola {nombre},</Text>
      <Text style={txt}>
        Un nuevo técnico de <strong>{categoria}</strong> se registró en <strong>{region}</strong>.
      </Text>
      <Section style={{ background: '#F2F1EE', padding: 16, borderRadius: 8, margin: '16px 0' }}>
        <Text style={{ ...txt, margin: 0 }}><strong>{tecnicoNombre}</strong></Text>
      </Section>
      <Section style={{ margin: '24px 0' }}>
        <Link href={`${url}/tecnico/${tecnicoSlug}`} style={btn}>Ver perfil</Link>
      </Section>
    </EmailLayout>
  )
}
