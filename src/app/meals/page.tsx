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
import { formatDate } from '@/lib/utils';
import { addMeal, editMeal, deleteMeal } from './actions';
import { Plus, Pencil, Trash2, UtensilsCrossed } from 'lucide-react';

interface MealRow {
  id: string;
  member_id: string;
  date: string;
  count: number;
  created_at: string;
  profiles: { name: string; avatar_color: string };
}

export default function MealsPage() {
  const { profile, isAdmin, loading: authLoading } = useAuth();
  const [meals, setMeals] = useState<MealRow[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string; avatar_color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formMember, setFormMember] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formCount, setFormCount] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const fetchData = async () => {
    const [mealsRes, membersRes] = await Promise.all([
      supabase.from('meals').select('*, profiles(name, avatar_color)').order('date', { ascending: false }),
      supabase.from('profiles').select('id, name, avatar_color'),
    ]);
    setMeals((mealsRes.data || []) as unknown as MealRow[]);
    setMembers(membersRes.data || []);
    setLoading(false);
  };

  useEffect(() => { if (!authLoading) fetchData(); }, [authLoading]);

  const handleAdd = async () => {
    const memberId = formMember || profile?.id;
    if (!memberId || !formCount) return;
    setSubmitting(true);
    const result = await addMeal(memberId, formDate, parseInt(formCount));
    setSubmitting(false);
    if (result.success) { setShowAdd(false); setFormCount('1'); fetchData(); }
  };

  const handleEdit = async () => {
    if (!editId || !formCount) return;
    setSubmitting(true);
    const result = await editMeal(editId, parseInt(formCount));
    setSubmitting(false);
    if (result.success) { setEditId(null); fetchData(); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    const result = await deleteMeal(deleteId);
    setSubmitting(false);
    if (result.success) { setDeleteId(null); fetchData(); }
  };

  const canEdit = (meal: MealRow) => isAdmin || meal.member_id === profile?.id;

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <UtensilsCrossed size={20} className="text-teal" /> Meals
            </h1>
            <p className="text-sm text-text-muted">Track daily meal counts per member</p>
          </div>
          <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => { setFormMember(profile?.id || ''); setShowAdd(true); }}>
            Add Meal
          </Button>
        </div>

        <GlassCard hover={false} padding="p-0">
          <div className="overflow-x-auto">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Date</th>
                  <th>Count</th>
                  <th>Added</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (<td key={j}><Skeleton className="h-4 w-full" /></td>))}</tr>
                  ))
                ) : meals.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-text-muted">No meals logged yet</td></tr>
                ) : (
                  meals.map((meal) => (
                    <tr key={meal.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Avatar name={meal.profiles.name} color={meal.profiles.avatar_color} size="sm" />
                          <span className="font-medium text-text-primary">{meal.profiles.name}</span>
                        </div>
                      </td>
                      <td>{formatDate(meal.date)}</td>
                      <td className="font-semibold text-text-primary">{meal.count}</td>
                      <td className="text-text-muted">{formatDate(meal.created_at)}</td>
                      <td>
                        {canEdit(meal) && (
                          <div className="flex justify-end gap-1">
                            <button onClick={() => { setEditId(meal.id); setFormCount(String(meal.count)); }} className="p-1.5 rounded text-text-muted hover:text-teal hover:bg-teal-dim transition-colors"><Pencil size={14} /></button>
                            <button onClick={() => setDeleteId(meal.id)} className="p-1.5 rounded text-text-muted hover:text-negative hover:bg-negative-dim transition-colors"><Trash2 size={14} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Meal">
        <div className="space-y-4">
          {isAdmin && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted">Member</label>
              <select value={formMember} onChange={(e) => setFormMember(e.target.value)} className="glass-input">
                {members.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
              </select>
            </div>
          )}
          <Input label="Date" type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
          <Input label="Meal Count" type="number" min="1" value={formCount} onChange={(e) => setFormCount(e.target.value)} />
          <Button onClick={handleAdd} loading={submitting}>Add Meal</Button>
        </div>
      </Modal>

      <Modal open={!!editId} onClose={() => setEditId(null)} title="Edit Meal Count">
        <div className="space-y-4">
          <Input label="Meal Count" type="number" min="1" value={formCount} onChange={(e) => setFormCount(e.target.value)} />
          <Button onClick={handleEdit} loading={submitting}>Save</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Meal" message="Are you sure? This will be logged in the audit trail." loading={submitting} />
    </AppShell>
  );
}
