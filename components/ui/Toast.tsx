'use client'
import { create } from 'zustand'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useEffect } from 'react'

type Tone = 'success' | 'error' | 'info'
interface ToastItem { id: number; message: string; tone: Tone }

interface ToastStore {
  items: ToastItem[]
  push: (message: string, tone?: Tone) => void
  remove: (id: number) => void
}
let nextId = 1
export const useToast = create<ToastStore>(set => ({
  items: [],
  push: (message, tone = 'success') => {
    const id = nextId++
    set(s => ({ items: [...s.items, { id, message, tone }] }))
    setTimeout(() => set(s => ({ items: s.items.filter(t => t.id !== id) })), 4000)
  },
  remove: id => set(s => ({ items: s.items.filter(t => t.id !== id) })),
}))

const icons = {
  success: <CheckCircle2 size={18} className="text-verde" />,
  error:   <AlertCircle size={18} className="text-rojo" />,
  info:    <Info size={18} className="text-azul" />,
}

export function ToastContainer() {
  const { items, remove } = useToast()
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {items.map(t => (
        <div key={t.id} className="flex items-center gap-3 bg-white border border-borde rounded-lg shadow-card px-4 py-3 min-w-[280px]">
          {icons[t.tone]}
          <span className="flex-1 text-sm text-azul">{t.message}</span>
          <button onClick={() => remove(t.id)} className="text-gris-3 hover:text-azul">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
