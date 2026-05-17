/**
 * Genera la plantilla Excel para importar técnicos masivamente.
 *
 * Uso:
 *   npx tsx scripts/generar-plantilla.ts
 *
 * Output: scripts/plantilla-tecnicos.xlsx (4 hojas)
 *   - Plantilla    → 20 filas vacías + 1 ejemplo (Hospital del Computador)
 *   - Regiones     → slugs y nombres de referencia
 *   - Categorías   → slugs y nombres de referencia
 *   - Instrucciones → cómo llenarla
 */
import ExcelJS from 'exceljs'
import path from 'path'

const REGIONES: { slug: string; nombre: string }[] = [
  { slug: 'arica-parinacota',   nombre: 'Arica y Parinacota' },
  { slug: 'tarapaca',           nombre: 'Tarapacá' },
  { slug: 'antofagasta',        nombre: 'Antofagasta' },
  { slug: 'atacama',            nombre: 'Atacama' },
  { slug: 'coquimbo',           nombre: 'Coquimbo' },
  { slug: 'valparaiso',         nombre: 'Valparaíso' },
  { slug: 'metropolitana',      nombre: 'Metropolitana' },
  { slug: 'ohiggins',           nombre: 'O\'Higgins' },
  { slug: 'maule',              nombre: 'Maule' },
  { slug: 'nuble',              nombre: 'Ñuble' },
  { slug: 'biobio',             nombre: 'Biobío' },
  { slug: 'araucania',          nombre: 'Araucanía' },
  { slug: 'los-rios',           nombre: 'Los Ríos' },
  { slug: 'los-lagos',          nombre: 'Los Lagos' },
  { slug: 'aysen',              nombre: 'Aysén' },
  { slug: 'magallanes',         nombre: 'Magallanes' },
]

const CATEGORIAS: { slug: string; nombre: string }[] = [
  { slug: 'climatizacion',  nombre: 'Climatización' },
  { slug: 'computadores',   nombre: 'Computadores y notebooks' },
  { slug: 'celulares',      nombre: 'Celulares y smartphones' },
  { slug: 'electricidad',   nombre: 'Electricidad' },
  { slug: 'gasfiteria',     nombre: 'Gasfitería' },
  { slug: 'tv-audio',       nombre: 'TV y audio' },
  { slug: 'refrigeracion',  nombre: 'Refrigeración' },
  { slug: 'lavadoras',      nombre: 'Lavadoras y secadoras' },
  { slug: 'mecanica',       nombre: 'Mecánica automotriz' },
  { slug: 'cerrajeria',     nombre: 'Cerrajería' },
  { slug: 'impresoras',     nombre: 'Impresoras' },
  { slug: 'industrial',     nombre: 'Industrial y maquinaria' },
  { slug: 'calefaccion',    nombre: 'Calefacción' },
  { slug: 'camaras',        nombre: 'Cámaras de seguridad' },
  { slug: 'redes',          nombre: 'Redes y WiFi' },
  { slug: 'consolas',       nombre: 'Consolas' },
  { slug: 'impresoras-3d',  nombre: 'Impresoras 3d' },
  { slug: 'artesanias',     nombre: 'Artesanías' },
  // Las nuevas que sugerí (si las agregaste con el SQL)
  { slug: 'pintura',        nombre: 'Pintura' },
  { slug: 'albanileria',    nombre: 'Albañilería' },
  { slug: 'carpinteria',    nombre: 'Carpintería' },
  { slug: 'jardineria',     nombre: 'Jardinería' },
  { slug: 'limpieza',       nombre: 'Limpieza' },
  { slug: 'mudanzas',       nombre: 'Mudanzas y fletes' },
  { slug: 'soldadura',      nombre: 'Soldadura' },
  { slug: 'vidrieria',      nombre: 'Vidriería' },
  { slug: 'aluminio',       nombre: 'Aluminio y PVC' },
  { slug: 'pisos',          nombre: 'Pisos y cerámica' },
  { slug: 'drywall',        nombre: 'Drywall y yeso' },
  { slug: 'techos',         nombre: 'Techos y techumbres' },
  { slug: 'cortinas',       nombre: 'Cortinas y persianas' },
  { slug: 'tapiceria',      nombre: 'Tapicería' },
  { slug: 'plagas',         nombre: 'Plagas y desratización' },
  { slug: 'paneles-solares', nombre: 'Paneles solares' },
  { slug: 'termos',         nombre: 'Termos y calefones' },
  { slug: 'bombas-agua',    nombre: 'Bombas de agua' },
  { slug: 'antenas',        nombre: 'Antenas y TV cable' },
  { slug: 'domotica',       nombre: 'Domótica' },
  { slug: 'soporte-remoto', nombre: 'Soporte técnico remoto' },
  { slug: 'desarrollo-web', nombre: 'Desarrollo web' },
  { slug: 'microondas',     nombre: 'Microondas' },
  { slug: 'hornos',         nombre: 'Hornos y cocinas' },
  { slug: 'aspiradoras',    nombre: 'Aspiradoras' },
  { slug: 'maquinas-coser', nombre: 'Máquinas de coser' },
  { slug: 'vulcanizacion',  nombre: 'Vulcanización' },
  { slug: 'pintura-auto',   nombre: 'Pintura automotriz' },
  { slug: 'motos',          nombre: 'Mecánica de motos' },
  { slug: 'bicicletas',     nombre: 'Mecánica de bicicletas' },
  { slug: 'sonido-auto',    nombre: 'Sonido automotriz' },
]

