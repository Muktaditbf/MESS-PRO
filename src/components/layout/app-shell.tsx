'use client';

import { type ReactNode } from 'react';
import { TopBar } from './top-bar';
import { NavTabs } from './nav-tabs';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <NavTabs />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6">
        {children}
      </main>
    </div>
  );
}
