import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})
const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://solotecnicos.cl'),
  title: {
    default: 'SoloTécnicos — Encuentra al mejor técnico cerca tuyo',
    template: '%s | SoloTécnicos',
  },
  description: 'Directorio de técnicos verificados en Chile. Reseñas reales, comparador y cotizaciones gratis.',
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: 'SoloTécnicos',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}
