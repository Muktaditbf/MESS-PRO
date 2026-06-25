'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { Avatar } from '@/components/ui/avatar';
import { Badge, getEventBadgeVariant, getEventLabel } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';
import type { AuditLog } from '@/lib/types';
import { Lock } from 'lucide-react';

interface RecentActivityProps {
  activities: AuditLog[];
  loading: boolean;
}

export function RecentActivity({ activities, loading }: RecentActivityProps) {
  if (loading) {
    return (
      <GlassCard hover={false}>
        <div className="mb-3 flex items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Recent Activity
          </p>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton variant="circle" className="h-7 w-7" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2.5 w-20" />
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
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Recent Activity
          </p>
          <span className="flex items-center gap-1 rounded bg-surface px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-text-muted">
            <Lock size={8} />
            Non-deletable
          </span>
        </div>
      </div>

      {activities.length === 0 ? (
        <p className="text-xs text-text-muted">No activity yet</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, i) => {
            const isDelete = activity.event_type?.includes('delete');
            const isEdit = activity.event_type?.includes('edit');

            return (
              <div
                key={activity.id}
                className={`flex items-start gap-3 rounded-lg px-2 py-1.5 animate-slide-in ${
                  isDelete ? 'border-l-2 border-negative' : isEdit ? 'border-l-2 border-warning' : ''
                }`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <Avatar
                  name={activity.actor_name || '?'}
                  color={activity.actor_avatar_color || '#00b4a6'}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-text-primary">
                      {activity.actor_name}
                    </span>
                    <Badge variant={getEventBadgeVariant(activity.event_type)}>
                      {getEventLabel(activity.event_type)}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-text-secondary line-clamp-2">
                    {activity.description}
                  </p>
                  <p className="mt-0.5 text-[10px] text-text-muted">
                    {formatDateTime(activity.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
