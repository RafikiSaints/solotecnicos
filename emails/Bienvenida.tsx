import { Heading, Section, Text, Link } from '@react-email/components'
import { EmailLayout, btn, txt } from './_layout'

export default function Bienvenida({ nombre }: { nombre: string }) {
  const url = process.env.NEXT_PUBLIC_APP_URL || 'https://solotecnicos.cl'
  return (
    <EmailLayout preview="Bienvenido a SoloTécnicos">
      <Heading style={{ color: '#0D2444', fontFamily: 'Georgia, serif', fontSize: 28 }}>
        Bienvenido, {nombre} 👋
      </Heading>
      <Text style={txt}>Tu cuenta está lista. Ahora hagamos que tu perfil destaque.</Text>
      <Text style={txt}><strong>Próximos pasos:</strong></Text>
      <ol style={txt}>
        <li>Completa tu información de contacto</li>
        <li>Sube fotos de tus trabajos</li>
        <li>Agrega tus servicios y precios</li>
      </ol>
      <Section style={{ margin: '24px 0' }}>
        <Link href={`${url}/dashboard/perfil`} style={btn}>Completar mi perfil</Link>
      </Section>
      <Text style={txt}>Si necesitas ayuda, responde este email.</Text>
    </EmailLayout>
  )
}
