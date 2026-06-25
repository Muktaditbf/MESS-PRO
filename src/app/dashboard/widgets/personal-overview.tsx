'use client';

import { StatCard } from '@/components/ui/stat-card';
import { formatCurrency } from '@/lib/utils';
import { Wallet, TrendingUp, UtensilsCrossed, Calculator } from 'lucide-react';

interface PersonalOverviewProps {
  data?: {
    net_balance: number;
    deposit: number;
    meal_count: number;
    meal_cost: number;
  };
  loading: boolean;
}

export function PersonalOverview({ data, loading }: PersonalOverviewProps) {
  const balanceAccent = !data ? 'default' : data.net_balance >= 0 ? 'teal' : 'red';
  const balancePrefix = data && data.net_balance >= 0 ? '+' : '';

  return (
    <div className="bento-row-4">
      <StatCard
        label="Net Balance"
        value={data ? `${balancePrefix}${formatCurrency(Math.round(data.net_balance))}` : '—'}
        icon={<TrendingUp size={16} />}
        accent={balanceAccent}
        subtitle="after bazar cost"
        loading={loading}
        className="stagger-1 animate-fade-up"
      />
      <StatCard
        label="Your Deposit"
        value={data ? formatCurrency(Math.round(data.deposit)) : '—'}
        icon={<Wallet size={16} />}
        accent="teal"
        subtitle="this month"
        loading={loading}
        className="stagger-2 animate-fade-up"
      />
      <StatCard
        label="Your Meals"
        value={data ? String(data.meal_count) : '—'}
        icon={<UtensilsCrossed size={16} />}
        accent="default"
        subtitle="this month"
        loading={loading}
        className="stagger-3 animate-fade-up"
      />
      <StatCard
        label="Your Meal Cost"
        value={data ? formatCurrency(Math.round(data.meal_cost)) : '—'}
        icon={<Calculator size={16} />}
        accent="red"
        subtitle={data ? `${data.meal_count} × meal rate` : ''}
        loading={loading}
        className="stagger-4 animate-fade-up"
      />
    </div>
  );
}
