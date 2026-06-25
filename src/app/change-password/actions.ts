'use server';

import { createClient } from '@/lib/supabase/server';
import { logAudit } from '@/lib/audit';

export async function changePasswordAction(newPassword: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  // Update auth password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { error: updateError.message };
  }

  // Get profile for name
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single();

  // Set must_change_password to false
  await supabase
    .from('profiles')
    .update({ must_change_password: false })
    .eq('id', user.id);

  // Log audit
  const actorName = profile?.name || 'Unknown';
  await logAudit(
    supabase,
    user.id,
    actorName,
    'password_self_change',
    `${actorName} changed their own password`
  );

  return { success: true };
}
