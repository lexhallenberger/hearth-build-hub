import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Deal, DealScore, ScoringAttribute, ScoringThreshold, DealApproval, DealNote } from '@/types/deals';
import { useToast } from '@/hooks/use-toast';

// Fetch all deals
export function useDeals() {
  return useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Deal[];
    },
  });
}

// Fetch single deal
export function useDeal(id: string | undefined) {
  return useQuery({
    queryKey: ['deals', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Deal | null;
    },
    enabled: !!id,
  });
}

// Fetch scoring attributes
export function useScoringAttributes() {
  return useQuery({
    queryKey: ['scoring-attributes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scoring_attributes')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as ScoringAttribute[];
    },
  });
}

// Fetch scoring thresholds
export function useScoringThresholds() {
  return useQuery({
    queryKey: ['scoring-thresholds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scoring_thresholds')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as ScoringThreshold | null;
    },
  });
}

// Fetch deal scores
export function useDealScores(dealId: string | undefined) {
  return useQuery({
    queryKey: ['deal-scores', dealId],
    queryFn: async () => {
      if (!dealId) return [];
      const { data, error } = await supabase
        .from('deal_scores')
        .select(`
          *,
          attribute:scoring_attributes(*)
        `)
        .eq('deal_id', dealId);

      if (error) throw error;
      return data as (DealScore & { attribute: ScoringAttribute })[];
    },
    enabled: !!dealId,
  });
}

// Fetch deal notes
export function useDealNotes(dealId: string | undefined) {
  return useQuery({
    queryKey: ['deal-notes', dealId],
    queryFn: async () => {
      if (!dealId) return [];
      const { data, error } = await supabase
        .from('deal_notes')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DealNote[];
    },
    enabled: !!dealId,
  });
}

// Create deal mutation
export function useCreateDeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (deal: Partial<Deal>) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('deals')
        .insert({
          name: deal.name!,
          customer_name: deal.customer_name!,
          description: deal.description,
          deal_value: deal.deal_value || 0,
          discount_percent: deal.discount_percent || 0,
          payment_terms: deal.payment_terms,
          contract_length_months: deal.contract_length_months || 12,
          expected_close_date: deal.expected_close_date,
          owner_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: 'Deal created',
        description: 'Your deal has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating deal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Update deal mutation
export function useUpdateDeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Deal> & { id: string }) => {
      const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Deal;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals', data.id] });
      toast({
        title: 'Deal updated',
        description: 'Your deal has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating deal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Save deal score mutation
export function useSaveDealScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (score: { deal_id: string; attribute_id: string; raw_value: number; normalized_score: number; notes?: string }) => {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('deal_scores')
        .upsert({
          ...score,
          scored_by: userData.user?.id,
          scored_at: new Date().toISOString(),
        }, {
          onConflict: 'deal_id,attribute_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-scores', variables.deal_id] });
      queryClient.invalidateQueries({ queryKey: ['deals', variables.deal_id] });
    },
  });
}

// Calculate deal score
export function useCalculateDealScore() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (dealId: string) => {
      const { data, error } = await supabase
        .rpc('calculate_deal_score', { p_deal_id: dealId });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, dealId) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals', dealId] });
      toast({
        title: 'Score calculated',
        description: 'Deal score has been recalculated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error calculating score',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Add deal note
export function useAddDealNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: { deal_id: string; note_type: string; content: string; metadata?: Record<string, unknown> }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const insertData = {
        deal_id: note.deal_id,
        note_type: note.note_type,
        content: note.content,
        metadata: (note.metadata || {}) as unknown,
        user_id: userData.user.id,
      };

      const { data, error } = await supabase
        .from('deal_notes')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-notes', variables.deal_id] });
    },
  });
}
