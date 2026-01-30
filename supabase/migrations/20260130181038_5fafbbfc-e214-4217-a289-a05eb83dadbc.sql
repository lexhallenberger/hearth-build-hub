-- Create enum for lead status
CREATE TYPE public.lead_status AS ENUM (
  'new',
  'contacted',
  'qualified',
  'unqualified',
  'converted'
);

-- Create enum for opportunity stage
CREATE TYPE public.opportunity_stage AS ENUM (
  'discovery',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
);

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT, -- 'email', 'event', 'webinar', 'content', 'advertising', etc.
  
  start_date DATE,
  end_date DATE,
  
  budget DECIMAL(15,2),
  actual_spend DECIMAL(15,2) DEFAULT 0,
  
  target_leads INTEGER,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contact info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  title TEXT,
  
  -- Source/Attribution
  source TEXT, -- 'website', 'referral', 'campaign', 'event', etc.
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  
  -- Qualification
  status lead_status NOT NULL DEFAULT 'new',
  score INTEGER DEFAULT 0, -- Lead score 0-100
  
  -- Value messaging
  pain_points TEXT[],
  interests TEXT[],
  value_proposition_fit TEXT,
  
  notes TEXT,
  
  converted_at TIMESTAMP WITH TIME ZONE,
  converted_to_opportunity_id UUID,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create opportunities table (links to deals when converted)
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  
  -- Related records
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  
  -- Company info
  company TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  
  -- Opportunity details
  stage opportunity_stage NOT NULL DEFAULT 'discovery',
  amount DECIMAL(15,2) DEFAULT 0,
  probability INTEGER DEFAULT 10, -- Win probability 0-100
  
  expected_close_date DATE,
  actual_close_date DATE,
  
  -- Value alignment
  primary_value_message TEXT,
  competitive_situation TEXT,
  
  lost_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create value_messages table (library of value propositions)
CREATE TABLE public.value_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Categorization
  category TEXT, -- 'pain_point', 'benefit', 'differentiator', 'proof_point'
  target_persona TEXT, -- 'executive', 'technical', 'business_user', etc.
  target_industry TEXT,
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2), -- Win rate when this message is used
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead_activities table for tracking interactions
CREATE TABLE public.lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  activity_type TEXT NOT NULL, -- 'email', 'call', 'meeting', 'note', 'status_change'
  subject TEXT,
  description TEXT,
  
  outcome TEXT, -- 'positive', 'neutral', 'negative', 'no_response'
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update leads table to add foreign key for converted opportunity
ALTER TABLE public.leads 
ADD CONSTRAINT leads_converted_to_opportunity_id_fkey 
FOREIGN KEY (converted_to_opportunity_id) REFERENCES public.opportunities(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.value_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
CREATE POLICY "Users can view their own campaigns"
  ON public.campaigns FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Privileged users can view all campaigns"
  ON public.campaigns FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'executive')
  );

CREATE POLICY "Authenticated users can create campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their campaigns"
  ON public.campaigns FOR UPDATE
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their campaigns"
  ON public.campaigns FOR DELETE
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

-- Leads policies
CREATE POLICY "Users can view their own leads"
  ON public.leads FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Privileged users can view all leads"
  ON public.leads FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'executive')
  );

CREATE POLICY "Authenticated users can create leads"
  ON public.leads FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their leads"
  ON public.leads FOR UPDATE
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their leads"
  ON public.leads FOR DELETE
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

-- Opportunities policies
CREATE POLICY "Users can view their own opportunities"
  ON public.opportunities FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Privileged users can view all opportunities"
  ON public.opportunities FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'executive') OR
    public.has_role(auth.uid(), 'deal_desk')
  );

CREATE POLICY "Authenticated users can create opportunities"
  ON public.opportunities FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their opportunities"
  ON public.opportunities FOR UPDATE
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their opportunities"
  ON public.opportunities FOR DELETE
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

-- Value messages policies (shared library)
CREATE POLICY "Authenticated users can view value messages"
  ON public.value_messages FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create value messages"
  ON public.value_messages FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their value messages"
  ON public.value_messages FOR UPDATE
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their value messages"
  ON public.value_messages FOR DELETE
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

-- Lead activities policies
CREATE POLICY "Users can view activities for their leads"
  ON public.lead_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_activities.lead_id 
      AND leads.owner_id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'executive')
  );

CREATE POLICY "Authenticated users can add activities"
  ON public.lead_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_value_messages_updated_at
  BEFORE UPDATE ON public.value_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();