import { Logo } from '@/components/ui/Logo'
import { ToastContainer } from '@/components/ui/Toast'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-papel">
      <header className="container-st py-5">
        <Logo size="md" />
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="text-center text-xs text-gris-3 py-5">
        © {new Date().getFullYear()} SoloTécnicos · <Link href="/" className="hover:text-azul">Volver al sitio</Link>
      </footer>
      <ToastContainer />
    </div>
  )
}
