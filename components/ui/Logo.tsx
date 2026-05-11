import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  withWordmark?: boolean
  variant?: 'dark' | 'light'
  className?: string
}

export function Logo({ size = 'md', withWordmark = true, variant = 'dark', className }: LogoProps) {
  const sizes = { sm: 28, md: 36, lg: 48 }
  const px = sizes[size]
  return (
    <Link href="/" className={cn('inline-flex items-center gap-2.5 group', className)}>
      <svg width={px} height={px} viewBox="0 0 100 100" className="shrink-0">
        <rect x="0" y="0" width="100" height="100" rx="14" fill="#0D2444" />
        <rect x="0" y="0" width="30" height="100" fill="#C8102E" />
        <polygon points="62,38 70,58 92,58 74,71 80,92 62,80 44,92 50,71 32,58 54,58" fill="#FAFAF8" />
      </svg>
      {withWordmark && (
        <span className={cn('font-display font-bold text-xl tracking-tight', variant === 'light' ? 'text-white' : 'text-azul')}>
          Solo<span className="font-light italic">Técnicos</span>
        </span>
      )}
    </Link>
  )
}
