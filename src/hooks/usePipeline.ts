import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Lead, Opportunity, Campaign, ValueMessage, LeadActivity } from '@/types/pipeline';
import { useToast } from '@/hooks/use-toast';
import { TablesInsert } from '@/integrations/supabase/types';
// ============ LEADS ============
export function useLeads() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Lead;
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lead: Omit<TablesInsert<'leads'>, 'owner_id'>) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([{ ...lead, owner_id: user!.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Lead created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create lead', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Lead updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update lead', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Lead deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete lead', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ OPPORTUNITIES ============
export function useOpportunities() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Opportunity[];
    },
    enabled: !!user,
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (opportunity: Omit<TablesInsert<'opportunities'>, 'owner_id'>) => {
      const { data, error } = await supabase
        .from('opportunities')
        .insert([{ ...opportunity, owner_id: user!.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast({ title: 'Opportunity created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create opportunity', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Opportunity> & { id: string }) => {
      const { data, error } = await supabase
        .from('opportunities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast({ title: 'Opportunity updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update opportunity', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('opportunities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast({ title: 'Opportunity deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete opportunity', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ CAMPAIGNS ============
export function useCampaigns() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!user,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (campaign: Omit<TablesInsert<'campaigns'>, 'owner_id'>) => {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([{ ...campaign, owner_id: user!.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create campaign', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ VALUE MESSAGES ============
export function useValueMessages() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['value-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('value_messages')
        .select('*')
        .order('usage_count', { ascending: false });
      
      if (error) throw error;
      return data as ValueMessage[];
    },
    enabled: !!user,
  });
}

export function useCreateValueMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (message: Omit<TablesInsert<'value_messages'>, 'owner_id'>) => {
      const { data, error } = await supabase
        .from('value_messages')
        .insert([{ ...message, owner_id: user!.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['value-messages'] });
      toast({ title: 'Value message created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create value message', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateValueMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ValueMessage> & { id: string }) => {
      const { data, error } = await supabase
        .from('value_messages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['value-messages'] });
      toast({ title: 'Value message updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update value message', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteValueMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('value_messages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['value-messages'] });
      toast({ title: 'Value message deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete value message', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ LEAD ACTIVITIES ============
export function useLeadActivities(leadId: string) {
  return useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as LeadActivity[];
    },
    enabled: !!leadId,
  });
}

export function useCreateLeadActivity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (activity: Omit<TablesInsert<'lead_activities'>, 'user_id'>) => {
      const { data, error } = await supabase
        .from('lead_activities')
        .insert([{ ...activity, user_id: user!.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-activities', variables.lead_id] });
      toast({ title: 'Activity logged successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to log activity', description: error.message, variant: 'destructive' });
    },
  });
}

// ============ CONVERT LEAD TO OPPORTUNITY ============
export function useConvertLeadToOpportunity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ lead, opportunityData }: { lead: Lead; opportunityData: Partial<Opportunity> }) => {
      // Create opportunity
      const { data: opportunity, error: oppError } = await supabase
        .from('opportunities')
        .insert([{
          name: opportunityData.name || `${lead.company} - Opportunity`,
          company: lead.company || 'Unknown',
          contact_name: `${lead.first_name} ${lead.last_name}`,
          contact_email: lead.email,
          owner_id: user!.id,
          lead_id: lead.id,
          campaign_id: lead.campaign_id,
          ...opportunityData,
        }])
        .select()
        .single();
      
      if (oppError) throw oppError;

      // Update lead status
      const { error: leadError } = await supabase
        .from('leads')
        .update({
          status: 'converted',
          converted_at: new Date().toISOString(),
          converted_to_opportunity_id: opportunity.id,
        })
        .eq('id', lead.id);
      
      if (leadError) throw leadError;

      return opportunity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast({ title: 'Lead converted to opportunity successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to convert lead', description: error.message, variant: 'destructive' });
    },
  });
}
