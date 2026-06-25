'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, monthName, getCurrentMonth } from '@/lib/utils';
import { addFixedCost, editFixedCost, deleteFixedCost } from './actions';
import { Plus, Pencil, Trash2, Receipt } from 'lucide-react';
import type { FixedCost } from '@/lib/types';

export default function FixedCostsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [costs, setCosts] = useState<FixedCost[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState('rent');
  const [formAmount, setFormAmount] = useState('');
  const [formNote, setFormNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();
  const { month, year } = getCurrentMonth();

  const fetchData = async () => {
    const [costsRes, countRes] = await Promise.all([
      supabase.from('fixed_costs').select('*, profiles(name)').eq('month', month).eq('year', year).order('created_at', { ascending: false }),
      supabase.from('profiles').select('id', { count: 'exact' }),
    ]);
    const enriched = (costsRes.data || []).map(c => ({
      ...c,
      added_by_name: (c as unknown as Record<string, Record<string, string>>).profiles?.name,
    }));
    setCosts(enriched as FixedCost[]);
    setMemberCount(countRes.count || 0);
    setLoading(false);
  };

  useEffect(() => { if (!authLoading) fetchData(); }, [authLoading]);

  const handleAdd = async () => {
    if (!formCategory || !formAmount) return;
    setSubmitting(true);
    const result = await addFixedCost(formCategory, parseFloat(formAmount), formNote);
    setSubmitting(false);
    if (result.success) { setShowAdd(false); setFormAmount(''); setFormNote(''); fetchData(); }
  };

  const handleEdit = async () => {
    if (!editId || !formAmount) return;
    setSubmitting(true);
    const result = await editFixedCost(editId, formCategory, parseFloat(formAmount), formNote);
    setSubmitting(false);
    if (result.success) { setEditId(null); fetchData(); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    const result = await deleteFixedCost(deleteId);
    setSubmitting(false);
    if (result.success) { setDeleteId(null); fetchData(); }
  };

  const total = costs.reduce((s, c) => s + Number(c.amount), 0);
  const perHead = memberCount > 0 ? total / memberCount : 0;
  const categories = ['rent', 'gas', 'electricity', 'internet', 'other'];
  const catColors: Record<string, "teal" | "amber" | "purple" | "red" | "gray"> = {
    rent: 'purple', gas: 'amber', electricity: 'amber', internet: 'teal', other: 'gray'
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Receipt size={20} className="text-fixed" /> Fixed Costs
            </h1>
            <p className="text-sm text-text-muted">Separate from bazar — paid equally by all members</p>
          </div>
          {isAdmin && (
            <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>Add Cost</Button>
          )}
        </div>

        {/* Per Head Summary */}
        <GlassCard hover={false} className="border-fixed/30 bg-fixed-dim/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-fixed">Total Fixed Cost ({monthName(month)} {year})</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text-primary">{formatCurrency(total)}</span>
                <span className="text-sm text-text-muted">total</span>
              </div>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-fixed">Per Head ({memberCount} members)</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-fixed">{formatCurrency(Math.round(perHead))}</span>
                <span className="text-sm text-text-muted">each</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Table */}
        <GlassCard hover={false} padding="p-0">
          <div className="overflow-x-auto">
            <table className="glass-table">
              <thead><tr><th>Category</th><th>Amount</th><th>Note</th><th>Added By</th>{isAdmin && <th className="text-right">Actions</th>}</tr></thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: isAdmin ? 5 : 4 }).map((_, j) => (<td key={j}><Skeleton className="h-4 w-full" /></td>))}</tr>
                  ))
                ) : costs.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-text-muted">No fixed costs this month</td></tr>
                ) : (
                  costs.map((cost) => (
                    <tr key={cost.id}>
                      <td><Badge variant={catColors[cost.category] || 'gray'} className="capitalize">{cost.category}</Badge></td>
                      <td className="font-semibold text-text-primary">{formatCurrency(cost.amount)}</td>
                      <td className="text-text-muted">{cost.note || '—'}</td>
                      <td className="text-xs text-text-muted">{cost.added_by_name}</td>
                      {isAdmin && (
                        <td>
                          <div className="flex justify-end gap-1">
                            <button onClick={() => { setEditId(cost.id); setFormCategory(cost.category); setFormAmount(String(cost.amount)); setFormNote(cost.note || ''); }} className="p-1.5 rounded text-text-muted hover:text-teal hover:bg-teal-dim transition-colors"><Pencil size={14} /></button>
                            <button onClick={() => setDeleteId(cost.id)} className="p-1.5 rounded text-text-muted hover:text-negative hover:bg-negative-dim transition-colors"><Trash2 size={14} /></button>
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

      {/* Add/Edit Modals */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Fixed Cost">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted">Category</label>
            <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="glass-input capitalize">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input label="Amount (৳)" type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
          <Input label="Note (optional)" value={formNote} onChange={(e) => setFormNote(e.target.value)} />
          <Button onClick={handleAdd} loading={submitting}>Add Cost</Button>
        </div>
      </Modal>

      <Modal open={!!editId} onClose={() => setEditId(null)} title="Edit Fixed Cost">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted">Category</label>
            <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="glass-input capitalize">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input label="Amount (৳)" type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
          <Input label="Note (optional)" value={formNote} onChange={(e) => setFormNote(e.target.value)} />
          <Button onClick={handleEdit} loading={submitting}>Save Changes</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Fixed Cost" message="This action will be logged." loading={submitting} />
    </AppShell>
  );
}
