'use server';

import { createClient } from '@/lib/supabase/server';
import { logAudit, auditDate } from '@/lib/audit';

export async function addMeal(memberId: string, date: string, count: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: actor } = await supabase.from('profiles').select('name, role').eq('id', user.id).single();
  const { data: target } = await supabase.from('profiles').select('name').eq('id', memberId).single();

  const isSelf = user.id === memberId;
  if (!isSelf && actor?.role !== 'admin') return { error: 'Cannot add meals for others' };

  const { data: meal, error } = await supabase.from('meals').insert({
    member_id: memberId,
    date,
    count,
    added_by: user.id,
  }).select().single();

  if (error) return { error: error.message };

  const eventType = isSelf ? 'meal_add' : 'meal_add_for';
  const desc = isSelf
    ? `${actor!.name} added ${count} meals on ${auditDate(date)}`
    : `${actor!.name} added ${count} meals for ${target?.name} on ${auditDate(date)}`;

  await logAudit(supabase, user.id, actor!.name, eventType, desc, {
    target_member_id: memberId, target_member_name: target?.name, count, date, entity_id: meal.id
  });

  return { success: true };
}

export async function editMeal(mealId: string, newCount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: actor } = await supabase.from('profiles').select('name, role').eq('id', user.id).single();
  const { data: existing } = await supabase.from('meals').select('*, profiles(name)').eq('id', mealId).single();
  if (!existing) return { error: 'Not found' };

  const isSelf = existing.member_id === user.id;
  if (!isSelf && actor?.role !== 'admin') return { error: 'Cannot edit others\' meals' };

  const oldCount = existing.count;
  const targetName = (existing as unknown as Record<string, Record<string, string>>).profiles?.name || 'Unknown';

  const { error } = await supabase.from('meals').update({ count: newCount, updated_at: new Date().toISOString() }).eq('id', mealId);
  if (error) return { error: error.message };

  const eventType = isSelf ? 'meal_edit' : 'meal_edit_for';
  const desc = isSelf
    ? `${actor!.name} edited their meals on ${auditDate(existing.date)}: ${oldCount} → ${newCount}`
    : `${actor!.name} edited ${targetName}'s meals on ${auditDate(existing.date)}: ${oldCount} → ${newCount}`;

  await logAudit(supabase, user.id, actor!.name, eventType, desc, {
    target_member_name: targetName, before: { count: oldCount }, after: { count: newCount }, entity_id: mealId
  });

  return { success: true };
}

export async function deleteMeal(mealId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: actor } = await supabase.from('profiles').select('name, role').eq('id', user.id).single();
  const { data: existing } = await supabase.from('meals').select('*, profiles(name)').eq('id', mealId).single();
  if (!existing) return { error: 'Not found' };

  const isSelf = existing.member_id === user.id;
  if (!isSelf && actor?.role !== 'admin') return { error: 'Cannot delete others\' meals' };

  const targetName = (existing as unknown as Record<string, Record<string, string>>).profiles?.name || 'Unknown';

  const { error } = await supabase.from('meals').delete().eq('id', mealId);
  if (error) return { error: error.message };

  await logAudit(supabase, user.id, actor!.name, 'meal_delete',
    `${actor!.name} deleted ${targetName}'s meal entry — ${auditDate(existing.date)} (was: ${existing.count} meal${existing.count !== 1 ? 's' : ''})`,
    { target_member_name: targetName, before: { count: existing.count, date: existing.date }, after: null, entity_id: mealId }
  );

  return { success: true };
}
