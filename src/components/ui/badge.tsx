'use client';

import { cn } from '@/lib/utils';

type BadgeVariant = 'teal' | 'amber' | 'purple' | 'red' | 'gray' | 'teal-dark' | 'teal-muted';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  teal: 'badge-teal',
  amber: 'badge-amber',
  purple: 'badge-purple',
  red: 'badge-red',
  gray: 'badge-gray',
  'teal-dark': 'bg-[rgba(0,140,130,0.2)] text-[#00a89b]',
  'teal-muted': 'bg-[rgba(0,180,166,0.08)] text-[#4dd8cd]',
};

/** Get badge variant for audit event types */
export function getEventBadgeVariant(eventType: string): BadgeVariant {
  if (eventType.includes('login') || eventType.includes('logout') || eventType.includes('password') || eventType === 'member_create') return 'gray';
  if (eventType.includes('meal')) return 'teal';
  if (eventType.includes('bazar')) return 'amber';
  if (eventType.includes('deposit')) return 'teal-dark';
  if (eventType.includes('fixed_cost')) return 'purple';
  if (eventType.includes('rotation')) return 'teal-muted';
  if (eventType === 'member_delete' || eventType === 'member_role_change') return 'amber';
  return 'gray';
}

/** Get human-readable event label */
export function getEventLabel(eventType: string): string {
  const labels: Record<string, string> = {
    login: 'login',
    logout: 'logout',
    member_create: 'member',
    member_delete: 'member',
    member_role_change: 'role',
    password_reset: 'password',
    password_self_change: 'password',
    meal_add: 'meal',
    meal_add_for: 'meal',
    meal_edit: 'meal edit',
    meal_edit_for: 'meal edit',
    meal_delete: 'meal delete',
    bazar_add: 'bazar',
    bazar_edit: 'bazar edit',
    bazar_delete: 'bazar delete',
    deposit_add: 'deposit',
    deposit_edit: 'deposit edit',
    deposit_delete: 'deposit delete',
    fixed_cost_add: 'fixed cost',
    fixed_cost_edit: 'fixed cost edit',
    fixed_cost_delete: 'fixed cost delete',
    rotation_assign: 'rotation',
    rotation_change: 'rotation',
    rotation_skip: 'rotation',
    rotation_done: 'rotation',
  };
  return labels[eventType] || eventType.replace(/_/g, ' ');
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span className={cn('badge', variantClasses[variant], className)}>
      {children}
    </span>
  );
}
