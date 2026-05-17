# Scripts de carga masiva de técnicos

Dos scripts para llenar la BD rápido vía Excel:

## 1. Generar la plantilla Excel

```bash
npx tsx scripts/generar-plantilla.ts
```

Crea `scripts/plantilla-tecnicos.xlsx` con 4 hojas:

- **Plantilla** — donde llenás los datos. 25 filas listas (1 ejemplo "Hospital del Computador" + 24 vacías). Headers en rojo son obligatorios.
- **Regiones** — lista de slugs disponibles (copiá en `region_slug`).
- **Categorías** — lista de slugs disponibles (copiá en `categoria_slugs`).
- **Instrucciones** — guía paso a paso.

### Campos obligatorios

| Campo | Notas |
|---|---|
| `nombre_empresa` | Texto libre, ej: "ClimaTech Express" |
| `region_slug` | Slug de la región (ej: `metropolitana`, `maule`). Dropdown automático en Excel. |
| `categoria_slugs` | Una o varias, separadas por coma (ej: `computadores,celulares`) |

### Campos opcionales (todos)

- **Contacto:** `comuna`, `nombre_contacto`, `telefono`, `whatsapp`, `email_publico`, `sitio_web`, `direccion`
- **Marketing:** `descripcion_corta`, `etiquetas` (coma), `comunas_cobertura` (coma)
- **Google:** `link_google_maps`, `link_google_business`, `google_rating` (0-5), `google_total_resenas` (entero)
- **Redes:** `facebook_url`, `instagram_url`, `youtube_url`, `tiktok_url`

## 2. Importar a la base de datos

Llena el Excel (o varios — podés tener uno por categoría/región) y corre:

```bash
npx tsx scripts/importar-tecnicos.ts scripts/plantilla-tecnicos.xlsx
```

Lo que hace:

1. Lee la hoja `Plantilla`.
2. Valida que cada fila tenga `nombre_empresa`, `region_slug` y `categoria_slugs` válidos.
3. Resuelve `region_slug` y `categoria_slugs` contra tu BD (los IDs reales).
4. Muestra una **vista previa** con los primeros 10 técnicos a crear.
5. Pide confirmación interactiva (`s` para sí).
6. Inserta cada técnico con `user_id = null` (sin reclamar).
7. Crea las relaciones en `tecnico_categorias`.

Si alguna fila tiene errores (región inválida, categoría inexistente, etc.), te lo dice antes de empezar — corregís el Excel y volvés a correr.

### Requisitos

El script usa las mismas env vars que la app. Necesita estar en tu `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://cttokblcqlvinwihcvxj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Flujo recomendado

1. Generar plantilla una vez: `npx tsx scripts/generar-plantilla.ts`
2. Hacer una **copia** del Excel para cada categoría/región que quieras llenar (ej: `tecnicos-rm-climatizacion.xlsx`, `tecnicos-valpo-electricidad.xlsx`).
3. Llenar 20 técnicos por copia.
4. Importar uno por uno: `npx tsx scripts/importar-tecnicos.ts tecnicos-rm-climatizacion.xlsx`.
5. Cuando un técnico real se registre con el email que dejaste en `email_publico`, podrá reclamar el perfil desde su dashboard.
