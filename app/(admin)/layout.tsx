import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ToastContainer } from '@/components/ui/Toast'
import { AdminNav } from './AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'admin') redirect('/')

  return (
    <div className="lg:flex bg-azul/[0.02] min-h-screen">
      <AdminNav />
      <main className="flex-1 p-4 sm:p-6 lg:p-10 min-w-0">{children}</main>
      <ToastContainer />
    </div>
  )
}
