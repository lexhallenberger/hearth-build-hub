-- Create enum for deal status
CREATE TYPE public.deal_status AS ENUM (
  'draft',
  'pending_score',
  'pending_approval',
  'approved',
  'rejected',
  'closed_won',
  'closed_lost'
);

-- Create enum for deal classification (score result)
CREATE TYPE public.deal_classification AS ENUM ('green', 'yellow', 'red');

-- Create enum for approval status
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected', 'escalated');

-- Create enum for scoring attribute category
CREATE TYPE public.scoring_category AS ENUM ('financial', 'strategic', 'risk', 'customer');

-- Create deals table
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  description TEXT,
  
  -- Financial details
  deal_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  payment_terms TEXT,
  contract_length_months INTEGER DEFAULT 12,
  
  -- Products/Services
  products JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  status deal_status NOT NULL DEFAULT 'draft',
  classification deal_classification,
  total_score DECIMAL(5,2),
  
  -- Dates
  expected_close_date DATE,
  actual_close_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scoring_attributes table (configurable by admins)
CREATE TABLE public.scoring_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  description TEXT,
  category scoring_category NOT NULL,
  
  -- Weight for scoring calculation (1-100)
  weight INTEGER NOT NULL DEFAULT 10 CHECK (weight >= 1 AND weight <= 100),
  
  -- How to evaluate this attribute
  evaluation_type TEXT NOT NULL DEFAULT 'scale', -- 'scale', 'boolean', 'threshold'
  
  -- For scale type: min/max values
  min_value DECIMAL(10,2) DEFAULT 0,
  max_value DECIMAL(10,2) DEFAULT 100,
  
  -- For threshold type: thresholds for green/yellow/red
  green_threshold DECIMAL(10,2),
  yellow_threshold DECIMAL(10,2),
  
  -- Whether higher is better
  higher_is_better BOOLEAN DEFAULT true,
  
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scoring_thresholds table (global thresholds for classification)
CREATE TABLE public.scoring_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  green_min DECIMAL(5,2) NOT NULL DEFAULT 70,
  yellow_min DECIMAL(5,2) NOT NULL DEFAULT 40,
  -- Below yellow_min is red
  
  auto_approve_green BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deal_scores table (individual attribute scores per deal)
CREATE TABLE public.deal_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES public.scoring_attributes(id) ON DELETE CASCADE,
  
  raw_value DECIMAL(10,2) NOT NULL,
  normalized_score DECIMAL(5,2) NOT NULL, -- 0-100
  
  notes TEXT,
  scored_by UUID REFERENCES auth.users(id),
  scored_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(deal_id, attribute_id)
);

-- Create deal_approvals table
CREATE TABLE public.deal_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  
  status approval_status NOT NULL DEFAULT 'pending',
  
  -- Approval level (1 = first level, 2 = escalated, etc.)
  approval_level INTEGER NOT NULL DEFAULT 1,
  
  request_notes TEXT,
  response_notes TEXT,
  
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deal_notes table for activity history
CREATE TABLE public.deal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  note_type TEXT NOT NULL DEFAULT 'comment', -- 'comment', 'status_change', 'score_update', 'approval'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_notes ENABLE ROW LEVEL SECURITY;

-- Deals policies
CREATE POLICY "Users can view their own deals"
  ON public.deals FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins and executives can view all deals"
  ON public.deals FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'executive') OR
    public.has_role(auth.uid(), 'deal_desk') OR
    public.has_role(auth.uid(), 'finance')
  );

CREATE POLICY "Authenticated users can create deals"
  ON public.deals FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Deal owners can update their deals"
  ON public.deals FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins and deal desk can update any deal"
  ON public.deals FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'deal_desk')
  );

CREATE POLICY "Admins can delete deals"
  ON public.deals FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Scoring attributes policies (read by all authenticated, write by admin)
CREATE POLICY "Authenticated users can view scoring attributes"
  ON public.scoring_attributes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage scoring attributes"
  ON public.scoring_attributes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Scoring thresholds policies
CREATE POLICY "Authenticated users can view thresholds"
  ON public.scoring_thresholds FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage thresholds"
  ON public.scoring_thresholds FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Deal scores policies
CREATE POLICY "Users can view scores for their deals"
  ON public.deal_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.deals 
      WHERE deals.id = deal_scores.deal_id 
      AND deals.owner_id = auth.uid()
    )
  );

CREATE POLICY "Privileged users can view all deal scores"
  ON public.deal_scores FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'executive') OR
    public.has_role(auth.uid(), 'deal_desk') OR
    public.has_role(auth.uid(), 'finance')
  );

CREATE POLICY "Deal owners can insert scores"
  ON public.deal_scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deals 
      WHERE deals.id = deal_scores.deal_id 
      AND deals.owner_id = auth.uid()
    )
  );

CREATE POLICY "Privileged users can insert scores"
  ON public.deal_scores FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'deal_desk')
  );