const COLUMNAS = [
  { key: 'nombre_empresa',       label: 'nombre_empresa',       width: 28, required: true,  example: 'Hospital del Computador' },
  { key: 'region_slug',          label: 'region_slug',          width: 18, required: true,  example: 'maule' },
  { key: 'categoria_slugs',      label: 'categoria_slugs',      width: 26, required: true,  example: 'computadores,celulares' },
  { key: 'comuna',               label: 'comuna',               width: 18, required: false, example: 'Talca' },
  { key: 'nombre_contacto',      label: 'nombre_contacto',      width: 22, required: false, example: 'Andrés Pérez' },
  { key: 'telefono',             label: 'telefono',             width: 18, required: false, example: '+56 9 1234 5678' },
  { key: 'whatsapp',             label: 'whatsapp',             width: 18, required: false, example: '+56 9 1234 5678' },
  { key: 'email_publico',        label: 'email_publico',        width: 26, required: false, example: 'contacto@hospitalcomp.cl' },
  { key: 'sitio_web',            label: 'sitio_web',            width: 26, required: false, example: 'https://hospitaldelcomputador.cl' },
  { key: 'direccion',            label: 'direccion',            width: 28, required: false, example: 'Av. 1 Norte 1234' },
  { key: 'descripcion_corta',    label: 'descripcion_corta',    width: 50, required: false, example: 'Reparación de notebooks y PCs en Talca con 10 años de experiencia.' },
  { key: 'etiquetas',            label: 'etiquetas',            width: 30, required: false, example: 'notebooks,SSD,pantalla,teclado' },
  { key: 'comunas_cobertura',    label: 'comunas_cobertura',    width: 30, required: false, example: 'Talca,Maule,San Clemente' },
  { key: 'link_google_maps',     label: 'link_google_maps',     width: 28, required: false, example: 'https://maps.app.goo.gl/abc123' },
  { key: 'link_google_business', label: 'link_google_business', width: 28, required: false, example: 'https://share.google/abc' },
  { key: 'google_rating',        label: 'google_rating',        width: 14, required: false, example: 5.0 },
  { key: 'google_total_resenas', label: 'google_total_resenas', width: 18, required: false, example: 21 },
  { key: 'facebook_url',         label: 'facebook_url',         width: 28, required: false, example: 'https://facebook.com/hospitaldelcomputador' },
  { key: 'instagram_url',        label: 'instagram_url',        width: 28, required: false, example: 'https://instagram.com/hospitaldelcomp' },
  { key: 'youtube_url',          label: 'youtube_url',          width: 28, required: false, example: '' },
  { key: 'tiktok_url',           label: 'tiktok_url',           width: 28, required: false, example: '' },
] as const

const FILAS_VACIAS = 25  // 1 ejemplo + 24 más para llenar (≥20)

