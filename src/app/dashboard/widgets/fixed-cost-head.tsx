'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

interface FixedCostHeadProps {
  data?: {
    total: number;
    per_head: number;
    breakdown: { category: string; amount: number }[];
  };
  loading: boolean;
}

const categoryColors: Record<string, 'teal' | 'amber' | 'purple' | 'red' | 'gray'> = {
  rent: 'purple',
  gas: 'amber',
  electricity: 'amber',
  internet: 'teal',
  other: 'gray',
};

export function FixedCostHead({ data, loading }: FixedCostHeadProps) {
  if (loading) {
    return (
      <GlassCard hover={false}>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Fixed Cost / Head
        </p>
        <Skeleton className="h-10 w-32" />
        <Skeleton className="mt-2 h-3 w-24" />
      </GlassCard>
    );
  }

  return (
    <GlassCard hover={false}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
        Fixed Cost / Head
      </p>

      <p className="text-3xl font-bold text-fixed">
        {formatCurrency(Math.round(data?.per_head || 0))}
      </p>
      <p className="mt-1 text-xs text-text-muted">
        {formatCurrency(Math.round(data?.total || 0))} ÷ 6 members
      </p>

      {data?.breakdown && data.breakdown.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.breakdown.map((item) => (
            <Badge
              key={item.category}
              variant={categoryColors[item.category] || 'gray'}
            >
              {item.category}: {formatCurrency(item.amount)}
            </Badge>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
