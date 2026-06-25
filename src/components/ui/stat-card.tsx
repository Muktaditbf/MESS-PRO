'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from './glass-card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accent?: 'teal' | 'red' | 'amber' | 'purple' | 'default';
  subtitle?: string;
  loading?: boolean;
  className?: string;
}

const accentColors = {
  teal: 'text-teal',
  red: 'text-negative',
  amber: 'text-warning',
  purple: 'text-fixed',
  default: 'text-text-primary',
};

const accentBgColors = {
  teal: 'bg-teal-dim',
  red: 'bg-negative-dim',
  amber: 'bg-warning-dim',
  purple: 'bg-fixed-dim',
  default: 'bg-surface',
};

export function StatCard({
  label,
  value,
  icon,
  accent = 'default',
  subtitle,
  loading = false,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <GlassCard className={cn('animate-fade-up', className)}>
        <div className="space-y-3">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-8 w-32 rounded" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={cn('animate-fade-up', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            {label}
          </p>
          <p className={cn('text-2xl font-bold', accentColors[accent])}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-text-muted">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg',
              accentBgColors[accent]
            )}
          >
            <span className={cn('text-sm', accentColors[accent])}>
              {icon}
            </span>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
