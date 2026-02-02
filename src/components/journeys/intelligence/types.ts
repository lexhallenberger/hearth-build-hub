import { Journey, JourneyStage, JourneyTouchpoint } from '@/types/journeys';

export interface FrictionPoint {
  touchpointId: string;
  touchpointName: string;
  stageName: string;
  stageId: string;
  painLevel: number;
  description: string;
  estimatedImpact: number;
  rootCause?: string;
  recommendation?: string;
}

export interface StageHealth {
  stageId: string;
  stageName: string;
  score: number;
  touchpointCount: number;
  frictionCount: number;
  momentsOfTruth: number;
  gapCount: number;
  benchmarkConversion?: number;
  currentConversion?: number;
}

export interface JourneyAnalysis {
  id: string;
  journeyId: string;
  analysisType: 'touchpoint' | 'stage' | 'journey' | 'cross_journey';
  findings: {
    summary: string;
    topFrictionPoints: FrictionPoint[];
    stageHealth: StageHealth[];
    systemicPatterns: string[];
    valueMessageGaps: number;
    techStackGaps: string[];
  };
  recommendations: Array<{
    priority: number;
    title: string;
    description: string;
    estimatedImpact: number;
    difficulty: 'low' | 'medium' | 'high';
    timeframe: string;
  }>;
  estimatedImpact: number;
  overallScore: number;
  createdAt: string;
}

export interface TouchpointComparison {
  touchpoint: JourneyTouchpoint;
  stage: JourneyStage;
  gaps: Array<{
    field: string;
    label: string;
    benchmark: string | string[] | number | null;
    current: string | string[] | number | null;
    severity: 'critical' | 'warning' | 'info';
  }>;
  improvements: string[];
  overallGapScore: number;
}

export interface WorldClassBenchmark {
  channel?: string;
  ownerRole?: string;
  systems?: string[];
  kpis?: string[];
  valueMessage?: string;
  conversionRate?: number;
  velocityDays?: number;
}

export const BENCHMARK_DEFAULTS: Record<string, WorldClassBenchmark> = {
  'Product Demo': {
    channel: 'meeting',
    ownerRole: 'Solutions Engineer',
    systems: ['Zoom', 'Gong', 'Demo Environment', 'Chili Piper'],
    kpis: ['Demo Score', 'Engagement Rating', 'Next-Step Rate'],
    valueMessage: 'Experience the solution that will transform your workflow',
    conversionRate: 80,
    velocityDays: 1,
  },
  'Discovery Call': {
    channel: 'meeting',
    ownerRole: 'Account Executive',
    systems: ['Zoom', 'Gong', 'Salesforce'],
    kpis: ['MEDDIC Score', 'Pain Level Identified', 'Budget Confirmed'],
    valueMessage: 'Understand your unique challenges and goals',
    conversionRate: 70,
    velocityDays: 2,
  },
  'Contract Negotiation': {
    channel: 'meeting',
    ownerRole: 'Account Executive',
    systems: ['DocuSign', 'Salesforce CPQ', 'Legal Review'],
    kpis: ['Time to Close', 'Discount Rate', 'Terms Variance'],
    valueMessage: 'Partner together for mutual success',
    conversionRate: 85,
    velocityDays: 7,
  },
  'Onboarding Kickoff': {
    channel: 'meeting',
    ownerRole: 'Customer Success Manager',
    systems: ['ChurnZero', 'Gainsight', 'Implementation Platform'],
    kpis: ['Time to First Value', 'Kickoff Satisfaction', 'Stakeholder Coverage'],
    valueMessage: 'Your success journey begins now',
    conversionRate: 95,
    velocityDays: 3,
  },
  'Renewal Discussion': {
    channel: 'meeting',
    ownerRole: 'Customer Success Manager',
    systems: ['Gainsight', 'Salesforce', 'Health Score Platform'],
    kpis: ['Renewal Rate', 'Expansion Rate', 'NPS Score'],
    valueMessage: 'Continue growing together with enhanced capabilities',
    conversionRate: 90,
    velocityDays: 14,
  },
};
