import { Heading, Section, Text, Link } from '@react-email/components'
import { EmailLayout, btn, txt } from './_layout'

interface Props {
  tecnicoNombre: string
  autor: string
  rating: number
  comentario: string
}

export default function ResenaRecibida({ tecnicoNombre, autor, rating, comentario }: Props) {
  const url = process.env.NEXT_PUBLIC_APP_URL || 'https://solotecnicos.cl'
  return (
    <EmailLayout preview={`Nueva reseña de ${autor}`}>
      <Heading style={{ color: '#1E3A8A', fontFamily: 'Georgia, serif', fontSize: 24 }}>
        ⭐ Nueva reseña recibida
      </Heading>
      <Text style={txt}>Hola {tecnicoNombre}, recibiste una nueva reseña.</Text>
      <Section style={{ background: '#F8FAFC', padding: 16, borderRadius: 8, margin: '16px 0', border: '1px solid #E2E8F0' }}>
        <Text style={{ ...txt, margin: 0 }}><strong>De:</strong> {autor}</Text>
        <Text style={{ ...txt, marginTop: 4 }}><strong>Promedio:</strong> {rating.toFixed(1)} / 5 ⭐</Text>
        <Text style={{ ...txt, marginTop: 8 }}><strong>Comentario:</strong></Text>
        <Text style={txt}>{comentario}</Text>
      </Section>
      <Text style={{ ...txt, color: '#64748B', fontSize: 12 }}>
        Importante: la reseña se publicará después de la revisión del equipo (24-48h).
      </Text>
      <Section style={{ margin: '24px 0' }}>
        <Link href={`${url}/dashboard/resenas`} style={btn}>Ver mis reseñas</Link>
      </Section>
    </EmailLayout>
  )
}
