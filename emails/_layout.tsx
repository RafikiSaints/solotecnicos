import {
  Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text,
} from '@react-email/components'

export function EmailLayout({
  preview,
  children,
}: { preview: string; children: React.ReactNode }) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ fontFamily: 'system-ui, sans-serif', background: '#F2F1EE', color: '#4A4840', margin: 0, padding: '24px' }}>
        <Container style={{ maxWidth: 580, background: '#FAFAF8', borderRadius: 12, border: '1px solid #D8D5CE', padding: '32px' }}>
          <Section style={{ marginBottom: 24 }}>
            <Heading style={{ color: '#0D2444', fontFamily: 'Georgia, serif', fontSize: 24, margin: 0 }}>
              SoloTécnicos
            </Heading>
          </Section>
          {children}
          <Section style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #D8D5CE' }}>
            <Text style={{ fontSize: 11, color: '#8A877F', margin: 0 }}>
              SoloTécnicos · El directorio de servicios técnicos en Chile<br />
              <Link href={process.env.NEXT_PUBLIC_APP_URL || 'https://solotecnicos.cl'} style={{ color: '#0D2444' }}>solotecnicos.cl</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const btn: React.CSSProperties = {
  display: 'inline-block',
  background: '#C8102E',
  color: '#fff',
  padding: '12px 24px',
  borderRadius: 6,
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: 14,
}

export const txt: React.CSSProperties = {
  fontSize: 14,
  color: '#4A4840',
  lineHeight: 1.6,
}
