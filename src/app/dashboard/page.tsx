'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { getCurrentMonth, getMonthProgress, formatCurrency } from '@/lib/utils';
import type { DashboardData, MemberBalance } from '@/lib/types';
import { PersonalOverview } from './widgets/personal-overview';
import { MessOverview } from './widgets/mess-overview';
import { MemberBalances } from './widgets/member-balances';
import { MonthProgress } from './widgets/month-progress';
import { BazarRotationPreview } from './widgets/bazar-rotation-preview';
import { MealSummary } from './widgets/meal-summary';
import { RecentActivity } from './widgets/recent-activity';
import { FixedCostHead } from './widgets/fixed-cost-head';
import { QuickActions } from './widgets/quick-actions';
import { MonthHighlights } from './widgets/month-highlights';

export default function DashboardPage() {
  const { profile, isAdmin, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (authLoading || !profile) return;

    async function fetchData() {
      const { month, year } = getCurrentMonth();
      const progress = getMonthProgress();

      // Fetch all data in parallel
      const [
        profilesRes,
        mealsRes,
        depositsRes,
        bazarRes,
        fixedRes,
        rotationRes,
        activityRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('meals').select('*').eq('date', `${year}-${String(month).padStart(2, '0')}%`),
        supabase.from('deposits').select('*'),
        supabase.from('bazar_entries').select('*'),
        supabase.from('fixed_costs').select('*').eq('month', month).eq('year', year),
        supabase.from('bazar_rotation').select('*, profiles(name, avatar_color)').eq('status', 'upcoming').order('assigned_date', { ascending: true }).limit(3),
        supabase.from('audit_logs').select('*, profiles(name, avatar_color)').order('created_at', { ascending: false }).limit(6),
      ]);

      const profiles = profilesRes.data || [];
      const allMeals = mealsRes.data || [];
      const allDeposits = depositsRes.data || [];
      const allBazar = bazarRes.data || [];
      const fixedCosts = fixedRes.data || [];

      // Current month bazar and meals
      const monthBazar = allBazar.filter(b => b.month === month && b.year === year);
      const monthMealsAll = allMeals;

      // Calculate totals
      const totalBazar = monthBazar.reduce((s, b) => s + Number(b.amount), 0);
      const totalMeals = monthMealsAll.reduce((s, m) => s + Number(m.count), 0);
      const mealRate = totalMeals > 0 ? totalBazar / totalMeals : 0;
      const totalDeposits = allDeposits.reduce((s, d) => s + Number(d.amount), 0);
      const totalFixed = fixedCosts.reduce((s, f) => s + Number(f.amount), 0);

      // Per-member balances
      const members: MemberBalance[] = profiles.map(p => {
        const memberDeposit = allDeposits
          .filter(d => d.member_id === p.id)
          .reduce((s, d) => s + Number(d.amount), 0);
        const memberMeals = monthMealsAll
          .filter(m => m.member_id === p.id)
          .reduce((s, m) => s + Number(m.count), 0);
        const mealCost = memberMeals * mealRate;
        return {
          id: p.id,
          name: p.name,
          avatar_color: p.avatar_color,
          total_deposit: memberDeposit,
          meal_count: memberMeals,
          meal_cost: mealCost,
          net_balance: memberDeposit - mealCost,
        };
      });

      const me = members.find(m => m.id === profile!.id);

      // Fixed cost breakdown
      const categoryMap = new Map<string, number>();
      fixedCosts.forEach(f => {
        const existing = categoryMap.get(f.category) || 0;
        categoryMap.set(f.category, existing + Number(f.amount));
      });
      const breakdown = Array.from(categoryMap.entries()).map(([category, amount]) => ({ category, amount }));

      // Highlights
      const sortedByMeals = [...members].sort((a, b) => b.meal_count - a.meal_count);
      const sortedByDeposit = [...members].sort((a, b) => b.total_deposit - a.total_deposit);

      // Count bazar trips per member
      const bazarTrips = new Map<string, number>();
      monthBazar.forEach(b => {
        if (b.duty_member) {
          bazarTrips.set(b.duty_member, (bazarTrips.get(b.duty_member) || 0) + 1);
        }
      });
      const tripEntries = Array.from(bazarTrips.entries())
        .map(([id, count]) => ({ name: profiles.find(p => p.id === id)?.name || '', count }))
        .sort((a, b) => b.count - a.count);

      const dashboardData: DashboardData = {
        personal: {
          net_balance: me?.net_balance || 0,
          deposit: me?.total_deposit || 0,
          meal_count: me?.meal_count || 0,
          meal_cost: me?.meal_cost || 0,
        },
        mess: {
          total_deposits: totalDeposits,
          total_bazar: totalBazar,
          total_meals: totalMeals,
          meal_rate: mealRate,
        },
        members,
        month_progress: {
          days_passed: progress.daysPassed,
          total_days: progress.totalDays,
          percentage: progress.percentage,
        },
        rotation_next: (rotationRes.data || []).map(r => ({
          ...r,
          member_name: (r as unknown as Record<string, Record<string, string>>).profiles?.name,
          member_avatar_color: (r as unknown as Record<string, Record<string, string>>).profiles?.avatar_color,
        })),
        recent_activity: (activityRes.data || []).map(a => ({
          ...a,
          actor_name: (a as unknown as Record<string, Record<string, string>>).profiles?.name,
          actor_avatar_color: (a as unknown as Record<string, Record<string, string>>).profiles?.avatar_color,
        })),
        fixed_cost: {
          total: totalFixed,
          per_head: profiles.length > 0 ? totalFixed / profiles.length : 0,
          breakdown,
        },
        highlights: {
          most_meals: sortedByMeals[0]?.meal_count > 0
            ? { name: sortedByMeals[0].name, count: sortedByMeals[0].meal_count } : null,
          top_depositor: sortedByDeposit[0]?.total_deposit > 0
            ? { name: sortedByDeposit[0].name, amount: sortedByDeposit[0].total_deposit } : null,
          most_bazar_trips: tripEntries[0]?.count > 0
            ? { name: tripEntries[0].name, count: tripEntries[0].count } : null,
          least_meals: sortedByMeals[sortedByMeals.length - 1]?.meal_count >= 0
            ? { name: sortedByMeals[sortedByMeals.length - 1].name, count: sortedByMeals[sortedByMeals.length - 1].meal_count } : null,
        },
      };

      setData(dashboardData);
      setLoading(false);
    }

    fetchData();
  }, [authLoading, profile, supabase]);

  const isLoading = loading || authLoading;

  return (
    <AppShell>
      <div className="bento-grid">
        {/* Section label */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          ① Your Personal Overview — {profile?.name || ''}
        </p>

        {/* Row 1: Personal Overview (4 cards) */}
        <PersonalOverview data={data?.personal} loading={isLoading} />

        {/* Section label */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          ② Mess-Wide Overview
        </p>

        {/* Row 2: Mess Overview (4 cards) */}
        <MessOverview data={data?.mess} loading={isLoading} />

        {/* Section label */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          ③ Member Balances · Month Ring · Bazar Rotation
        </p>

        {/* Row 3: Balances + Ring + Rotation (3 cols) */}
        <div className="bento-row-3">
          <MemberBalances members={data?.members || []} loading={isLoading} />
          <MonthProgress data={data?.month_progress} loading={isLoading} />
          <BazarRotationPreview
            slots={data?.rotation_next || []}
            loading={isLoading}
            isAdmin={isAdmin}
          />
        </div>

        {/* Section label */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          ④ Meal Summary · Recent Activity · Fixed Cost / Head
        </p>

        {/* Row 4: Meal Summary + Activity + Fixed Cost (3 cols) */}
        <div className="bento-row-3">
          <MealSummary
            members={data?.members || []}
            loading={isLoading}
            isAdmin={isAdmin}
          />
          <RecentActivity
            activities={data?.recent_activity || []}
            loading={isLoading}
          />
          <FixedCostHead data={data?.fixed_cost} loading={isLoading} />
        </div>

        {/* Section label */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          ⑤ Quick Actions · Month Highlights
        </p>

        {/* Row 5: Quick Actions + Highlights (2 cols) */}
        <div className="bento-row-2">
          <QuickActions isAdmin={isAdmin} />
          <MonthHighlights highlights={data?.highlights} loading={isLoading} />
        </div>
      </div>
    </AppShell>
  );
}
