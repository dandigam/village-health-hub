import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  type?: 'table' | 'cards' | 'full';
  message?: string;
}

export function PageLoader({ type = 'full', message = 'Loading...' }: PageLoaderProps) {
  if (type === 'table') {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="space-y-6 p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
