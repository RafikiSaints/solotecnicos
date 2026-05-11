import { cn } from '@/lib/utils'

type Tone = 'verde' | 'oro' | 'azul' | 'rojo' | 'gris'

export function Badge({
  tone = 'gris',
  children,
  className,
}: { tone?: Tone; children: React.ReactNode; className?: string }) {
  const map: Record<Tone, string> = {
    verde: 'bg-verde/10 text-verde',
    oro:   'bg-oro/10 text-oro',
    azul:  'bg-azul/10 text-azul',
    rojo:  'bg-rojo/10 text-rojo',
    gris:  'bg-papel text-gris-4 border border-borde',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded', map[tone], className)}>
      {children}
    </span>
  )
}
