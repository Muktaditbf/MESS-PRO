'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { addMember, updateMemberRole, deleteMember, resetMemberPassword } from './actions';
import { Users, Plus, Shield, Key, Trash2, ShieldAlert } from 'lucide-react';
import type { Profile } from '@/lib/types';

export default function MembersPage() {
  const { profile, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'member'>('member');
  const [submitting, setSubmitting] = useState(false);
  
  const [roleChangeId, setRoleChangeId] = useState<string | null>(null);
  const [resetPwId, setResetPwId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isAdmin, router]);

  const fetchData = async () => {
    const { data } = await supabase.from('profiles').select('*').order('name');
    setMembers((data as Profile[]) || []);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) fetchData(); }, [isAdmin]);

  if (!isAdmin) return null;

  const handleAdd = async () => {
    if (!formName) return;
    setSubmitting(true);
    const result = await addMember(formName, formRole);
    setSubmitting(false);
    if (result.success) { setShowAdd(false); setFormName(''); setFormRole('member'); fetchData(); }
    else alert(result.error);
  };

  const handleRoleChange = async () => {
    if (!roleChangeId) return;
    setSubmitting(true);
    const member = members.find(m => m.id === roleChangeId);
    const newRole = member?.role === 'admin' ? 'member' : 'admin';
    const result = await updateMemberRole(roleChangeId, newRole);
    setSubmitting(false);
    if (result.success) { setRoleChangeId(null); fetchData(); }
  };

  const handleResetPw = async () => {
    if (!resetPwId) return;
    setSubmitting(true);
    const result = await resetMemberPassword(resetPwId);
    setSubmitting(false);
    if (result.success) {
      setResetPwId(null);
      alert('Password reset to "changeme123". The user will be forced to change it on next login.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    const result = await deleteMember(deleteId);
    setSubmitting(false);
    if (result.success) { setDeleteId(null); fetchData(); }
    else alert(result.error);
  };

  const getTargetName = (id: string | null) => members.find(m => m.id === id)?.name || '';

  return (
    <AppShell>
      <div className="space-y-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Users size={20} className="text-teal" /> Members & Roles
            </h1>
            <p className="text-sm text-text-muted">Manage system access (Admin only)</p>
          </div>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>Add Member</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <GlassCard key={i} hover={false} className="flex items-center gap-4">
                <Skeleton variant="circle" className="h-12 w-12" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div>
              </GlassCard>
            ))
          ) : members.length === 0 ? (
            <p className="text-text-muted">No members found.</p>
          ) : (
            members.map(member => (
              <GlassCard key={member.id} hover={false} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 group transition-all">
                <div className="flex items-center gap-4 flex-1">
                  <Avatar name={member.name} color={member.avatar_color} size="lg" />
                  <div>
                    <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                      {member.name}
                      {member.role === 'admin' && <ShieldAlert size={14} className="text-warning" />}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={member.role === 'admin' ? 'amber' : 'gray'} className="text-[10px]">
                        {member.role.toUpperCase()}
                      </Badge>
                      {member.must_change_password && (
                        <Badge variant="red" className="text-[10px]">Needs PW Change</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-1 w-full sm:w-auto mt-4 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setRoleChangeId(member.id)}
                    disabled={member.id === profile?.id}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-surface text-xs font-medium text-text-secondary hover:text-teal hover:bg-surface-hover disabled:opacity-30 transition-colors"
                  >
                    <Shield size={12} /> {member.role === 'admin' ? 'Demote' : 'Promote'}
                  </button>
                  <button 
                    onClick={() => setResetPwId(member.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-surface text-xs font-medium text-text-secondary hover:text-amber-500 hover:bg-surface-hover transition-colors"
                  >
                    <Key size={12} /> Reset PW
                  </button>
                  <button 
                    onClick={() => setDeleteId(member.id)}
                    disabled={member.id === profile?.id}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-surface text-xs font-medium text-text-secondary hover:text-negative hover:bg-negative-dim disabled:opacity-30 transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Member">
        <div className="space-y-4">
          <Input label="Name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Mahbub" />
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted">Role</label>
            <select value={formRole} onChange={(e) => setFormRole(e.target.value as any)} className="glass-input">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-border text-xs text-text-muted">
            New users will have the password <strong>changeme123</strong> and will be forced to change it on their first login.
          </div>
          <Button onClick={handleAdd} loading={submitting} className="w-full">Create Member</Button>
        </div>
      </Modal>

      <ConfirmDialog 
        open={!!roleChangeId} onClose={() => setRoleChangeId(null)} onConfirm={handleRoleChange} loading={submitting}
        title="Change Role" confirmText="Change Role"
        message={`Are you sure you want to change ${getTargetName(roleChangeId)}'s role?`} 
      />

      <ConfirmDialog 
        open={!!resetPwId} onClose={() => setResetPwId(null)} onConfirm={handleResetPw} loading={submitting}
        title="Reset Password" confirmText="Reset Password"
        message={`This will reset ${getTargetName(resetPwId)}'s password to "changeme123" and log them out. Are you sure?`} 
      />

      <ConfirmDialog 
        open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={submitting}
        title="Delete Member" confirmText="Delete Member"
        message={`This will permanently delete ${getTargetName(deleteId)} and all their associated auth data. Depending on constraints, this may fail if they have meals or deposits linked.`} 
      />
    </AppShell>
  );
}
