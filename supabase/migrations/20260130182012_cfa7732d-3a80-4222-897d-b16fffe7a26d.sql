-- Create enums for customer management
CREATE TYPE public.customer_tier AS ENUM ('enterprise', 'mid_market', 'smb', 'startup');
CREATE TYPE public.health_status AS ENUM ('healthy', 'at_risk', 'critical');
CREATE TYPE public.renewal_status AS ENUM ('upcoming', 'in_progress', 'renewed', 'churned', 'expanded');

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  tier public.customer_tier NOT NULL DEFAULT 'smb',
  contract_start_date DATE,
  contract_end_date DATE,
  mrr NUMERIC DEFAULT 0,
  arr NUMERIC GENERATED ALWAYS AS (mrr * 12) STORED,
  health_score NUMERIC DEFAULT 0,
  health_status public.health_status DEFAULT 'healthy',
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  logo_url TEXT,
  notes TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer health scores history table
CREATE TABLE public.customer_health_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL,
  indicators JSONB DEFAULT '{}'::jsonb,
  scored_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scored_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create renewals table
CREATE TABLE public.renewals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  status public.renewal_status NOT NULL DEFAULT 'upcoming',
  renewal_date DATE NOT NULL,
  current_value NUMERIC DEFAULT 0,
  proposed_value NUMERIC DEFAULT 0,
  risk_level TEXT DEFAULT 'low',
  risk_factors TEXT[],
  notes TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewals ENABLE ROW LEVEL SECURITY;

-- Customers policies
CREATE POLICY "Users can view their own customers"
  ON public.customers FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Privileged users can view all customers"
  ON public.customers FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'executive'::app_role)
  );

CREATE POLICY "Authenticated users can create customers"
  ON public.customers FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their customers"
  ON public.customers FOR UPDATE
  USING (auth.uid() = owner_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their customers"
  ON public.customers FOR DELETE
  USING (auth.uid() = owner_id OR has_role(auth.uid(), 'admin'::app_role));

-- Customer health scores policies
CREATE POLICY "Users can view health scores for their customers"
  ON public.customer_health_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = customer_health_scores.customer_id
      AND customers.owner_id = auth.uid()
    )
  );

CREATE POLICY "Privileged users can view all health scores"
  ON public.customer_health_scores FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'executive'::app_role)
  );

CREATE POLICY "Users can insert health scores for their customers"
  ON public.customer_health_scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = customer_health_scores.customer_id
      AND customers.owner_id = auth.uid()
    )
  );

-- Renewals policies
CREATE POLICY "Users can view their own renewals"
  ON public.renewals FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Privileged users can view all renewals"
  ON public.renewals FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'executive'::app_role) OR
    has_role(auth.uid(), 'deal_desk'::app_role)
  );

CREATE POLICY "Authenticated users can create renewals"
  ON public.renewals FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their renewals"
  ON public.renewals FOR UPDATE
  USING (auth.uid() = owner_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their renewals"
  ON public.renewals FOR DELETE
  USING (auth.uid() = owner_id OR has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_renewals_updated_at
  BEFORE UPDATE ON public.renewals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_customers_owner_id ON public.customers(owner_id);
CREATE INDEX idx_customers_health_status ON public.customers(health_status);
CREATE INDEX idx_customers_contract_end_date ON public.customers(contract_end_date);
CREATE INDEX idx_customer_health_scores_customer_id ON public.customer_health_scores(customer_id);
CREATE INDEX idx_customer_health_scores_scored_at ON public.customer_health_scores(scored_at);
CREATE INDEX idx_renewals_customer_id ON public.renewals(customer_id);
CREATE INDEX idx_renewals_owner_id ON public.renewals(owner_id);
CREATE INDEX idx_renewals_renewal_date ON public.renewals(renewal_date);
CREATE INDEX idx_renewals_status ON public.renewals(status);