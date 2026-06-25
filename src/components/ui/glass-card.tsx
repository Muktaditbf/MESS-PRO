'use client';

import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: string;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  hover = true,
  padding = 'p-4',
  onClick,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        hover ? 'glass-card' : 'glass-card-static',
        padding,
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
