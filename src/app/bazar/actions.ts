'use server';

import { createClient } from '@/lib/supabase/server';
import { logAudit, auditAmount, auditDate } from '@/lib/audit';
import { getCurrentMonth } from '@/lib/utils';

export async function addBazar(amount: number, date: string, itemsNote?: string, dutyMemberId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: actor } = await supabase.from('profiles').select('name, role').eq('id', user.id).single();
  if (actor?.role !== 'admin') return { error: 'Admin only' };

  const { month, year } = getCurrentMonth();
  const { data: entry, error } = await supabase.from('bazar_entries').insert({
    amount, date, items_note: itemsNote || null,
    duty_member: dutyMemberId || null, added_by: user.id, month, year,
  }).select().single();

  if (error) return { error: error.message };

  await logAudit(supabase, user.id, actor!.name, 'bazar_add',
    `${actor!.name} logged bazar: ${auditAmount(amount)} on ${auditDate(date)}`,
    { amount, date, entity_id: entry.id }
  );

  // Auto-mark rotation done
  if (date) {
    await supabase.from('bazar_rotation').update({ status: 'done' }).eq('assigned_date', date).eq('status', 'upcoming');
  }

  return { success: true };
}

export async function editBazar(entryId: string, amount: number, date: string, itemsNote?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: actor } = await supabase.from('profiles').select('name, role').eq('id', user.id).single();
  if (actor?.role !== 'admin') return { error: 'Admin only' };

  const { data: existing } = await supabase.from('bazar_entries').select('*').eq('id', entryId).single();
  if (!existing) return { error: 'Not found' };

  const { error } = await supabase.from('bazar_entries').update({ amount, date, items_note: itemsNote || null }).eq('id', entryId);
  if (error) return { error: error.message };

  await logAudit(supabase, user.id, actor!.name, 'bazar_edit',
    `${actor!.name} edited bazar entry (${auditDate(existing.date)}): ${auditAmount(existing.amount)} → ${auditAmount(amount)}`,
    { before: { amount: existing.amount, date: existing.date }, after: { amount, date }, entity_id: entryId }
  );

  return { success: true };
}

export async function deleteBazar(entryId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: actor } = await supabase.from('profiles').select('name, role').eq('id', user.id).single();
  if (actor?.role !== 'admin') return { error: 'Admin only' };

  const { data: existing } = await supabase.from('bazar_entries').select('*').eq('id', entryId).single();
  if (!existing) return { error: 'Not found' };

  const { error } = await supabase.from('bazar_entries').delete().eq('id', entryId);
  if (error) return { error: error.message };

  await logAudit(supabase, user.id, actor!.name, 'bazar_delete',
    `${actor!.name} deleted bazar entry from ${auditDate(existing.date)} (was: ${auditAmount(existing.amount)})`,
    { before: { amount: existing.amount, date: existing.date }, after: null, entity_id: entryId }
  );

  return { success: true };
}
