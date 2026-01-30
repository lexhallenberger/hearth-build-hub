-- Phase 1: Journey Command Center Schema

-- Create user_preferences table for dashboard customization
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  default_journey_id UUID REFERENCES public.journeys(id) ON DELETE SET NULL,
  dashboard_layout JSONB DEFAULT '{}'::jsonb,
  recent_items JSONB DEFAULT '{"journeys": [], "deals": [], "customers": []}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Add journey stage linking to deals
ALTER TABLE public.deals
  ADD COLUMN journey_stage_id UUID REFERENCES public.journey_stages(id) ON DELETE SET NULL,
  ADD COLUMN touchpoint_ids UUID[] DEFAULT '{}'::uuid[];

-- Add journey linking to customers
ALTER TABLE public.customers
  ADD COLUMN journey_id UUID REFERENCES public.journeys(id) ON DELETE SET NULL,
  ADD COLUMN current_stage_id UUID REFERENCES public.journey_stages(id) ON DELETE SET NULL;

-- Create trigger for user_preferences updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster journey-related lookups
CREATE INDEX idx_deals_journey_stage ON public.deals(journey_stage_id);
CREATE INDEX idx_customers_journey ON public.customers(journey_id);
CREATE INDEX idx_customers_stage ON public.customers(current_stage_id);