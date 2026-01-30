export type JourneyType = 'customer' | 'seller' | 'partner' | 'deal';
export type TouchpointType = 'action' | 'decision' | 'communication' | 'milestone';

export interface Journey {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  journey_type: JourneyType;
  color: string;
  is_template: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stages?: JourneyStage[];
}

export interface JourneyStage {
  id: string;
  journey_id: string;
  name: string;
  description: string | null;
  stage_order: number;
  target_conversion_rate: number | null;
  target_time_days: number | null;
  color: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
  touchpoints?: JourneyTouchpoint[];
}

export interface JourneyTouchpoint {
  id: string;
  stage_id: string;
  name: string;
  description: string | null;
  touchpoint_type: TouchpointType;
  touchpoint_order: number;
  channel: string | null;
  owner_role: string | null;
  is_moment_of_truth: boolean;
  pain_point_level: number;
  value_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface JourneyMetrics {
  id: string;
  journey_id: string;
  stage_id: string | null;
  period_start: string;
  period_end: string;
  entries: number;
  exits: number;
  conversions: number;
  avg_time_in_stage_days: number | null;
  created_at: string;
}

export const JOURNEY_TYPE_LABELS: Record<JourneyType, string> = {
  customer: 'Customer Journey',
  seller: 'Seller Journey',
  partner: 'Partner Journey',
  deal: 'Deal Journey',
};

export const JOURNEY_TYPE_COLORS: Record<JourneyType, string> = {
  customer: 'bg-chart-1 text-white',
  seller: 'bg-chart-2 text-white',
  partner: 'bg-chart-4 text-white',
  deal: 'bg-chart-3 text-white',
};

export const JOURNEY_TYPE_DESCRIPTIONS: Record<JourneyType, string> = {
  customer: 'Map the customer experience from awareness to advocacy',
  seller: 'Define the sales process stages and activities',
  partner: 'Track channel partner engagement and enablement',
  deal: 'Visualize the deal lifecycle from opportunity to close',
};

export const TOUCHPOINT_TYPE_LABELS: Record<TouchpointType, string> = {
  action: 'Action',
  decision: 'Decision Point',
  communication: 'Communication',
  milestone: 'Milestone',
};

export const TOUCHPOINT_TYPE_ICONS: Record<TouchpointType, string> = {
  action: 'play',
  decision: 'git-branch',
  communication: 'message-circle',
  milestone: 'flag',
};

export const CHANNEL_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'web', label: 'Web/Portal' },
  { value: 'in-person', label: 'In-Person' },
  { value: 'chat', label: 'Chat/Messaging' },
  { value: 'social', label: 'Social Media' },
  { value: 'document', label: 'Document/Proposal' },
];
