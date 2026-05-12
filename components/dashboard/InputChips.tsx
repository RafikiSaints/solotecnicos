'use client'
import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputChipsProps {
  label?: string
  values: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  helper?: string
}

/**
 * Input que convierte texto en chips al separar por coma o presionar Enter.
 * Ejemplo: "Las Condes, Vitacura" → 2 chips
 */
export function InputChips({ label, values, onChange, placeholder, helper }: InputChipsProps) {
  const [input, setInput] = useState('')

  function agregar(text: string) {
    const partes = text.split(',').map(s => s.trim()).filter(Boolean)
    const nuevos = partes.filter(p => !values.includes(p))
    if (nuevos.length) onChange([...values, ...nuevos])
    setInput('')
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (input.trim()) agregar(input)
    } else if (e.key === 'Backspace' && !input && values.length) {
      onChange(values.slice(0, -1))
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pegado = e.clipboardData.getData('text')
    if (pegado.includes(',')) {
      e.preventDefault()
      agregar(pegado)
    }
  }

  return (
    <div>
      {label && <label className="label-st">{label}</label>}
      <div className="input-st flex flex-wrap gap-1.5 min-h-[42px] py-2">
        {values.map(v => (
          <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-azul-mid/10 text-azul-mid text-xs font-medium">
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter(x => x !== v))}
              className="hover:text-rojo"
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => input.trim() && agregar(input)}
          placeholder={values.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
        />
      </div>
      {helper && <p className="mt-1 text-xs text-gris-3">{helper}</p>}
    </div>
  )
}
