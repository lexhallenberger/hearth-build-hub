export type DealStatus = 'draft' | 'pending_score' | 'pending_approval' | 'approved' | 'rejected' | 'closed_won' | 'closed_lost';
export type DealClassification = 'green' | 'yellow' | 'red';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated';
export type ScoringCategory = 'financial' | 'strategic' | 'risk' | 'customer';

export interface Deal {
  id: string;
  owner_id: string;
  name: string;
  customer_name: string;
  description: string | null;
  deal_value: number;
  discount_percent: number;
  payment_terms: string | null;
  contract_length_months: number;
  products: string[];
  status: DealStatus;
  classification: DealClassification | null;
  total_score: number | null;
  expected_close_date: string | null;
  actual_close_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScoringAttribute {
  id: string;
  name: string;
  description: string | null;
  category: ScoringCategory;
  weight: number;
  evaluation_type: 'scale' | 'boolean' | 'threshold';
  min_value: number;
  max_value: number;
  green_threshold: number | null;
  yellow_threshold: number | null;
  higher_is_better: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ScoringThreshold {
  id: string;
  green_min: number;
  yellow_min: number;
  auto_approve_green: boolean;
  created_at: string;
  updated_at: string;
}

export interface DealScore {
  id: string;
  deal_id: string;
  attribute_id: string;
  raw_value: number;
  normalized_score: number;
  notes: string | null;
  scored_by: string | null;
  scored_at: string;
  attribute?: ScoringAttribute;
}

export interface DealApproval {
  id: string;
  deal_id: string;
  requested_by: string;
  assigned_to: string | null;
  status: ApprovalStatus;
  approval_level: number;
  request_notes: string | null;
  response_notes: string | null;
  requested_at: string;
  responded_at: string | null;
  created_at: string;
}

export interface DealNote {
  id: string;
  deal_id: string;
  user_id: string;
  note_type: 'comment' | 'status_change' | 'score_update' | 'approval';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const STATUS_LABELS: Record<DealStatus, string> = {
  draft: 'Draft',
  pending_score: 'Pending Score',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

export const STATUS_COLORS: Record<DealStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending_score: 'bg-warning/20 text-warning',
  pending_approval: 'bg-accent/20 text-accent',
  approved: 'bg-success/20 text-success',
  rejected: 'bg-destructive/20 text-destructive',
  closed_won: 'bg-success text-success-foreground',
  closed_lost: 'bg-destructive text-destructive-foreground',
};

export const CLASSIFICATION_LABELS: Record<DealClassification, string> = {
  green: 'Green',
  yellow: 'Yellow',
  red: 'Red',
};

export const CLASSIFICATION_COLORS: Record<DealClassification, string> = {
  green: 'bg-success text-success-foreground',
  yellow: 'bg-warning text-warning-foreground',
  red: 'bg-destructive text-destructive-foreground',
};

export const CATEGORY_LABELS: Record<ScoringCategory, string> = {
  financial: 'Financial',
  strategic: 'Strategic',
  risk: 'Risk',
  customer: 'Customer',
};

export const CATEGORY_COLORS: Record<ScoringCategory, string> = {
  financial: 'bg-chart-1/20 text-chart-1 border-chart-1',
  strategic: 'bg-chart-4/20 text-chart-4 border-chart-4',
  risk: 'bg-chart-3/20 text-chart-3 border-chart-3',
  customer: 'bg-chart-2/20 text-chart-2 border-chart-2',
};
