/* ═══════════════════════════════════════════════════════════
   TypeScript Interfaces for Pro Mess
   ═══════════════════════════════════════════════════════════ */

export type Role = 'admin' | 'member';

export interface Profile {
  id: string;
  name: string;
  role: Role;
  avatar_color: string;
  must_change_password: boolean;
  created_at: string;
}

export interface Meal {
  id: string;
  member_id: string;
  date: string;
  count: number;
  added_by: string;
  created_at: string;
  updated_at: string;
  // Joined
  member_name?: string;
  added_by_name?: string;
}

export interface Deposit {
  id: string;
  member_id: string;
  amount: number;
  month: number;
  year: number;
  note: string | null;
  added_by: string;
  created_at: string;
  // Joined
  member_name?: string;
  member_avatar_color?: string;
}

export interface BazarEntry {
  id: string;
  amount: number;
  date: string;
  items_note: string | null;
  duty_member: string | null;
  added_by: string;
  month: number;
  year: number;
  created_at: string;
  // Joined
  duty_member_name?: string;
  added_by_name?: string;
}

export interface FixedCost {
  id: string;
  category: 'rent' | 'gas' | 'electricity' | 'internet' | 'other';
  amount: number;
  month: number;
  year: number;
  note: string | null;
  added_by: string;
  created_at: string;
  // Joined
  added_by_name?: string;
}

export interface BazarRotation {
  id: string;
  member_id: string;
  assigned_date: string;
  status: 'upcoming' | 'done' | 'skipped';
  rotation_order: number;
  created_at: string;
  // Joined
  member_name?: string;
  member_avatar_color?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  event_type: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  // Joined
  actor_name?: string;
  actor_avatar_color?: string;
}

// Dashboard computed types
export interface MemberBalance {
  id: string;
  name: string;
  avatar_color: string;
  total_deposit: number;
  meal_count: number;
  meal_cost: number;
  net_balance: number;
}

export interface DashboardData {
  personal: {
    net_balance: number;
    deposit: number;
    meal_count: number;
    meal_cost: number;
  };
  mess: {
    total_deposits: number;
    total_bazar: number;
    total_meals: number;
    meal_rate: number;
  };
  members: MemberBalance[];
  month_progress: {
    days_passed: number;
    total_days: number;
    percentage: number;
  };
  rotation_next: BazarRotation[];
  recent_activity: AuditLog[];
  fixed_cost: {
    total: number;
    per_head: number;
    breakdown: { category: string; amount: number }[];
  };
  highlights: {
    most_meals: { name: string; count: number } | null;
    top_depositor: { name: string; amount: number } | null;
    most_bazar_trips: { name: string; count: number } | null;
    least_meals: { name: string; count: number } | null;
  };
}
