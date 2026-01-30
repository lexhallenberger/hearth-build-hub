-- Create enum for journey type
CREATE TYPE public.journey_type AS ENUM ('customer', 'seller', 'partner', 'deal');

-- Create journeys table
CREATE TABLE public.journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  journey_type journey_type NOT NULL,
  
  -- Visual settings
  color TEXT DEFAULT '#3b82f6',
  
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create journey_stages table
CREATE TABLE public.journey_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Position in the journey
  stage_order INTEGER NOT NULL DEFAULT 0,
  
  -- Metrics
  target_conversion_rate DECIMAL(5,2),
  target_time_days INTEGER,
  
  -- Visual settings
  color TEXT,
  icon TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create journey_touchpoints table
CREATE TABLE public.journey_touchpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES public.journey_stages(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Type of touchpoint
  touchpoint_type TEXT NOT NULL DEFAULT 'action', -- 'action', 'decision', 'communication', 'milestone'
  
  -- Position within stage
  touchpoint_order INTEGER NOT NULL DEFAULT 0,
  
  -- Associated channel
  channel TEXT, -- 'email', 'phone', 'meeting', 'web', 'in-person', etc.
  
  -- Owner/responsible party
  owner_role TEXT,
  
  -- Metrics
  is_moment_of_truth BOOLEAN DEFAULT false,
  pain_point_level INTEGER DEFAULT 0, -- 0-5, 0 = no pain
  
  -- Content/Value messaging
  value_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create journey_metrics table for tracking actual performance
CREATE TABLE public.journey_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES public.journey_stages(id) ON DELETE CASCADE,
  
  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Metrics
  entries INTEGER DEFAULT 0,
  exits INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  avg_time_in_stage_days DECIMAL(10,2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_metrics ENABLE ROW LEVEL SECURITY;

-- Journeys policies
CREATE POLICY "Users can view their own journeys"
  ON public.journeys FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can view template journeys"
  ON public.journeys FOR SELECT
  USING (is_template = true);

CREATE POLICY "Admins and executives can view all journeys"
  ON public.journeys FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'executive')
  );

CREATE POLICY "Authenticated users can create journeys"
  ON public.journeys FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own journeys"
  ON public.journeys FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can update any journey"
  ON public.journeys FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own journeys"
  ON public.journeys FOR DELETE
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can delete any journey"
  ON public.journeys FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Journey stages policies (inherit from journey access)
CREATE POLICY "Users can view stages of accessible journeys"
  ON public.journey_stages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.journeys 
      WHERE journeys.id = journey_stages.journey_id 
      AND (journeys.owner_id = auth.uid() OR journeys.is_template = true)
    ) OR
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'executive')
  );

CREATE POLICY "Users can manage stages of their journeys"
  ON public.journey_stages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.journeys 
      WHERE journeys.id = journey_stages.journey_id 
      AND journeys.owner_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

-- Journey touchpoints policies
CREATE POLICY "Users can view touchpoints of accessible stages"
  ON public.journey_touchpoints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.journey_stages js
      JOIN public.journeys j ON j.id = js.journey_id
      WHERE js.id = journey_touchpoints.stage_id 
      AND (j.owner_id = auth.uid() OR j.is_template = true)
    ) OR
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'executive')
  );

CREATE POLICY "Users can manage touchpoints of their journeys"
  ON public.journey_touchpoints FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.journey_stages js
      JOIN public.journeys j ON j.id = js.journey_id
      WHERE js.id = journey_touchpoints.stage_id 
      AND j.owner_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

-- Journey metrics policies
CREATE POLICY "Users can view metrics of accessible journeys"
  ON public.journey_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.journeys 
      WHERE journeys.id = journey_metrics.journey_id 
      AND (journeys.owner_id = auth.uid() OR journeys.is_template = true)
    ) OR
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'executive')
  );

CREATE POLICY "Admins can manage metrics"
  ON public.journey_metrics FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at triggers
CREATE TRIGGER update_journeys_updated_at
  BEFORE UPDATE ON public.journeys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journey_stages_updated_at
  BEFORE UPDATE ON public.journey_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journey_touchpoints_updated_at
  BEFORE UPDATE ON public.journey_touchpoints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert template journeys
INSERT INTO public.journeys (owner_id, name, description, journey_type, is_template, color)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'B2B SaaS Customer Journey',
  'Standard customer journey for B2B SaaS sales',
  'customer',
  true,
  '#3b82f6'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO public.journeys (owner_id, name, description, journey_type, is_template, color)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'Enterprise Sales Process',
  'Standard seller journey for enterprise deals',
  'seller',
  true,
  '#10b981'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);