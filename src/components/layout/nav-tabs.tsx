'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import {
  LayoutDashboard,
  Wallet,
  UtensilsCrossed,
  ShoppingCart,
  Receipt,
  Clock,
  Users,
} from 'lucide-react';

const tabs = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/deposits', label: 'Deposits', icon: Wallet },
  { href: '/meals', label: 'Meals', icon: UtensilsCrossed },
  { href: '/bazar', label: 'Bazar', icon: ShoppingCart },
  { href: '/fixed-costs', label: 'Fixed Costs', icon: Receipt },
  { href: '/activity', label: 'Activity', icon: Clock },
  { href: '/members', label: 'Members', icon: Users, adminOnly: true },
];

export function NavTabs() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  return (
    <nav className="border-b border-border">
      <div className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
        {tabs.map((tab) => {
          if (tab.adminOnly && !isAdmin) return null;
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn('nav-tab flex items-center gap-1.5', isActive && 'active')}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
