import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://solotecnicos.cl'
  const sb = createServiceClient()

  const [tecnicos, categorias, regiones, blog] = await Promise.all([
    sb.from('tecnicos').select('slug, updated_at').eq('activo', true),
    sb.from('categorias').select('slug'),
    sb.from('regiones').select('slug'),
    sb.from('blog_articulos').select('slug, updated_at').eq('publicado', true),
  ])

  const estaticas: MetadataRoute.Sitemap = [
    '', '/buscar', '/planes', '/emergencias', '/comparar', '/registro-tecnico', '/blog',
  ].map(p => ({ url: `${base}${p}`, changeFrequency: 'daily', priority: p === '' ? 1 : 0.7 }))

  const dinamicas: MetadataRoute.Sitemap = [
    ...(tecnicos.data || []).map(t => ({
      url: `${base}/tecnico/${t.slug}`,
      lastModified: t.updated_at ?? undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...(categorias.data || []).map(c => ({
      url: `${base}/categoria/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...(regiones.data || []).map(r => ({
      url: `${base}/region/${r.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
    ...(blog.data || []).map(b => ({
      url: `${base}/blog/${b.slug}`,
      lastModified: b.updated_at ?? undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]

  return [...estaticas, ...dinamicas]
}
