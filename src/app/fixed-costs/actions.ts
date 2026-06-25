'use server';

import { createClient } from '@/lib/supabase/server';
import { logAudit, auditAmount } from '@/lib/audit';
import { getCurrentMonth, monthName } from '@/lib/utils';

export async function addFixedCost(category: string, amount: number, note?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: actor } = await supabase.from('profiles').select('name, role').eq('id', user.id).single();
  if (actor?.role !== 'admin') return { error: 'Admin only' };

  const { month, year } = getCurrentMonth();
  const { data: entry, error } = await supabase.from('fixed_costs').insert({
    category, amount, month, year, note: note || null, added_by: user.id,
  }).select().single();

  if (error) return { error: error.message };

  await logAudit(supabase, user.id, actor!.name, 'fixed_cost_add',
    `${actor!.name} added fixed cost — ${category.charAt(0).toUpperCase() + category.slice(1)}: ${auditAmount(amount)} (${monthName(month)} ${year})`,
    { category, amount, month, year, entity_id: entry.id }
  );

  return { success: true };
}

export async function editFixedCost(costId: string, category: string, amount: number, note?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: actor } = await supabase.from('profiles').select('name, role').eq('id', user.id).single();
  if (actor?.role !== 'admin') return { error: 'Admin only' };

  const { data: existing } = await supabase.from('fixed_costs').select('*').eq('id', costId).single();
  if (!existing) return { error: 'Not found' };

  const { error } = await supabase.from('fixed_costs').update({ category, amount, note: note || null }).eq('id', costId);
  if (error) return { error: error.message };

  const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
  await logAudit(supabase, user.id, actor!.name, 'fixed_cost_edit',
    `${actor!.name} edited ${catLabel} (${monthName(existing.month)} ${existing.year}): ${auditAmount(existing.amount)} → ${auditAmount(amount)}`,
    { before: { category: existing.category, amount: existing.amount }, after: { category, amount }, entity_id: costId }
  );

  return { success: true };
}

export async function deleteFixedCost(costId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: actor } = await supabase.from('profiles').select('name, role').eq('id', user.id).single();
  if (actor?.role !== 'admin') return { error: 'Admin only' };

  const { data: existing } = await supabase.from('fixed_costs').select('*').eq('id', costId).single();
  if (!existing) return { error: 'Not found' };

  const { error } = await supabase.from('fixed_costs').delete().eq('id', costId);
  if (error) return { error: error.message };

  const catLabel = existing.category.charAt(0).toUpperCase() + existing.category.slice(1);
  await logAudit(supabase, user.id, actor!.name, 'fixed_cost_delete',
    `${actor!.name} deleted fixed cost — ${catLabel}: ${auditAmount(existing.amount)} (${monthName(existing.month)} ${existing.year})`,
    { before: { category: existing.category, amount: existing.amount }, after: null, entity_id: costId }
  );

  return { success: true };
}
