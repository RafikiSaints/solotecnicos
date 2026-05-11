import { Heading, Section, Text, Link } from '@react-email/components'
import { EmailLayout, btn, txt } from './_layout'

export default function AlertaDemanda({ tecnicoNombre, region, busquedas }: { tecnicoNombre: string; region: string; busquedas: number }) {
  const url = process.env.NEXT_PUBLIC_APP_URL || 'https://solotecnicos.cl'
  return (
    <EmailLayout preview={`${busquedas} personas buscaron técnicos en ${region}`}>
      <Heading style={{ color: '#0D2444', fontFamily: 'Georgia, serif', fontSize: 24 }}>
        📈 Alta demanda en {region}
      </Heading>
      <Text style={txt}>Hola {tecnicoNombre},</Text>
      <Text style={txt}>
        Esta semana <strong>{busquedas} personas</strong> buscaron técnicos en <strong>{region}</strong>.
        Asegúrate de tener tu perfil al día para aparecer en los resultados.
      </Text>
      <Text style={txt}>Tip: los técnicos con perfil completo + fotos reciben hasta 3x más contactos.</Text>
      <Section style={{ margin: '24px 0' }}>
        <Link href={`${url}/dashboard/perfil`} style={btn}>Mejorar mi perfil</Link>
      </Section>
    </EmailLayout>
  )
}
