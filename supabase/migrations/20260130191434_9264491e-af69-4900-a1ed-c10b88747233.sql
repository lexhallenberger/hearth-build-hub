-- Phase 3: Digital Deal Governance Schema

-- Create deal_segments table for Deal Size x Score matrix
CREATE TABLE public.deal_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Size thresholds
  min_deal_value NUMERIC NOT NULL DEFAULT 0,
  max_deal_value NUMERIC,
  
  -- Score thresholds
  min_score NUMERIC NOT NULL DEFAULT 0,
  max_score NUMERIC NOT NULL DEFAULT 100,
  
  -- Approval configuration
  approval_level INTEGER NOT NULL DEFAULT 1 CHECK (approval_level BETWEEN 1 AND 4),
  approval_sla_hours INTEGER NOT NULL DEFAULT 24,
  touch_model TEXT NOT NULL DEFAULT 'mid_touch' CHECK (touch_model IN ('no_touch', 'low_touch', 'mid_touch', 'high_touch')),
  auto_approve_enabled BOOLEAN NOT NULL DEFAULT false,
  
  -- Approver roles
  approver_roles TEXT[] DEFAULT ARRAY['deal_desk'],
  escalation_roles TEXT[] DEFAULT ARRAY['executive'],
  
  -- Priority and display
  priority INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#3b82f6',
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on deal_segments
ALTER TABLE public.deal_segments ENABLE ROW LEVEL SECURITY;

-- RLS policies for deal_segments
CREATE POLICY "Authenticated users can view segments"
  ON public.deal_segments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage segments"
  ON public.deal_segments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for deal_segments updated_at
CREATE TRIGGER update_deal_segments_updated_at
  BEFORE UPDATE ON public.deal_segments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add segment reference to deals
ALTER TABLE public.deals
  ADD COLUMN segment_id UUID REFERENCES public.deal_segments(id) ON DELETE SET NULL,
  ADD COLUMN auto_approved BOOLEAN DEFAULT false,
  ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN approved_by UUID;

-- Create index for segment lookups
CREATE INDEX idx_deals_segment ON public.deals(segment_id);
CREATE INDEX idx_deals_status_pending ON public.deals(status) WHERE status = 'pending_approval';

-- Insert default deal segments based on Accenture matrix
INSERT INTO public.deal_segments (name, description, min_deal_value, max_deal_value, min_score, max_score, approval_level, approval_sla_hours, touch_model, auto_approve_enabled, approver_roles, priority, color) VALUES
  -- Green deals (high score)
  ('Green - Enterprise', 'High-value green deals requiring executive awareness', 100000, NULL, 70, 100, 1, 4, 'low_touch', true, ARRAY['deal_desk'], 1, '#22c55e'),
  ('Green - Mid-Market', 'Mid-market green deals auto-approved', 25000, 99999, 70, 100, 1, 2, 'no_touch', true, ARRAY['deal_desk'], 2, '#22c55e'),
  ('Green - SMB', 'Small green deals auto-approved', 0, 24999, 70, 100, 1, 1, 'no_touch', true, ARRAY['sales_rep'], 3, '#22c55e'),
  
  -- Yellow deals (medium score)
  ('Yellow - Enterprise', 'High-value yellow deals requiring Deal Desk review', 100000, NULL, 40, 69, 2, 24, 'mid_touch', false, ARRAY['deal_desk', 'finance'], 4, '#f59e0b'),
  ('Yellow - Mid-Market', 'Mid-market yellow deals needing approval', 25000, 99999, 40, 69, 2, 12, 'mid_touch', false, ARRAY['deal_desk'], 5, '#f59e0b'),
  ('Yellow - SMB', 'Small yellow deals with quick review', 0, 24999, 40, 69, 1, 8, 'low_touch', false, ARRAY['deal_desk'], 6, '#f59e0b'),
  
  -- Red deals (low score)
  ('Red - Enterprise', 'High-value red deals requiring executive approval', 100000, NULL, 0, 39, 4, 48, 'high_touch', false, ARRAY['executive', 'finance'], 7, '#ef4444'),
  ('Red - Mid-Market', 'Mid-market red deals needing senior review', 25000, 99999, 0, 39, 3, 36, 'high_touch', false, ARRAY['deal_desk', 'executive'], 8, '#ef4444'),
  ('Red - SMB', 'Small red deals with Deal Desk review', 0, 24999, 0, 39, 2, 24, 'mid_touch', false, ARRAY['deal_desk'], 9, '#ef4444');