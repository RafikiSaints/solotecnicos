import { cn } from '@/lib/utils'
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className, id, ...props }, ref) => {
    const inputId = id || props.name
    return (
      <div>
        {label && <label htmlFor={inputId} className="label-st">{label}</label>}
        <input ref={ref} id={inputId} className={cn('input-st', error && 'border-rojo focus:border-rojo focus:ring-rojo/10', className)} {...props} />
        {error && <p className="mt-1 text-xs text-rojo">{error}</p>}
        {helper && !error && <p className="mt-1 text-xs text-gris-3">{helper}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helper?: string
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helper, className, id, ...props }, ref) => {
    const inputId = id || props.name
    return (
      <div>
        {label && <label htmlFor={inputId} className="label-st">{label}</label>}
        <textarea ref={ref} id={inputId} className={cn('input-st min-h-[100px]', error && 'border-rojo', className)} {...props} />
        {error && <p className="mt-1 text-xs text-rojo">{error}</p>}
        {helper && !error && <p className="mt-1 text-xs text-gris-3">{helper}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const inputId = id || props.name
    return (
      <div>
        {label && <label htmlFor={inputId} className="label-st">{label}</label>}
        <select ref={ref} id={inputId} className={cn('input-st bg-white', error && 'border-rojo', className)} {...props}>
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-rojo">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
