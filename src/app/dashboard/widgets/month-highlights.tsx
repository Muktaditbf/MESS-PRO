'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { UtensilsCrossed, Trophy, ShoppingCart, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MonthHighlightsProps {
  highlights?: {
    most_meals: { name: string; count: number } | null;
    top_depositor: { name: string; amount: number } | null;
    most_bazar_trips: { name: string; count: number } | null;
    least_meals: { name: string; count: number } | null;
  };
  loading: boolean;
}

export function MonthHighlights({ highlights, loading }: MonthHighlightsProps) {
  if (loading) {
    return (
      <GlassCard hover={false}>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Month Highlights
        </p>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1 rounded-lg bg-surface p-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  const items = [
    {
      icon: UtensilsCrossed,
      label: 'Most Meals',
      value: highlights?.most_meals?.name || '—',
      sub: highlights?.most_meals ? `${highlights.most_meals.count} meals` : '',
      color: 'text-teal',
    },
    {
      icon: Trophy,
      label: 'Top Depositor',
      value: highlights?.top_depositor?.name || '—',
      sub: highlights?.top_depositor ? formatCurrency(highlights.top_depositor.amount) : '',
      color: 'text-teal',
    },
    {
      icon: ShoppingCart,
      label: 'Most Bazar Trips',
      value: highlights?.most_bazar_trips?.name || '—',
      sub: highlights?.most_bazar_trips ? `${highlights.most_bazar_trips.count} trips` : '',
      color: 'text-warning',
    },
    {
      icon: TrendingDown,
      label: 'Least Meals',
      value: highlights?.least_meals?.name || '—',
      sub: highlights?.least_meals ? `${highlights.least_meals.count} meals` : '',
      color: 'text-text-muted',
    },
  ];

  return (
    <GlassCard hover={false}>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
        Month Highlights
      </p>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-surface-hover"
            >
              <div className="flex items-center gap-1.5">
                <Icon size={12} className={item.color} />
                <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
                  {item.label}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {item.value}
              </p>
              {item.sub && (
                <p className="text-[10px] text-text-muted">{item.sub}</p>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
