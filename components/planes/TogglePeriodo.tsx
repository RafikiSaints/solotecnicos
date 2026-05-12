'use client'

interface Props {
  periodo: 'mensual' | 'anual'
  onChange: (p: 'mensual' | 'anual') => void
}

export function TogglePeriodo({ periodo, onChange }: Props) {
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-gris-3">¿Cómo prefieres pagar?</div>
      <div className="inline-flex items-center bg-white rounded-full p-1.5 border-2 border-borde shadow-soft">
        <button
          onClick={() => onChange('mensual')}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${periodo === 'mensual' ? 'bg-azul text-white shadow-md' : 'text-gris-4 hover:text-azul'}`}
        >
          Mensual
        </button>
        <button
          onClick={() => onChange('anual')}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${periodo === 'anual' ? 'bg-azul text-white shadow-md' : 'text-gris-4 hover:text-azul'}`}
        >
          Anual
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${periodo === 'anual' ? 'bg-oro text-azul' : 'bg-verde/15 text-verde'}`}>
            ¡2 MESES GRATIS!
          </span>
        </button>
      </div>
      {periodo === 'anual' && (
        <div className="text-xs text-verde font-semibold animate-fade-in">
          💰 Ahorras hasta $29.880 al año
        </div>
      )}
    </div>
  )
}
