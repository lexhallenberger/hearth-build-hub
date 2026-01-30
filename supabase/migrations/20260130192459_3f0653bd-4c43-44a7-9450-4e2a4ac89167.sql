-- Create revenue type enum for deal economics
CREATE TYPE public.revenue_type AS ENUM ('new_customer', 'upsell', 'expansion', 'renewal');

-- Create friction type enum
CREATE TYPE public.friction_type AS ENUM ('healthy', 'unhealthy');

-- Create deal_economics table for CAC/LTV tracking
CREATE TABLE public.deal_economics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  revenue_type revenue_type NOT NULL DEFAULT 'new_customer',
  customer_acquisition_cost NUMERIC(12,2) DEFAULT 0,
  calculated_ltv NUMERIC(12,2) DEFAULT 0,
  payback_period_months INTEGER DEFAULT NULL,
  cac_ltv_ratio NUMERIC(5,2) DEFAULT NULL,
  gross_margin_percent NUMERIC(5,2) DEFAULT 70,
  churn_rate_percent NUMERIC(5,2) DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(deal_id)
);

-- Create friction_events table to track healthy vs unhealthy friction
CREATE TABLE public.friction_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  friction_type friction_type NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_hours NUMERIC(8,2) DEFAULT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  resolution_notes TEXT DEFAULT NULL,
  created_by UUID DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial_metrics table for monthly tracking
CREATE TABLE public.financial_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_date DATE NOT NULL,
  revenue_growth_rate NUMERIC(5,2) DEFAULT 0,
  profit_margin_percent NUMERIC(5,2) DEFAULT 0,
  rule_of_40_score NUMERIC(5,2) DEFAULT 0,
  mrr NUMERIC(14,2) DEFAULT 0,
  arr NUMERIC(14,2) DEFAULT 0,
  new_arr NUMERIC(14,2) DEFAULT 0,
  expansion_arr NUMERIC(14,2) DEFAULT 0,
  churned_arr NUMERIC(14,2) DEFAULT 0,
  net_revenue_retention NUMERIC(5,2) DEFAULT 100,
  gross_revenue_retention NUMERIC(5,2) DEFAULT 100,
  total_cac NUMERIC(14,2) DEFAULT 0,
  avg_deal_size NUMERIC(12,2) DEFAULT 0,
  avg_sales_cycle_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(period_date)
);

-- Enable RLS on all new tables
ALTER TABLE public.deal_economics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_metrics ENABLE ROW LEVEL SECURITY;

-- Deal economics policies
CREATE POLICY "Users can view economics for their deals"
  ON public.deal_economics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.deals
      WHERE deals.id = deal_economics.deal_id
      AND deals.owner_id = auth.uid()
    )
  );

CREATE POLICY "Privileged users can view all deal economics"
  ON public.deal_economics FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'executive') OR 
    has_role(auth.uid(), 'finance') OR
    has_role(auth.uid(), 'deal_desk')
  );

CREATE POLICY "Deal owners can insert economics"
  ON public.deal_economics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deals
      WHERE deals.id = deal_economics.deal_id
      AND deals.owner_id = auth.uid()
    )
  );

CREATE POLICY "Privileged users can manage deal economics"
  ON public.deal_economics FOR ALL
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'finance')
  );

-- Friction events policies
CREATE POLICY "Authenticated users can view friction events"
  ON public.friction_events FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create friction events"
  ON public.friction_events FOR INSERT
  WITH CHECK (auth.uid() = created_by OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all friction events"
  ON public.friction_events FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Financial metrics policies
CREATE POLICY "Authenticated users can view financial metrics"
  ON public.financial_metrics FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and finance can manage financial metrics"
  ON public.financial_metrics FOR ALL
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'finance')
  );

-- Add triggers for updated_at
CREATE TRIGGER update_deal_economics_updated_at
  BEFORE UPDATE ON public.deal_economics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_metrics_updated_at
  BEFORE UPDATE ON public.financial_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_deal_economics_deal_id ON public.deal_economics(deal_id);
CREATE INDEX idx_deal_economics_revenue_type ON public.deal_economics(revenue_type);
CREATE INDEX idx_friction_events_deal_id ON public.friction_events(deal_id);
CREATE INDEX idx_friction_events_type ON public.friction_events(friction_type);
CREATE INDEX idx_friction_events_created_at ON public.friction_events(created_at);
CREATE INDEX idx_financial_metrics_period ON public.financial_metrics(period_date);

-- Insert sample financial metrics for demo
INSERT INTO public.financial_metrics (period_date, revenue_growth_rate, profit_margin_percent, rule_of_40_score, mrr, arr, new_arr, expansion_arr, churned_arr, net_revenue_retention)
VALUES 
  ('2025-07-01', 28, 15, 43, 850000, 10200000, 1500000, 800000, 400000, 112),
  ('2025-08-01', 30, 14, 44, 920000, 11040000, 1700000, 900000, 450000, 115),
  ('2025-09-01', 32, 13, 45, 1000000, 12000000, 1900000, 1000000, 500000, 118),
  ('2025-10-01', 29, 16, 45, 1050000, 12600000, 1600000, 850000, 420000, 114),
  ('2025-11-01', 31, 15, 46, 1120000, 13440000, 1800000, 920000, 480000, 116),
  ('2025-12-01', 33, 14, 47, 1200000, 14400000, 2000000, 1100000, 520000, 119);
