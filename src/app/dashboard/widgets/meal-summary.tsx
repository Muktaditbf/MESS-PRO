'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { MemberBalance } from '@/lib/types';
import { Pencil, Trash2 } from 'lucide-react';

interface MealSummaryProps {
  members: MemberBalance[];
  loading: boolean;
  isAdmin: boolean;
}

export function MealSummary({ members, loading, isAdmin }: MealSummaryProps) {
  const maxMeals = Math.max(...members.map((m) => m.meal_count), 1);

  if (loading) {
    return (
      <GlassCard hover={false}>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Meal Summary
        </p>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard hover={false}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Meal Summary
        </p>
        {isAdmin && (
          <div className="flex gap-1">
            <button className="flex h-5 w-5 items-center justify-center rounded text-text-muted transition-colors hover:text-teal">
              <Pencil size={11} />
            </button>
            <button className="flex h-5 w-5 items-center justify-center rounded text-text-muted transition-colors hover:text-negative">
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {members.map((member) => {
          const barWidth = (member.meal_count / maxMeals) * 100;

          return (
            <div key={member.id} className="flex items-center gap-2">
              <span className="w-16 shrink-0 truncate text-xs text-text-secondary">
                {member.name}
              </span>
              <div className="relative h-3 flex-1 overflow-hidden rounded bg-surface">
                <div
                  className="absolute inset-y-0 left-0 rounded bg-teal transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs font-semibold text-text-primary">
                {member.meal_count}
              </span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