async function main() {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'SoloTécnicos'
  wb.created = new Date()

  // ─── Hoja 1: Plantilla ────────────────────────────────────────────────
  const ws = wb.addWorksheet('Plantilla', {
    views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }],
  })

  // Headers
  ws.columns = COLUMNAS.map(c => ({
    header: c.label,
    key: c.key,
    width: c.width,
  }))

  // Estilo de headers
  const headerRow = ws.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }
  headerRow.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
  headerRow.height = 30

  // Marcar headers requeridos con asterisco visual y color de fondo distinto
  COLUMNAS.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1)
    if (col.required) {
      cell.value = `${col.label} *`
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } }
    }
  })

  // Fila 2: ejemplo (Hospital del Computador) con color verde claro
  const ejemploRow = ws.addRow(
    Object.fromEntries(COLUMNAS.map(c => [c.key, c.example]))
  )
  ejemploRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F7E6' } }
    cell.font = { italic: true, color: { argb: 'FF6B7280' } }
  })
  ejemploRow.getCell(1).note = 'Fila de ejemplo. Borrá o reemplazá con tus datos reales.'

  // Filas vacías para llenar
  for (let i = 0; i < FILAS_VACIAS; i++) {
    ws.addRow({})
  }

  // Validaciones de datos (dropdowns para region_slug y categoria_slugs)
  // region_slug: lista cerrada (col B)
  for (let r = 2; r < 2 + FILAS_VACIAS + 1; r++) {
    ws.getCell(`B${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${REGIONES.map(r => r.slug).join(',')}"`],
      showErrorMessage: true,
      errorTitle: 'Región inválida',
      error: 'Elegí una región de la lista. Ver hoja "Regiones".',
    }
  }
  // google_rating: número decimal entre 0 y 5 (col P, 16ª)
  for (let r = 2; r < 2 + FILAS_VACIAS + 1; r++) {
    ws.getCell(`P${r}`).dataValidation = {
      type: 'decimal',
      operator: 'between',
      formulae: [0, 5],
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: 'Rating inválido',
      error: 'El rating debe ser entre 0 y 5 (ej: 4.7)',
    }
  }
  // google_total_resenas: entero ≥ 0 (col Q, 17ª)
  for (let r = 2; r < 2 + FILAS_VACIAS + 1; r++) {
    ws.getCell(`Q${r}`).dataValidation = {
      type: 'whole',
      operator: 'greaterThanOrEqual',
      formulae: [0],
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: 'Cantidad inválida',
      error: 'Debe ser un número entero ≥ 0',
    }
  }

  // Filtros en la fila 1
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: COLUMNAS.length },
  }

  // ─── Hoja 2: Regiones ────────────────────────────────────────────────
  const wsR = wb.addWorksheet('Regiones')
  wsR.columns = [
    { header: 'slug (copiar en region_slug)', key: 'slug', width: 26 },
    { header: 'nombre', key: 'nombre', width: 28 },
  ]
  wsR.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  wsR.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }
  REGIONES.forEach(r => wsR.addRow(r))

  // ─── Hoja 3: Categorías ──────────────────────────────────────────────
  const wsC = wb.addWorksheet('Categorías')
  wsC.columns = [
    { header: 'slug (copiar en categoria_slugs)', key: 'slug', width: 28 },
    { header: 'nombre', key: 'nombre', width: 32 },
  ]
  wsC.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  wsC.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }
  CATEGORIAS.forEach(c => wsC.addRow(c))

  // ─── Hoja 4: Instrucciones ───────────────────────────────────────────
  const wsI = wb.addWorksheet('Instrucciones')
  wsI.columns = [{ width: 100 }]
  const lineas = [
    ['📋 INSTRUCCIONES — Plantilla de carga masiva de técnicos', { bold: true, size: 14, color: 'FF1E3A8A' }],
    ['', null],
    ['1. Ve a la hoja "Plantilla". La primera fila gris es el encabezado (no la modifiques).', null],
    ['   Los encabezados en rojo (con *) son OBLIGATORIOS: nombre_empresa, region_slug, categoria_slugs.', null],
    ['', null],
    ['2. La fila 2 está en verde claro: es solo un EJEMPLO. Bórrala antes de importar o reemplazala con un técnico real.', null],
    ['', null],
    ['3. Para cada técnico nuevo:', null],
    ['   • nombre_empresa: nombre del negocio (ej. "Hospital del Computador")', null],
    ['   • region_slug: usá la lista desplegable o copialo de la hoja "Regiones" (ej. "metropolitana")', null],
    ['   • categoria_slugs: una o varias separadas por coma (ej. "computadores,celulares")', null],
    ['   • comuna, teléfono, email, etc.: opcionales pero recomendados', null],
    ['', null],
    ['4. Campos que aceptan VARIOS valores (separados por coma):', null],
    ['   • categoria_slugs    → "computadores,celulares,impresoras"', null],
    ['   • etiquetas          → "SSD,pantalla,Samsung,iPhone"', null],
    ['   • comunas_cobertura  → "Talca,Maule,San Clemente"', null],
    ['', null],
    ['5. Google y redes sociales (todas opcionales):', null],
    ['   • google_rating: número decimal entre 0 y 5 (ej. 4.7)', null],
    ['   • google_total_resenas: número entero ≥ 0', null],
    ['   • facebook_url, instagram_url, youtube_url, tiktok_url: URL completa', null],
    ['', null],
    ['6. Cuando termines de llenar, guardá el archivo y corré desde la terminal:', null],
    ['     npx tsx scripts/importar-tecnicos.ts scripts/plantilla-tecnicos.xlsx', null],
    ['', null],
    ['7. El script muestra una vista previa antes de subir nada. Confirmás con "S" y se cargan todos en Supabase.', null],
    ['', null],
    ['IMPORTANTE:', { bold: true, color: 'FFEF4444' }],
    ['• Los técnicos se crean SIN propietario (user_id = null) — quedan "huérfanos" listos para reclamar.', null],
    ['• Cuando el técnico real se registre con el mismo email, podrá reclamar el perfil y completarlo.', null],
    ['• Si el script encuentra una región/categoría que no existe en tu BD, te avisa y te pide qué hacer.', null],
  ]
  lineas.forEach(([texto, fmt]) => {
    const row = wsI.addRow([texto])
    if (fmt) {
      row.getCell(1).font = { ...fmt as any }
    }
  })
  wsI.getColumn(1).alignment = { wrapText: true, vertical: 'top' }

  // Reordenar hojas: Plantilla primero, luego refs, luego instrucciones al final
  // ExcelJS no tiene reordenar directo; las hojas se guardan en el orden de creación

  // Output
  const out = path.join(process.cwd(), 'scripts', 'plantilla-tecnicos.xlsx')
  await wb.xlsx.writeFile(out)
  console.log(`✓ Plantilla generada: ${out}`)
  console.log(`  ${FILAS_VACIAS} filas listas para llenar (1 ejemplo + ${FILAS_VACIAS - 1} vacías)`)
}

main().catch(err => { console.error(err); process.exit(1) })
