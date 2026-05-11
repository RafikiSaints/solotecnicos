'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tecnico } from '@/types/database.types'

export function useTecnico() {
  const supabase = createClient()
  const [tecnico, setTecnico] = useState<Tecnico | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase.from('tecnicos').select('*').eq('user_id', user.id).single()
      setTecnico(data)
      setLoading(false)
    }
    load()
  }, [])

  return { tecnico, loading, refresh: () => setLoading(true) }
}
