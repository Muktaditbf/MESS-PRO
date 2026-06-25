'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit, auditAmount } from '@/lib/audit';
import { getCurrentMonth } from '@/lib/utils';

export async function addDeposit(memberId: string, amount: number, note?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: actor } = await supabase.from('profiles').select('name, role').eq('id', user.id).single();
  if (actor?.role !== 'admin') return { error: 'Admin only' };

  const { data: target } = await supabase.from('profiles').select('name').eq('id', memberId).single();
  const { month, year } = getCurrentMonth();

  const { data: deposit, error } = await supabase.from('deposits').insert({
    member_id: memberId,
    amount,
    month,
    year,
    note: note || null,
    added_by: user.id,
  }).select().single();

  if (error) return { error: error.message };

  await logAudit(supabase, user.id, actor!.name, 'deposit_add',
    `${actor!.name} added ${auditAmount(amount)} deposit for ${target?.name}`,
    { target_member_id: memberId, target_member_name: target?.name, amount, entity_id: deposit.id }
  );

  return { success: true };
}

export async function editDeposit(depositId: string, newAmount: number, newNote?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: actor } = await supabase.from('profiles').select('name, role').eq('id', user.id).single();
  if (actor?.role !== 'admin') return { error: 'Admin only' };

  const { data: existing } = await supabase.from('deposits').select('*, profiles(name)').eq('id', depositId).single();
  if (!existing) return { error: 'Not found' };

  const oldAmount = existing.amount;
  const targetName = (existing as unknown as Record<string, Record<string, string>>).profiles?.name || 'Unknown';

  const { error } = await supabase.from('deposits').update({ amount: newAmount, note: newNote || null }).eq('id', depositId);
  if (error) return { error: error.message };

  await logAudit(supabase, user.id, actor!.name, 'deposit_edit',
    `${actor!.name} edited ${targetName}'s deposit: ${auditAmount(oldAmount)} → ${auditAmount(newAmount)}`,
    { target_member_name: targetName, before: { amount: oldAmount }, after: { amount: newAmount }, entity_id: depositId }
  );

  return { success: true };
}

export async function deleteDeposit(depositId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: actor } = await supabase.from('profiles').select('name, role').eq('id', user.id).single();
  if (actor?.role !== 'admin') return { error: 'Admin only' };

  const { data: existing } = await supabase.from('deposits').select('*, profiles(name)').eq('id', depositId).single();
  if (!existing) return { error: 'Not found' };

  const targetName = (existing as unknown as Record<string, Record<string, string>>).profiles?.name || 'Unknown';

  const { error } = await supabase.from('deposits').delete().eq('id', depositId);
  if (error) return { error: error.message };

  await logAudit(supabase, user.id, actor!.name, 'deposit_delete',
    `${actor!.name} deleted ${targetName}'s deposit of ${auditAmount(existing.amount)}`,
    { target_member_name: targetName, before: { amount: existing.amount }, after: null, entity_id: depositId }
  );

  return { success: true };
}
