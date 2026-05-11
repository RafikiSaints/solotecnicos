'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TecnicoConRelaciones } from '@/types/database.types'

interface Filtros {
  q?: string
  regionId?: number
  categoriaId?: number
  ratingMin?: number
  ah24?: boolean
  domicilio?: boolean
  verificado?: boolean
}

export function useBusqueda(filtros: Filtros) {
  const supabase = createClient()
  const [tecnicos, setTecnicos] = useState<TecnicoConRelaciones[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function buscar() {
      setLoading(true)
      let q = supabase.from('tecnicos')
        .select('*, regiones(nombre), tecnico_fotos(url, es_portada)')
        .eq('activo', true)
      if (filtros.regionId) q = q.eq('region_id', filtros.regionId)
      if (filtros.ratingMin) q = q.gte('rating_promedio', filtros.ratingMin)
      if (filtros.ah24) q = q.eq('atiende_24h', true)
      if (filtros.domicilio) q = q.eq('atiende_domicilio', true)
      if (filtros.verificado) q = q.eq('verificado', true)
      if (filtros.q) q = q.or(`nombre_empresa.ilike.%${filtros.q}%,descripcion.ilike.%${filtros.q}%`)
      const { data } = await q.order('plan', { ascending: false }).order('rating_promedio', { ascending: false }).limit(40)
      setTecnicos((data || []) as any)
      setLoading(false)
    }
    buscar()
  }, [filtros.q, filtros.regionId, filtros.categoriaId, filtros.ratingMin, filtros.ah24, filtros.domicilio, filtros.verificado])

  return { tecnicos, loading }
}
