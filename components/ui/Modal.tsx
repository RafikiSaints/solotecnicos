'use client'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) {
      document.addEventListener('keydown', onEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="absolute inset-0 bg-azul/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full bg-white rounded-xl shadow-card border border-borde', sizes[size])}>
        {title && (
          <div className="flex items-center justify-between border-b border-borde p-5">
            <h3 className="font-display text-xl text-azul">{title}</h3>
            <button onClick={onClose} className="p-1 rounded hover:bg-papel">
              <X size={18} />
            </button>
          </div>
        )}
        {!title && (
          <button onClick={onClose} className="absolute right-3 top-3 z-10 p-1.5 rounded hover:bg-papel">
            <X size={18} />
          </button>
        )}
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
