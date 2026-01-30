-- Phase 2: Good Deal Definition Framework

-- Create market_strategy table for company-level strategy settings
CREATE TABLE public.market_strategy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Default Strategy',
  market_mode TEXT NOT NULL DEFAULT 'revenue_optimal' CHECK (market_mode IN ('market_share', 'revenue_optimal', 'margin_optimal')),
  business_unit TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Deal Guardrails
  min_deal_value NUMERIC DEFAULT 0,
  max_discount_percent NUMERIC DEFAULT 50,
  min_contract_months INTEGER DEFAULT 12,
  max_contract_months INTEGER DEFAULT 60,
  allowed_payment_terms TEXT[] DEFAULT ARRAY['net_30', 'net_45', 'net_60'],
  
  -- Thresholds by segment
  segment_thresholds JSONB DEFAULT '{
    "enterprise": {"min_value": 100000, "max_discount": 20},
    "mid_market": {"min_value": 25000, "max_discount": 30},
    "smb": {"min_value": 5000, "max_discount": 40},
    "startup": {"min_value": 1000, "max_discount": 50}
  }'::jsonb,
  
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on market_strategy
ALTER TABLE public.market_strategy ENABLE ROW LEVEL SECURITY;

-- RLS policies for market_strategy
CREATE POLICY "Authenticated users can view active strategies"
  ON public.market_strategy FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage all strategies"
  ON public.market_strategy FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Executives can view all strategies"
  ON public.market_strategy FOR SELECT
  USING (has_role(auth.uid(), 'executive'::app_role));

-- Add market mode weights to scoring_attributes
ALTER TABLE public.scoring_attributes
  ADD COLUMN scoring_logic JSONB DEFAULT '{
    "green_min": 70,
    "yellow_min": 40,
    "red_max": 39
  }'::jsonb,
  ADD COLUMN market_mode_weights JSONB DEFAULT '{
    "market_share": 1.0,
    "revenue_optimal": 1.0,
    "margin_optimal": 1.0
  }'::jsonb;

-- Create trigger for market_strategy updated_at
CREATE TRIGGER update_market_strategy_updated_at
  BEFORE UPDATE ON public.market_strategy
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default market strategy
INSERT INTO public.market_strategy (
  name, 
  market_mode, 
  is_active
) VALUES (
  'Default Revenue Strategy',
  'revenue_optimal',
  true
);