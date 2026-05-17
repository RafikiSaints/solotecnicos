/**
 * Importa técnicos masivamente desde la plantilla Excel a Supabase.
 *
 * Uso:
 *   npx tsx scripts/importar-tecnicos.ts scripts/plantilla-tecnicos.xlsx
 *
 * Requisitos en .env (lee del mismo .env.local que la app):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Comportamiento:
 *   - Lee la hoja "Plantilla" del Excel
 *   - Valida que cada fila tenga: nombre_empresa, region_slug, categoria_slugs
 *   - Resuelve region_slug → region_id buscando en tabla regiones
 *   - Resuelve categoria_slugs → categoria_ids buscando en tabla categorias
 *   - Muestra una vista previa con los técnicos a crear
 *   - Pide confirmación interactiva
 *   - Inserta tecnicos + tecnico_categorias en BD
 *   - Los técnicos quedan con user_id=null (sin reclamar)
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import ExcelJS from 'exceljs'
import { createClient } from '@supabase/supabase-js'

// Cargar .env.local manualmente si dotenv solo cargó .env
const envLocal = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envLocal)) {
  const content = fs.readFileSync(envLocal, 'utf-8')
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"\n]+)"?$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env / .env.local')
  process.exit(1)
}
const sb = createClient(URL, KEY, { auth: { persistSession: false } })

type Fila = {
  rowNum: number
  nombre_empresa: string
  region_slug: string
  categoria_slugs: string[]
  comuna?: string | null
  nombre_contacto?: string | null
  telefono?: string | null
  whatsapp?: string | null
  email_publico?: string | null
  sitio_web?: string | null
  direccion?: string | null
  descripcion_corta?: string | null
  etiquetas?: string[] | null
  comunas_cobertura?: string[] | null
  link_google_maps?: string | null
  link_google_business?: string | null
  google_rating?: number | null
  google_total_resenas?: number | null
  facebook_url?: string | null
  instagram_url?: string | null
  youtube_url?: string | null
  tiktok_url?: string | null
}

function trimOrNull(v: any): string | null {
  if (v === undefined || v === null) return null
  const s = String(v).trim()
  return s ? s : null
}
function splitList(v: any): string[] {
  const s = trimOrNull(v)
  if (!s) return []
  return s.split(/[,;]/).map(x => x.trim()).filter(Boolean)
}
function getCell(row: ExcelJS.Row, label: string, headers: string[]): any {
  // Match por label limpio (quitar " *" del header obligatorio)
  const cleanHeaders = headers.map(h => (h || '').replace(/\s*\*\s*$/, '').trim())
  const idx = cleanHeaders.indexOf(label)
  if (idx === -1) return null
  const cell = row.getCell(idx + 1)
  const v = cell.value
  // Si la celda es una fórmula, usar .result
  if (v && typeof v === 'object' && 'result' in v) return (v as any).result
  if (v && typeof v === 'object' && 'text' in v) return (v as any).text
  return v
}

async function leerExcel(file: string): Promise<Fila[]> {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(file)
  const ws = wb.getWorksheet('Plantilla')
  if (!ws) throw new Error('No se encontró la hoja "Plantilla" en el Excel')

  const headerRow = ws.getRow(1)
  const headers: string[] = []
  headerRow.eachCell((cell, col) => { headers[col - 1] = String(cell.value || '') })

  const filas: Fila[] = []
  ws.eachRow((row, num) => {
    if (num === 1) return // header
    const nombre = trimOrNull(getCell(row, 'nombre_empresa', headers))
    if (!nombre) return // fila vacía

    filas.push({
      rowNum: num,
      nombre_empresa: nombre,
      region_slug: trimOrNull(getCell(row, 'region_slug', headers)) || '',
      categoria_slugs: splitList(getCell(row, 'categoria_slugs', headers)),
      comuna:               trimOrNull(getCell(row, 'comuna', headers)),
      nombre_contacto:      trimOrNull(getCell(row, 'nombre_contacto', headers)),
      telefono:             trimOrNull(getCell(row, 'telefono', headers)),
      whatsapp:             trimOrNull(getCell(row, 'whatsapp', headers)),
      email_publico:        trimOrNull(getCell(row, 'email_publico', headers)),
      sitio_web:            trimOrNull(getCell(row, 'sitio_web', headers)),
      direccion:            trimOrNull(getCell(row, 'direccion', headers)),
      descripcion_corta:    trimOrNull(getCell(row, 'descripcion_corta', headers)),
      etiquetas:            splitList(getCell(row, 'etiquetas', headers)),
      comunas_cobertura:    splitList(getCell(row, 'comunas_cobertura', headers)),
      link_google_maps:     trimOrNull(getCell(row, 'link_google_maps', headers)),
      link_google_business: trimOrNull(getCell(row, 'link_google_business', headers)),
      google_rating:        (() => { const v = getCell(row, 'google_rating', headers); return v == null || v === '' ? null : Number(v) })(),
      google_total_resenas: (() => { const v = getCell(row, 'google_total_resenas', headers); return v == null || v === '' ? null : parseInt(String(v)) })(),
      facebook_url:         trimOrNull(getCell(row, 'facebook_url', headers)),
      instagram_url:        trimOrNull(getCell(row, 'instagram_url', headers)),
      youtube_url:          trimOrNull(getCell(row, 'youtube_url', headers)),
      tiktok_url:           trimOrNull(getCell(row, 'tiktok_url', headers)),
    })
  })

  return filas
}

async function confirmar(prompt: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(prompt, ans => {
      rl.close()
      resolve(ans.trim().toLowerCase().startsWith('s'))
    })
  })
}

async function main() {
  const file = process.argv[2] || path.join('scripts', 'plantilla-tecnicos.xlsx')
  if (!fs.existsSync(file)) {
    console.error(`❌ No existe el archivo: ${file}`)
    process.exit(1)
  }
  console.log(`📖 Leyendo: ${file}`)

  const filas = await leerExcel(file)
  if (filas.length === 0) {
    console.log('No hay filas para importar (todas las filas están vacías).')
    return
  }

  // Cargar regiones y categorías de la BD
  console.log('🔎 Cargando regiones y categorías desde Supabase...')
  const [{ data: regiones }, { data: categorias }] = await Promise.all([
    sb.from('regiones').select('id, slug, nombre'),
    sb.from('categorias').select('id, slug, nombre'),
  ])
  const regMap = new Map((regiones || []).map((r: any) => [r.slug, r]))
  const catMap = new Map((categorias || []).map((c: any) => [c.slug, c]))

  // Validar todas las filas antes de empezar
  const errores: string[] = []
  const filasValidas: (Fila & { region_id: number; categoria_ids: number[] })[] = []
  for (const f of filas) {
    if (!f.region_slug) { errores.push(`Fila ${f.rowNum} "${f.nombre_empresa}": falta region_slug`); continue }
    const reg = regMap.get(f.region_slug)
    if (!reg) { errores.push(`Fila ${f.rowNum} "${f.nombre_empresa}": region_slug "${f.region_slug}" no existe en BD`); continue }
    if (f.categoria_slugs.length === 0) { errores.push(`Fila ${f.rowNum} "${f.nombre_empresa}": falta categoria_slugs (al menos 1)`); continue }
    const catIds: number[] = []
    const catFaltantes: string[] = []
    for (const slug of f.categoria_slugs) {
      const c = catMap.get(slug)
      if (c) catIds.push((c as any).id)
      else catFaltantes.push(slug)
    }
    if (catFaltantes.length > 0) {
      errores.push(`Fila ${f.rowNum} "${f.nombre_empresa}": categorías inexistentes: ${catFaltantes.join(', ')}`)
      continue
    }
    filasValidas.push({ ...f, region_id: (reg as any).id, categoria_ids: catIds })
  }

  if (errores.length > 0) {
    console.error(`\n❌ ${errores.length} error(es) de validación — corrige y vuelve a correr:\n`)
    errores.forEach(e => console.error('   • ' + e))
    if (filasValidas.length === 0) process.exit(1)
    console.log(`\n${filasValidas.length} filas SÍ son válidas. ¿Querés importar solo esas?`)
  }

  // Vista previa
  console.log(`\n📦 ${filasValidas.length} técnicos a importar:\n`)
  filasValidas.slice(0, 10).forEach(f => {
    console.log(`  • ${f.nombre_empresa.padEnd(34)} | ${f.region_slug.padEnd(15)} | ${f.categoria_slugs.join(', ')}`)
  })
  if (filasValidas.length > 10) console.log(`  ... y ${filasValidas.length - 10} más`)

  const ok = await confirmar('\n¿Importar todos? (s/N): ')
  if (!ok) { console.log('Cancelado.'); return }

  // Importar
  let ok_count = 0
  let fail_count = 0
  for (const f of filasValidas) {
    const { categoria_ids, region_id, rowNum, region_slug, categoria_slugs, ...resto } = f
    const insertPayload: any = {
      ...resto,
      region_id,
      etiquetas: resto.etiquetas?.length ? resto.etiquetas : null,
      comunas_cobertura: resto.comunas_cobertura?.length ? resto.comunas_cobertura : null,
    }
    const { data: tecnico, error } = await sb.from('tecnicos').insert(insertPayload).select('id').single()
    if (error || !tecnico) {
      console.error(`  ❌ "${f.nombre_empresa}": ${error?.message || 'error desconocido'}`)
      fail_count++
      continue
    }
    // Insertar relaciones de categorías
    const cats = categoria_ids.map(cid => ({ tecnico_id: tecnico.id, categoria_id: cid }))
    const { error: e2 } = await sb.from('tecnico_categorias').insert(cats)
    if (e2) {
      console.error(`  ⚠️  "${f.nombre_empresa}": creado pero falló asignar categorías: ${e2.message}`)
    }
    console.log(`  ✓ ${f.nombre_empresa}`)
    ok_count++
  }

  console.log(`\n✅ Listo. ${ok_count} creados, ${fail_count} fallidos.`)
  if (ok_count > 0) {
    console.log('Los técnicos quedaron como "sin reclamar" — cuando el técnico real se registre con su email podrá reclamar el perfil.')
  }
}

main().catch(err => { console.error('💥 ', err); process.exit(1) })
