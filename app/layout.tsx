import type { Metadata } from 'next'
import { Fraunces, Instrument_Sans } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
})
const instrument = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://solotecnicos.cl'),
  title: {
    default: 'SoloTécnicos — Directorio de servicios técnicos en Chile',
    template: '%s | SoloTécnicos',
  },
  description: 'El directorio más completo de técnicos verificados en Chile: climatización, computación, electricidad, gasfitería y más.',
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: 'SoloTécnicos',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${instrument.variable}`}>
      <body>{children}</body>
    </html>
  )
}
