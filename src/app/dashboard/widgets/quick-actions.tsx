'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { useRouter } from 'next/navigation';
import { UtensilsCrossed, ShoppingCart, Wallet, UserPlus } from 'lucide-react';

interface QuickActionsProps {
  isAdmin: boolean;
}

const actions = [
  { label: '+ Meal', icon: UtensilsCrossed, href: '/meals' },
  { label: '+ Bazar', icon: ShoppingCart, href: '/bazar' },
  { label: '+ Deposit', icon: Wallet, href: '/deposits' },
  { label: '+ Member', icon: UserPlus, href: '/members', adminOnly: true },
];

export function QuickActions({ isAdmin }: QuickActionsProps) {
  const router = useRouter();

  return (
    <GlassCard hover={false}>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
        Quick Actions {!isAdmin && '(Admin Only)'}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          if (action.adminOnly && !isAdmin) return null;
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              onClick={() => router.push(action.href)}
              disabled={!isAdmin}
              className="btn-ghost flex items-center justify-center gap-2 !py-3 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Icon size={14} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
