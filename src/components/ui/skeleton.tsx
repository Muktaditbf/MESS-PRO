'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  const baseClass = {
    text: 'h-4 w-full rounded',
    circle: 'h-9 w-9 rounded-full',
    rect: 'h-20 w-full rounded-xl',
  }[variant];

  return <div className={cn('skeleton', baseClass, className)} />;
}

/** Skeleton for a stat card */
export function StatCardSkeleton() {
  return (
    <div className="glass-card-static p-4">
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

/** Skeleton for a table row */
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
