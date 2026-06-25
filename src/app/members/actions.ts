'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit';
import { nameToDummyEmail } from '@/lib/utils';

const COLORS = [
  '#00b4a6', '#0ea5e9', '#8b5cf6', '#d946ef', '#f43f5e', 
  '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6'
];

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export async function addMember(name: string, role: 'admin' | 'member' = 'member') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: actor } = await supabase.from('profiles').select('name, role').eq('id', user.id).single();
  if (actor?.role !== 'admin') return { error: 'Admin only' };

  const cleanName = name.trim();
  const email = nameToDummyEmail(cleanName);
  const password = 'changeme123';

  // Use service role to bypass RLS and create user
  const adminClient = createAdminClient();
  
  // 1. Create user in auth.users
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      return { error: 'A user with this name already exists.' };
    }
    return { error: authError.message };
  }

  const newUserId = authData.user.id;

  // 2. Insert profile (service role needed if RLS blocks insert)
  const { error: profileError } = await adminClient.from('profiles').insert({
    id: newUserId,
    name: cleanName,
    role,
    avatar_color: getRandomColor(),
    must_change_password: true,
  });

  if (profileError) {
    // Rollback
    await adminClient.auth.admin.deleteUser(newUserId);
    return { error: profileError.message };
  }

  // 3. Log audit (using regular client)
  await logAudit(supabase, user.id, actor!.name, 'member_create',
    `${actor!.name} created a new ${role}: ${cleanName}`,
    { target_member_id: newUserId, target_member_name: cleanName, role }
  );

  return { success: true };
}

export async function updateMemberRole(memberId: string, newRole: 'admin' | 'member') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: actor } = await supabase.from('profiles').select('name, role').eq('id', user.id).single();
  if (actor?.role !== 'admin') return { error: 'Admin only' };

  if (memberId === user.id) return { error: 'Cannot change your own role' };

  const adminClient = createAdminClient();
  const { data: existing } = await adminClient.from('profiles').select('name, role').eq('id', memberId).single();
  if (!existing) return { error: 'Not found' };

  const { error } = await adminClient.from('profiles').update({ role: newRole }).eq('id', memberId);
  if (error) return { error: error.message };

  await logAudit(supabase, user.id, actor!.name, 'member_role_change',
    `${actor!.name} changed ${existing.name}'s role: ${existing.role} → ${newRole}`,
    { target_member_name: existing.name, before: { role: existing.role }, after: { role: newRole } }
  );

  return { success: true };
}

export async function deleteMember(memberId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: actor } = await supabase.from('profiles').select('name, role').eq('id', user.id).single();
  if (actor?.role !== 'admin') return { error: 'Admin only' };

  if (memberId === user.id) return { error: 'Cannot delete yourself' };

  const adminClient = createAdminClient();
  const { data: existing } = await adminClient.from('profiles').select('name').eq('id', memberId).single();
  if (!existing) return { error: 'Not found' };

  // Note: RLS or foreign key constraints might prevent deletion if they have meals/deposits.
  // In Supabase, if FKs are CASCADE, it's fine. If RESTRICT, this will fail.
  // Let's assume CASCADE or we need to handle it.
  
  const { error } = await adminClient.auth.admin.deleteUser(memberId);
  if (error) return { error: error.message };

  await logAudit(supabase, user.id, actor!.name, 'member_delete',
    `${actor!.name} deleted member: ${existing.name}`,
    { target_member_name: existing.name }
  );

  return { success: true };
}

export async function resetMemberPassword(memberId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: actor } = await supabase.from('profiles').select('name, role').eq('id', user.id).single();
  if (actor?.role !== 'admin') return { error: 'Admin only' };

  const adminClient = createAdminClient();
  const { data: target } = await adminClient.from('profiles').select('name').eq('id', memberId).single();
  if (!target) return { error: 'Not found' };

  // Reset to changeme123 and force change
  const { error: authError } = await adminClient.auth.admin.updateUserById(memberId, { password: 'changeme123' });
  if (authError) return { error: authError.message };

  const { error: profileError } = await adminClient.from('profiles').update({ must_change_password: true }).eq('id', memberId);
  if (profileError) return { error: profileError.message };

  await logAudit(supabase, user.id, actor!.name, 'password_reset',
    `${actor!.name} reset the password for ${target.name}`,
    { target_member_name: target.name }
  );

  return { success: true };
}
