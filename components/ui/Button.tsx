import { cn } from '@/lib/utils'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantCls: Record<Variant, string> = {
  primary:   'bg-rojo text-white hover:bg-rojo-hover shadow-sm',
  secondary: 'bg-azul text-white hover:bg-azul-mid',
  outline:   'border border-borde bg-white text-azul hover:border-azul hover:bg-papel',
  ghost:     'text-gris-4 hover:bg-papel hover:text-azul',
  danger:    'bg-rojo text-white hover:bg-rojo-hover',
}
const sizeCls: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        variantCls[variant],
        sizeCls[size],
        className
      )}
      {...props}
    >
      {loading ? <span className="inline-block h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : null}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
