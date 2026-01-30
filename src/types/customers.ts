export type CustomerTier = 'enterprise' | 'mid_market' | 'smb' | 'startup';
export type HealthStatus = 'healthy' | 'at_risk' | 'critical';
export type RenewalStatus = 'upcoming' | 'in_progress' | 'renewed' | 'churned' | 'expanded';

export interface Customer {
  id: string;
  name: string;
  industry: string | null;
  tier: CustomerTier;
  contract_start_date: string | null;
  contract_end_date: string | null;
  mrr: number;
  arr: number;
  health_score: number;
  health_status: HealthStatus;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  logo_url: string | null;
  notes: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerHealthScore {
  id: string;
  customer_id: string;
  score: number;
  indicators: Record<string, number>;
  scored_at: string;
  scored_by: string | null;
  created_at: string;
}

export interface Renewal {
  id: string;
  customer_id: string;
  deal_id: string | null;
  status: RenewalStatus;
  renewal_date: string;
  current_value: number;
  proposed_value: number;
  risk_level: string;
  risk_factors: string[] | null;
  notes: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export const TIER_LABELS: Record<CustomerTier, string> = {
  enterprise: 'Enterprise',
  mid_market: 'Mid-Market',
  smb: 'SMB',
  startup: 'Startup',
};

export const TIER_COLORS: Record<CustomerTier, string> = {
  enterprise: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  mid_market: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  smb: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  startup: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

export const HEALTH_STATUS_LABELS: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  at_risk: 'At Risk',
  critical: 'Critical',
};

export const HEALTH_STATUS_COLORS: Record<HealthStatus, string> = {
  healthy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  at_risk: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export const RENEWAL_STATUS_LABELS: Record<RenewalStatus, string> = {
  upcoming: 'Upcoming',
  in_progress: 'In Progress',
  renewed: 'Renewed',
  churned: 'Churned',
  expanded: 'Expanded',
};

export const RENEWAL_STATUS_COLORS: Record<RenewalStatus, string> = {
  upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  renewed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  churned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  expanded: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};
