'use client';

import { StatCard } from '@/components/ui/stat-card';
import { formatCurrency } from '@/lib/utils';
import { Banknote, ShoppingCart, UtensilsCrossed, Calculator } from 'lucide-react';

interface MessOverviewProps {
  data?: {
    total_deposits: number;
    total_bazar: number;
    total_meals: number;
    meal_rate: number;
  };
  loading: boolean;
}

export function MessOverview({ data, loading }: MessOverviewProps) {
  return (
    <div className="bento-row-4">
      <StatCard
        label="Total Deposits"
        value={data ? formatCurrency(Math.round(data.total_deposits)) : '—'}
        icon={<Banknote size={16} />}
        accent="teal"
        subtitle="all members"
        loading={loading}
        className="stagger-1 animate-fade-up"
      />
      <StatCard
        label="Total Bazar"
        value={data ? formatCurrency(Math.round(data.total_bazar)) : '—'}
        icon={<ShoppingCart size={16} />}
        accent="amber"
        subtitle="this month"
        loading={loading}
        className="stagger-2 animate-fade-up"
      />
      <StatCard
        label="Total Meals"
        value={data ? String(data.total_meals) : '—'}
        icon={<UtensilsCrossed size={16} />}
        accent="default"
        subtitle="all members"
        loading={loading}
        className="stagger-3 animate-fade-up"
      />
      <StatCard
        label="Meal Rate"
        value={data ? formatCurrency(Math.round(data.meal_rate * 100) / 100) : '—'}
        icon={<Calculator size={16} />}
        accent="default"
        subtitle="per meal"
        loading={loading}
        className="stagger-4 animate-fade-up"
      />
    </div>
  );
}
