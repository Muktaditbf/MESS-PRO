'use client';

import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-11 h-11 text-sm',
};

export function Avatar({ name, color = '#00b4a6', size = 'md', className }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold text-white shrink-0',
        sizes[size],
        className
      )}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials}
    </div>
  );
}
