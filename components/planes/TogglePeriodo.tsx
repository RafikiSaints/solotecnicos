'use client'

interface Props {
  periodo: 'mensual' | 'anual'
  onChange: (p: 'mensual' | 'anual') => void
}

export function TogglePeriodo({ periodo, onChange }: Props) {
  return (
    <div className="inline-flex items-center bg-papel rounded-full p-1 border border-borde">
      <button
        onClick={() => onChange('mensual')}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${periodo === 'mensual' ? 'bg-white text-azul shadow-sm' : 'text-gris-4'}`}
      >
        Mensual
      </button>
      <button
        onClick={() => onChange('anual')}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${periodo === 'anual' ? 'bg-white text-azul shadow-sm' : 'text-gris-4'}`}
      >
        Anual
        <span className="text-[10px] font-bold text-verde bg-verde/10 px-1.5 py-0.5 rounded-full">2 meses gratis</span>
      </button>
    </div>
  )
}
