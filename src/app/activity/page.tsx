'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { GlassCard } from '@/components/ui/glass-card';
import { Avatar } from '@/components/ui/avatar';
import { Badge, getEventBadgeVariant, getEventLabel } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Clock, Lock, Filter } from 'lucide-react';
import type { AuditLog } from '@/lib/types';

export default function ActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const supabase = createClient();

  useEffect(() => {
    const fetchLogs = async () => {
      let query = supabase.from('audit_logs').select('*, profiles(name, avatar_color)').order('created_at', { ascending: false }).limit(100);

      if (filter !== 'all') {
        query = query.like('event_type', `%${filter}%`);
      }

      const { data } = await query;
      const enriched = (data || []).map((l: any) => ({
        ...l,
        actor_name: l.profiles?.name,
        actor_avatar_color: l.profiles?.avatar_color,
      }));
      setLogs(enriched);
      setLoading(false);
    };

    setLoading(true);
    fetchLogs();
  }, [filter, supabase]);

  return (
    <AppShell>
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Clock size={20} className="text-teal" /> Audit Log
            </h1>
            <p className="text-sm text-text-muted flex items-center gap-1.5 mt-1">
              <Lock size={12} /> Immutable record of all system activity
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-text-muted" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="glass-input !py-1.5 !pl-3 !pr-8 text-sm"
            >
              <option value="all">All Events</option>
              <option value="meal">Meals</option>
              <option value="bazar">Bazar</option>
              <option value="deposit">Deposits</option>
              <option value="fixed">Fixed Costs</option>
              <option value="member">Members</option>
            </select>
          </div>
        </div>

        <GlassCard hover={false} className="relative overflow-hidden">
          {/* Vertical timeline line */}
          <div className="absolute left-[39px] top-6 bottom-6 w-px bg-border z-0 hidden sm:block" />

          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex gap-4"><Skeleton variant="circle" className="h-10 w-10 shrink-0" /><div className="flex-1 space-y-2 py-1"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/4" /></div></div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center py-10 text-text-muted">No activity logs found for this filter.</p>
          ) : (
            <div className="space-y-6 relative z-10">
              {logs.map((log) => {
                const isDelete = log.event_type.includes('delete');
                const isEdit = log.event_type.includes('edit');
                
                return (
                  <div key={log.id} className="flex gap-4">
                    <Avatar
                      name={log.actor_name || '?'}
                      color={log.actor_avatar_color || '#00b4a6'}
                      size="lg"
                      className="shrink-0 ring-4 ring-base hidden sm:flex"
                    />
                    
                    <div className={`flex-1 rounded-xl bg-surface/50 p-4 border border-border/50 transition-colors hover:bg-surface ${
                      isDelete ? 'border-l-4 border-l-negative/70' : isEdit ? 'border-l-4 border-l-warning/70' : ''
                    }`}>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-semibold text-text-primary text-sm">
                          {log.actor_name || 'System'}
                        </span>
                        <Badge variant={getEventBadgeVariant(log.event_type)}>
                          {getEventLabel(log.event_type)}
                        </Badge>
                        <span className="text-xs text-text-muted ml-auto">
                          {formatDateTime(log.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {log.description}
                      </p>
                      
                      {log.metadata?.before && log.metadata?.after && (
                        <div className="mt-3 p-2 rounded bg-base/50 text-xs text-text-muted font-mono flex items-center gap-2 overflow-x-auto">
                          <span className="line-through opacity-70">{JSON.stringify(log.metadata.before)}</span>
                          <span className="text-text-secondary">→</span>
                          <span className="text-teal">{JSON.stringify(log.metadata.after)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
}
