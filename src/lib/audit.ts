import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Log an audit event with the actor's real name.
 * NEVER use "Admin" — always the actual person's display name.
 */
export async function logAudit(
  supabase: SupabaseClient,
  actorId: string,
  actorName: string,
  eventType: string,
  description: string,
  metadata: Record<string, unknown> = {}
) {
  await supabase.from('audit_logs').insert({
    user_id: actorId,
    event_type: eventType,
    description, // full human-readable sentence
    metadata: { actor_id: actorId, actor_name: actorName, ...metadata },
  });
}

/** Format amount with ৳ for audit descriptions */
export function auditAmount(amount: number): string {
  return `৳${amount.toLocaleString('en-IN')}`;
}

/** Format date for audit descriptions (e.g., "Jun 25, 2026") */
export function auditDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
