'use client'
import { Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const LABELS = ['', 'Muy malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente']

interface StarRatingProps {
  value: number
  onChange?: (v: number) => void
  readOnly?: boolean
  size?: number
  showLabel?: boolean
}

export function StarRating({ value, onChange, readOnly = false, size = 22, showLabel = true }: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  return (
    <div className="flex items-center gap-2">
      <div className="star-rating flex" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            type="button"
            key={n}
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHover(n)}
            onClick={() => !readOnly && onChange?.(n)}
            className="bg-transparent border-none cursor-pointer disabled:cursor-default"
            aria-label={`${n} estrellas`}
          >
            <Star
              size={size}
              fill={n <= display ? '#C89A2E' : 'transparent'}
              stroke={n <= display ? '#C89A2E' : '#8A877F'}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      {showLabel && display > 0 && (
        <span className={cn('text-xs font-medium', readOnly ? 'text-gris-3' : 'text-azul')}>
          {LABELS[display]}
        </span>
      )}
    </div>
  )
}

export function RatingDisplay({ value, totalResenas }: { value: number; totalResenas?: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-display text-2xl font-bold text-azul">{value.toFixed(1)}</span>
      <div className="flex">
        {[1, 2, 3, 4, 5].map(n => (
          <Star
            key={n}
            size={14}
            fill={value >= n - 0.25 ? '#C89A2E' : 'transparent'}
            stroke={value >= n - 0.25 ? '#C89A2E' : '#D8D5CE'}
            strokeWidth={1.5}
          />
        ))}
      </div>
      {totalResenas !== undefined && (
        <span className="text-xs text-gris-3">({totalResenas})</span>
      )}
    </div>
  )
}
