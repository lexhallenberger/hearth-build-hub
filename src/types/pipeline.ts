import { Database } from '@/integrations/supabase/types';

export type LeadStatus = Database['public']['Enums']['lead_status'];
export type OpportunityStage = Database['public']['Enums']['opportunity_stage'];

export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  source: string | null;
  status: LeadStatus;
  score: number | null;
  pain_points: string[] | null;
  interests: string[] | null;
  value_proposition_fit: string | null;
  notes: string | null;
  owner_id: string;
  campaign_id: string | null;
  converted_at: string | null;
  converted_to_opportunity_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  user_id: string;
  activity_type: string;
  subject: string | null;
  description: string | null;
  outcome: string | null;
  created_at: string;
}

export interface Opportunity {
  id: string;
  name: string;
  company: string;
  contact_name: string | null;
  contact_email: string | null;
  stage: OpportunityStage;
  amount: number | null;
  probability: number | null;
  expected_close_date: string | null;
  actual_close_date: string | null;
  primary_value_message: string | null;
  competitive_situation: string | null;
  lost_reason: string | null;
  owner_id: string;
  lead_id: string | null;
  campaign_id: string | null;
  deal_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  campaign_type: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  actual_spend: number | null;
  target_leads: number | null;
  is_active: boolean | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ValueMessage {
  id: string;
  title: string;
  message: string;
  category: string | null;
  target_industry: string | null;
  target_persona: string | null;
  usage_count: number | null;
  win_rate: number | null;
  is_active: boolean | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-500' },
  contacted: { label: 'Contacted', color: 'bg-yellow-500' },
  qualified: { label: 'Qualified', color: 'bg-green-500' },
  unqualified: { label: 'Unqualified', color: 'bg-muted' },
  converted: { label: 'Converted', color: 'bg-purple-500' },
};

export const OPPORTUNITY_STAGE_CONFIG: Record<OpportunityStage, { label: string; color: string; probability: number }> = {
  discovery: { label: 'Discovery', color: 'bg-blue-500', probability: 10 },
  qualification: { label: 'Qualification', color: 'bg-cyan-500', probability: 25 },
  proposal: { label: 'Proposal', color: 'bg-yellow-500', probability: 50 },
  negotiation: { label: 'Negotiation', color: 'bg-orange-500', probability: 75 },
  closed_won: { label: 'Closed Won', color: 'bg-green-500', probability: 100 },
  closed_lost: { label: 'Closed Lost', color: 'bg-red-500', probability: 0 },
};

export const LEAD_SOURCES = [
  'Website',
  'Referral',
  'LinkedIn',
  'Trade Show',
  'Cold Outreach',
  'Inbound Call',
  'Partner',
  'Other',
] as const;

export const ACTIVITY_TYPES = [
  'Call',
  'Email',
  'Meeting',
  'Demo',
  'Proposal Sent',
  'Follow-up',
  'Note',
] as const;
