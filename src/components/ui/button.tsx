'use client';

import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    secondary: 'btn-secondary',
  }[variant];

  const sizeClass = {
    sm: '!py-2 !px-3 !text-xs',
    md: '',
    lg: '!py-3 !px-6 !text-base',
  }[size];

  return (
    <button
      className={cn(variantClass, sizeClass, className)}
      disabled={disabled || loading}
      {...props}
    >
      <span className="flex items-center justify-center gap-2">
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          icon
        )}
        {children}
      </span>
    </button>
  );
}
