'use server';

import { createClient } from '@/lib/supabase/server';
import { nameToDummyEmail } from '@/lib/utils';
import { logAudit } from '@/lib/audit';

export async function loginAction(name: string, password: string) {
  const supabase = await createClient();

  // 1. Look up profile by name to derive dummy email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, must_change_password')
    .ilike('name', name.trim())
    .single();

  if (profileError || !profile) {
    console.error("Profile error:", profileError);
    return { error: profileError ? `Database error: ${profileError.message}` : 'User not found in profiles. Did you run the SQL script?' };
  }

  // 2. Derive dummy email
  const dummyEmail = nameToDummyEmail(name);

  // 3. Sign in with derived dummy email
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: dummyEmail,
    password,
  });

  if (signInError) {
    console.error("Sign in error:", signInError);
    return { error: `Auth error: ${signInError.message}` };
  }

  // 4. Log the login
  await logAudit(supabase, profile.id, profile.name, 'login', `${profile.name} logged in`);

  // 5. Return success with must_change_password flag
  return {
    success: true,
    mustChangePassword: profile.must_change_password,
  };
}
