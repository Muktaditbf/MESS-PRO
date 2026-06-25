'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import type { MemberBalance } from '@/lib/types';

interface MemberBalancesProps {
  members: MemberBalance[];
  loading: boolean;
}

export function MemberBalances({ members, loading }: MemberBalancesProps) {
  if (loading) {
    return (
      <GlassCard hover={false}>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Member Balances
        </p>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  const maxAbsBalance = Math.max(
    ...members.map((m) => Math.abs(m.net_balance)),
    1
  );

  return (
    <GlassCard hover={false}>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
        Member Balances
      </p>
      <div className="space-y-2.5">
        {members.map((member) => {
          const isPositive = member.net_balance >= 0;
          const barWidth = Math.min(
            (Math.abs(member.net_balance) / maxAbsBalance) * 100,
            100
          );

          return (
            <div key={member.id} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-xs text-text-secondary truncate">
                {member.name}
              </span>
              <div className="relative h-4 flex-1 overflow-hidden rounded bg-surface">
                <div
                  className="absolute inset-y-0 left-0 rounded transition-all duration-500"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: isPositive ? '#00b4a6' : '#f87171',
                  }}
                />
              </div>
              <span
                className="w-14 shrink-0 text-right text-xs font-medium"
                style={{ color: isPositive ? '#00b4a6' : '#f87171' }}
              >
                {isPositive ? '+' : ''}
                {formatCurrency(Math.round(member.net_balance))}
              </span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
