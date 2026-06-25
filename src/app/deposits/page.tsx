'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { addDeposit, editDeposit, deleteDeposit } from './actions';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';

interface DepositRow {
  id: string;
  member_id: string;
  amount: number;
  month: number;
  year: number;
  note: string | null;
  created_at: string;
  profiles: { name: string; avatar_color: string };
}

export default function DepositsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string; avatar_color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formMember, setFormMember] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formNote, setFormNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const fetchData = async () => {
    const [depsRes, membersRes] = await Promise.all([
      supabase.from('deposits').select('*, profiles(name, avatar_color)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, name, avatar_color'),
    ]);
    setDeposits((depsRes.data || []) as unknown as DepositRow[]);
    setMembers(membersRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading]);

  const handleAdd = async () => {
    if (!formMember || !formAmount) return;
    setSubmitting(true);
    const result = await addDeposit(formMember, parseFloat(formAmount), formNote);
    setSubmitting(false);
    if (result.success) {
      setShowAdd(false);
      setFormMember('');
      setFormAmount('');
      setFormNote('');
      fetchData();
    }
  };

  const handleEdit = async () => {
    if (!editId || !formAmount) return;
    setSubmitting(true);
    const result = await editDeposit(editId, parseFloat(formAmount), formNote);
    setSubmitting(false);
    if (result.success) {
      setEditId(null);
      fetchData();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    const result = await deleteDeposit(deleteId);
    setSubmitting(false);
    if (result.success) {
      setDeleteId(null);
      fetchData();
    }
  };

  const openEdit = (dep: DepositRow) => {
    setEditId(dep.id);
    setFormAmount(String(dep.amount));
    setFormNote(dep.note || '');
  };

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Wallet size={20} className="text-teal" /> Deposits
            </h1>
            <p className="text-sm text-text-muted">Per-member deposit history</p>
          </div>
          {isAdmin && (
            <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
              Add Deposit
            </Button>
          )}
        </div>

        {/* Table */}
        <GlassCard hover={false} padding="p-0">
          <div className="overflow-x-auto">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Month</th>
                  <th>Note</th>
                  <th>Date</th>
                  {isAdmin && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: isAdmin ? 6 : 5 }).map((_, j) => (
                        <td key={j}><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : deposits.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-text-muted">No deposits yet</td></tr>
                ) : (
                  deposits.map((dep) => (
                    <tr key={dep.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar name={dep.profiles.name} color={dep.profiles.avatar_color} size="sm" />
                          <span className="font-medium text-text-primary">{dep.profiles.name}</span>
                        </div>
                      </td>
                      <td className="font-semibold text-teal">{formatCurrency(dep.amount)}</td>
                      <td>{`${dep.month}/${dep.year}`}</td>
                      <td className="text-text-muted">{dep.note || '—'}</td>
                      <td className="text-text-muted">{formatDate(dep.created_at)}</td>
                      {isAdmin && (
                        <td>
                          <div className="flex justify-end gap-1">
                            <button onClick={() => openEdit(dep)} className="p-1.5 rounded text-text-muted hover:text-teal hover:bg-teal-dim transition-colors">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => setDeleteId(dep.id)} className="p-1.5 rounded text-text-muted hover:text-negative hover:bg-negative-dim transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Deposit">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted">Member</label>
            <select
              value={formMember}
              onChange={(e) => setFormMember(e.target.value)}
              className="glass-input"
            >
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <Input label="Amount (৳)" type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="e.g. 2000" />
          <Input label="Note (optional)" value={formNote} onChange={(e) => setFormNote(e.target.value)} placeholder="e.g. June deposit" />
          <Button onClick={handleAdd} loading={submitting}>Add Deposit</Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editId} onClose={() => setEditId(null)} title="Edit Deposit">
        <div className="space-y-4">
          <Input label="Amount (৳)" type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
          <Input label="Note" value={formNote} onChange={(e) => setFormNote(e.target.value)} />
          <Button onClick={handleEdit} loading={submitting}>Save Changes</Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Deposit"
        message="Are you sure you want to delete this deposit? This action will be logged."
        loading={submitting}
      />
    </AppShell>
  );
}
