'use client';

import { useAuth } from '@/contexts/auth-context';
import { Avatar } from '@/components/ui/avatar';
import { getMonthProgress, monthName, getCurrentMonth } from '@/lib/utils';
import { Bell, LogOut, Settings, Home } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function TopBar() {
  const { profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { month, year } = getCurrentMonth();
  const { daysPassed, daysLeft } = getMonthProgress();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-base/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Logo + Date Info */}
        <div className="flex items-center gap-3">
          <div
            className="flex cursor-pointer items-center gap-2"
            onClick={() => router.push('/dashboard')}
          >
            <Home size={18} className="text-teal" />
            <span className="text-base font-bold text-text-primary">
              Pro Mess
            </span>
          </div>
          <span className="hidden text-xs text-text-muted sm:inline">
            {monthName(month)} {year} · Day {daysPassed} · {daysLeft} days left
          </span>
        </div>

        {/* Right: Bell + Avatar Dropdown */}
        <div className="flex items-center gap-3">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text-secondary"
            title="Notifications"
          >
            <Bell size={16} />
          </button>

          {profile && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-surface-hover"
              >
                <Avatar
                  name={profile.name}
                  color={profile.avatar_color}
                  size="sm"
                />
                <span className="hidden text-sm font-medium text-text-secondary sm:inline">
                  {profile.name}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 animate-scale-in glass-card-static overflow-hidden p-1">
                  <div className="border-b border-border px-3 py-2">
                    <p className="text-sm font-medium text-text-primary">
                      {profile.name}
                    </p>
                    <p className="text-xs text-text-muted capitalize">
                      {profile.role}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      router.push('/settings');
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover"
                  >
                    <Settings size={14} />
                    Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-negative transition-colors hover:bg-negative-dim"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