CREATE POLICY "Deal owners can update scores"
  ON public.deal_scores FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.deals 
      WHERE deals.id = deal_scores.deal_id 
      AND deals.owner_id = auth.uid()
    )
  );

CREATE POLICY "Privileged users can update scores"
  ON public.deal_scores FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'deal_desk')
  );

-- Deal approvals policies
CREATE POLICY "Users can view approvals for their deals"
  ON public.deal_approvals FOR SELECT
  USING (
    auth.uid() = requested_by OR
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM public.deals 
      WHERE deals.id = deal_approvals.deal_id 
      AND deals.owner_id = auth.uid()
    )
  );

CREATE POLICY "Privileged users can view all approvals"
  ON public.deal_approvals FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'executive') OR
    public.has_role(auth.uid(), 'deal_desk') OR
    public.has_role(auth.uid(), 'finance')
  );

CREATE POLICY "Authenticated users can request approvals"
  ON public.deal_approvals FOR INSERT
  WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Assigned approvers can update approvals"
  ON public.deal_approvals FOR UPDATE
  USING (
    auth.uid() = assigned_to OR
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'deal_desk')
  );

-- Deal notes policies
CREATE POLICY "Users can view notes for their deals"
  ON public.deal_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.deals 
      WHERE deals.id = deal_notes.deal_id 
      AND deals.owner_id = auth.uid()
    )
  );

CREATE POLICY "Privileged users can view all notes"
  ON public.deal_notes FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'executive') OR
    public.has_role(auth.uid(), 'deal_desk') OR
    public.has_role(auth.uid(), 'finance')
  );

CREATE POLICY "Authenticated users can add notes"
  ON public.deal_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scoring_attributes_updated_at
  BEFORE UPDATE ON public.scoring_attributes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scoring_thresholds_updated_at
  BEFORE UPDATE ON public.scoring_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default scoring thresholds
INSERT INTO public.scoring_thresholds (green_min, yellow_min, auto_approve_green)
VALUES (70, 40, true);

-- Insert default scoring attributes
INSERT INTO public.scoring_attributes (name, description, category, weight, evaluation_type, min_value, max_value, higher_is_better, display_order) VALUES
  ('Deal Size', 'Total value of the deal', 'financial', 20, 'scale', 0, 1000000, true, 1),
  ('Discount Percentage', 'Discount offered to customer', 'financial', 15, 'scale', 0, 50, false, 2),
  ('Payment Terms', 'Favorability of payment terms (1-10)', 'financial', 10, 'scale', 1, 10, true, 3),
  ('Strategic Fit', 'Alignment with company strategy (1-10)', 'strategic', 15, 'scale', 1, 10, true, 4),
  ('Market Expansion', 'Opens new market opportunities (1-10)', 'strategic', 10, 'scale', 1, 10, true, 5),
  ('Customer Credit Risk', 'Credit worthiness (1-10, 10=lowest risk)', 'risk', 15, 'scale', 1, 10, true, 6),
  ('Competitive Pressure', 'Level of competitive pressure (1-10, 10=high)', 'risk', 10, 'scale', 1, 10, false, 7),
  ('Customer Lifetime Value', 'Expected CLTV potential (1-10)', 'customer', 15, 'scale', 1, 10, true, 8),
  ('Reference Potential', 'Can this customer be a reference? (1-10)', 'customer', 10, 'scale', 1, 10, true, 9);

-- Function to calculate deal score
CREATE OR REPLACE FUNCTION public.calculate_deal_score(p_deal_id UUID)
RETURNS TABLE(total_score DECIMAL, classification deal_classification)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_score DECIMAL(5,2);
  v_classification deal_classification;
  v_green_min DECIMAL(5,2);
  v_yellow_min DECIMAL(5,2);
  v_total_weight INTEGER;
  v_weighted_sum DECIMAL(10,2);
BEGIN
  -- Get thresholds
  SELECT st.green_min, st.yellow_min INTO v_green_min, v_yellow_min
  FROM public.scoring_thresholds st
  LIMIT 1;
  
  -- Calculate weighted average
  SELECT 
    COALESCE(SUM(ds.normalized_score * sa.weight), 0),
    COALESCE(SUM(sa.weight), 0)
  INTO v_weighted_sum, v_total_weight
  FROM public.deal_scores ds
  JOIN public.scoring_attributes sa ON sa.id = ds.attribute_id
  WHERE ds.deal_id = p_deal_id AND sa.is_active = true;
  
  -- Calculate total score
  IF v_total_weight > 0 THEN
    v_total_score := v_weighted_sum / v_total_weight;
  ELSE
    v_total_score := 0;
  END IF;
  
  -- Determine classification
  IF v_total_score >= v_green_min THEN
    v_classification := 'green';
  ELSIF v_total_score >= v_yellow_min THEN
    v_classification := 'yellow';
  ELSE
    v_classification := 'red';
  END IF;
  
  -- Update the deal
  UPDATE public.deals
  SET total_score = v_total_score,
      classification = v_classification
  WHERE id = p_deal_id;
  
  RETURN QUERY SELECT v_total_score, v_classification;
END;
$$;