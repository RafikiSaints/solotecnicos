import { Skeleton } from '@/components/ui/Skeleton'

export function TarjetaTecnicoSkeleton() {
  return (
    <div className="bg-white border border-borde rounded-lg p-4">
      <div className="grid grid-cols-[120px_1fr] gap-4">
        <Skeleton className="h-32 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}
