'use client';

import { useEffect, useState } from 'react';
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
import { formatCurrency, formatDate } from '@/lib/utils';
import { addBazar, editBazar, deleteBazar } from './actions';
import { Plus, Pencil, Trash2, ShoppingCart } from 'lucide-react';

interface BazarRow {
  id: string; amount: number; date: string; items_note: string | null;
  duty_member: string | null; created_at: string;
  duty_profiles?: { name: string; avatar_color: string };
}

export default function BazarPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<BazarRow[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string; avatar_color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formItems, setFormItems] = useState('');
  const [formDuty, setFormDuty] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const fetchData = async () => {
    const [bazarRes, membersRes] = await Promise.all([
      supabase.from('bazar_entries').select('*').order('date', { ascending: false }),
      supabase.from('profiles').select('id, name, avatar_color'),
    ]);
    const allMembers = membersRes.data || [];
    const enriched = (bazarRes.data || []).map(b => ({
      ...b,
      duty_profiles: allMembers.find(m => m.id === b.duty_member),
    }));
    setEntries(enriched as BazarRow[]);
    setMembers(allMembers);
    setLoading(false);
  };

  useEffect(() => { if (!authLoading) fetchData(); }, [authLoading]);

  const handleAdd = async () => {
    if (!formAmount) return;
    setSubmitting(true);
    const result = await addBazar(parseFloat(formAmount), formDate, formItems, formDuty || undefined);
    setSubmitting(false);
    if (result.success) { setShowAdd(false); setFormAmount(''); setFormItems(''); fetchData(); }
  };

  const handleEdit = async () => {
    if (!editId || !formAmount) return;
    setSubmitting(true);
    const result = await editBazar(editId, parseFloat(formAmount), formDate, formItems);
    setSubmitting(false);
    if (result.success) { setEditId(null); fetchData(); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    const result = await deleteBazar(deleteId);
    setSubmitting(false);
    if (result.success) { setDeleteId(null); fetchData(); }
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <ShoppingCart size={20} className="text-warning" /> Bazar
            </h1>
            <p className="text-sm text-text-muted">Bazar entries — logged against the mess pool, not individuals</p>
          </div>
          {isAdmin && (
            <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>Add Bazar</Button>
          )}
        </div>

        <GlassCard hover={false} padding="p-0">
          <div className="overflow-x-auto">
            <table className="glass-table">
              <thead><tr><th>Date</th><th>Amount</th><th>Items</th><th>Duty Member</th>{isAdmin && <th className="text-right">Actions</th>}</tr></thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: isAdmin ? 5 : 4 }).map((_, j) => (<td key={j}><Skeleton className="h-4 w-full" /></td>))}</tr>
                  ))
                ) : entries.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-text-muted">No bazar entries yet</td></tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{formatDate(entry.date)}</td>
                      <td className="font-semibold text-warning">{formatCurrency(entry.amount)}</td>
                      <td className="text-text-muted max-w-[200px] truncate">{entry.items_note || '—'}</td>
                      <td>
                        {entry.duty_profiles ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={entry.duty_profiles.name} color={entry.duty_profiles.avatar_color} size="sm" />
                            <span>{entry.duty_profiles.name}</span>
                          </div>
                        ) : <span className="text-text-muted">—</span>}
                      </td>
                      {isAdmin && (
                        <td>
                          <div className="flex justify-end gap-1">
                            <button onClick={() => { setEditId(entry.id); setFormAmount(String(entry.amount)); setFormDate(entry.date); setFormItems(entry.items_note || ''); }} className="p-1.5 rounded text-text-muted hover:text-teal hover:bg-teal-dim transition-colors"><Pencil size={14} /></button>
                            <button onClick={() => setDeleteId(entry.id)} className="p-1.5 rounded text-text-muted hover:text-negative hover:bg-negative-dim transition-colors"><Trash2 size={14} /></button>
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

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Bazar Entry">
        <div className="space-y-4">
          <Input label="Amount (৳)" type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="e.g. 450" />
          <Input label="Date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
          <Input label="Items (optional)" value={formItems} onChange={(e) => setFormItems(e.target.value)} placeholder="e.g. Rice, vegetables, oil" />
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted">Duty Member (optional)</label>
            <select value={formDuty} onChange={(e) => setFormDuty(e.target.value)} className="glass-input">
              <option value="">Select duty member</option>
              {members.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
            </select>
          </div>
          <Button onClick={handleAdd} loading={submitting}>Log Bazar</Button>
        </div>
      </Modal>

      <Modal open={!!editId} onClose={() => setEditId(null)} title="Edit Bazar Entry">
        <div className="space-y-4">
          <Input label="Amount (৳)" type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
          <Input label="Date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
          <Input label="Items" value={formItems} onChange={(e) => setFormItems(e.target.value)} />
          <Button onClick={handleEdit} loading={submitting}>Save Changes</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Bazar Entry" message="This will be permanently logged." loading={submitting} />
    </AppShell>
  );
}
