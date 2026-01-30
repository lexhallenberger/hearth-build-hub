export type AppRole = 'admin' | 'sales_rep' | 'deal_desk' | 'finance' | 'executive';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  team: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
  roles: AppRole[];
}

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrator',
  sales_rep: 'Sales Representative',
  deal_desk: 'Deal Desk',
  finance: 'Finance',
  executive: 'Executive',
};

export const ROLE_COLORS: Record<AppRole, string> = {
  admin: 'bg-accent text-accent-foreground',
  sales_rep: 'bg-success text-success-foreground',
  deal_desk: 'bg-warning text-warning-foreground',
  finance: 'bg-chart-4 text-white',
  executive: 'bg-chart-5 text-white',
};
