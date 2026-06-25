import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format date as "Jun 25, 2026" */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

/** Format date as "Jun 25, 2026 at 3:42 PM" */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

/** Format currency with ৳ symbol */
export function formatCurrency(amount: number): string {
  return `৳${amount.toLocaleString('en-IN')}`;
}

/** Deterministic avatar color from name (no blue) */
const AVATAR_COLORS = [
  '#10b981', '#00b4a6', '#f59e0b', '#e11d48',
  '#06b6d4', '#ec4899', '#8b5cf6', '#a78bfa',
];

export function avatarColor(name: string): string {
  const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/** Get initials from name (e.g. "Muktadi" → "M", "John Doe" → "JD") */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Get relative time (e.g. "5 min ago") */
export function relativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/** Get current month/year */
export function getCurrentMonth(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

/** Get days info for current month */
export function getMonthProgress(): {
  daysPassed: number;
  totalDays: number;
  percentage: number;
  daysLeft: number;
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const daysPassed = now.getDate();
  const daysLeft = totalDays - daysPassed;
  const percentage = Math.round((daysPassed / totalDays) * 100);
  return { daysPassed, totalDays, percentage, daysLeft };
}

/** Generate dummy email from name (for Supabase auth) */
export function nameToDummyEmail(name: string): string {
  return `${name.toLowerCase().trim().replace(/\s+/g, '.')}@promess.local`;
}

/** Format month name from number */
export function monthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[month - 1] || '';
}
