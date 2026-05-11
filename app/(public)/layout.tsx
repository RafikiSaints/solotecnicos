import { TopStrip } from '@/components/layout/TopStrip'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ToastContainer } from '@/components/ui/Toast'
import { ComparadorBarra } from '@/components/directorio/ComparadorBarra'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopStrip />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ComparadorBarra />
      <ToastContainer />
    </>
  )
}
