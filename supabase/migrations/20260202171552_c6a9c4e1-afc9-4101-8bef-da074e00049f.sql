-- Add benchmark and current state fields to journey_touchpoints
ALTER TABLE public.journey_touchpoints 
ADD COLUMN IF NOT EXISTS benchmark_conversion_rate DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS benchmark_velocity_days INTEGER,
ADD COLUMN IF NOT EXISTS benchmark_systems TEXT[],
ADD COLUMN IF NOT EXISTS benchmark_kpis TEXT[],
ADD COLUMN IF NOT EXISTS benchmark_value_message TEXT,
ADD COLUMN IF NOT EXISTS benchmark_owner_role TEXT,
ADD COLUMN IF NOT EXISTS current_conversion_rate DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS current_velocity_days INTEGER,
ADD COLUMN IF NOT EXISTS improvement_notes TEXT,
ADD COLUMN IF NOT EXISTS revenue_impact_estimate DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS last_analyzed_at TIMESTAMP WITH TIME ZONE;

-- Create journey_analysis_results table for storing AI analysis
CREATE TABLE public.journey_analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journey_id UUID REFERENCES public.journeys(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES public.journey_stages(id) ON DELETE CASCADE,
  touchpoint_id UUID REFERENCES public.journey_touchpoints(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('touchpoint', 'stage', 'journey', 'cross_journey')),
  findings JSONB NOT NULL DEFAULT '{}',
  recommendations JSONB NOT NULL DEFAULT '[]',
  friction_points JSONB NOT NULL DEFAULT '[]',
  estimated_impact DECIMAL(12,2),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  analyzed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_journey_analysis_journey_id ON public.journey_analysis_results(journey_id);
CREATE INDEX idx_journey_analysis_type ON public.journey_analysis_results(analysis_type);
CREATE INDEX idx_journey_analysis_created ON public.journey_analysis_results(created_at DESC);

-- Enable RLS
ALTER TABLE public.journey_analysis_results ENABLE ROW LEVEL SECURITY;

-- RLS policies for journey_analysis_results
CREATE POLICY "Users can view analysis for their journeys"
ON public.journey_analysis_results
FOR SELECT
USING (
  journey_id IN (SELECT id FROM public.journeys WHERE owner_id = auth.uid())
  OR analyzed_by = auth.uid()
);

CREATE POLICY "Users can create analysis for their journeys"
ON public.journey_analysis_results
FOR INSERT
WITH CHECK (
  journey_id IN (SELECT id FROM public.journeys WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can delete their own analysis"
ON public.journey_analysis_results
FOR DELETE
USING (analyzed_by = auth.uid());