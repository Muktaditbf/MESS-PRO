'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';

interface MonthProgressProps {
  data?: {
    days_passed: number;
    total_days: number;
    percentage: number;
  };
  loading: boolean;
}

export function MonthProgress({ data, loading }: MonthProgressProps) {
  if (loading) {
    return (
      <GlassCard hover={false} className="flex flex-col items-center justify-center">
        <Skeleton variant="circle" className="h-32 w-32" />
      </GlassCard>
    );
  }

  const size = 140;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((data?.percentage || 0) / 100) * circumference;

  return (
    <GlassCard hover={false} className="flex flex-col items-center justify-center">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
        Month Progress
      </p>

      <div className="relative">
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#00b4a6"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-teal">
            {data?.percentage || 0}%
          </span>
        </div>
      </div>

      <p className="mt-2 text-xs text-text-muted">
        Day {data?.days_passed || 0} / {data?.total_days || 30}
      </p>
    </GlassCard>
  );
}
