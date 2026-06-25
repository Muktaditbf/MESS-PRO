'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import type { BazarRotation } from '@/lib/types';
import { Pencil } from 'lucide-react';

interface BazarRotationPreviewProps {
  slots: BazarRotation[];
  loading: boolean;
  isAdmin: boolean;
}

export function BazarRotationPreview({
  slots,
  loading,
  isAdmin,
}: BazarRotationPreviewProps) {
  if (loading) {
    return (
      <GlassCard hover={false}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Bazar Duty Rotation
          </p>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton variant="circle" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2.5 w-16" />
              </div>
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
          Bazar Duty Rotation
        </p>
        <div className="flex gap-1">
          <Badge variant="teal">Today</Badge>
          {isAdmin && (
            <button className="flex h-5 w-5 items-center justify-center rounded text-text-muted transition-colors hover:bg-surface-hover hover:text-text-secondary">
              <Pencil size={11} />
            </button>
          )}
        </div>
      </div>

      {slots.length === 0 ? (
        <p className="text-xs text-text-muted">No upcoming rotations</p>
      ) : (
        <div className="space-y-3">
          {slots.map((slot, i) => {
            const statusVariant =
              slot.status === 'done' ? 'teal' : slot.status === 'skipped' ? 'red' : 'gray';

            return (
              <div
                key={slot.id}
                className="flex items-center gap-3 animate-slide-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <Avatar
                  name={slot.member_name || '?'}
                  color={slot.member_avatar_color || '#00b4a6'}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {slot.member_name || 'Unknown'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatDate(slot.assigned_date)}
                  </p>
                </div>
                <Badge variant={statusVariant}>{slot.status}</Badge>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
