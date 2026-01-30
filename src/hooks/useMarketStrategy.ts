import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MarketStrategy {
  id: string;
  name: string;
  market_mode: 'market_share' | 'revenue_optimal' | 'margin_optimal';
  business_unit: string | null;
  is_active: boolean;
  min_deal_value: number;
  max_discount_percent: number;
  min_contract_months: number;
  max_contract_months: number;
  allowed_payment_terms: string[];
  segment_thresholds: Record<string, { min_value: number; max_discount: number }>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch active market strategy
export function useMarketStrategy() {
  return useQuery({
    queryKey: ['market-strategy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_strategy')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as MarketStrategy | null;
    },
  });
}

// Fetch all market strategies
export function useMarketStrategies() {
  return useQuery({
    queryKey: ['market-strategies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_strategy')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MarketStrategy[];
    },
  });
}

// Create market strategy
export function useCreateMarketStrategy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (strategy: Partial<MarketStrategy>) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('market_strategy')
        .insert({
          name: strategy.name || 'New Strategy',
          market_mode: strategy.market_mode || 'revenue_optimal',
          business_unit: strategy.business_unit,
          is_active: strategy.is_active ?? true,
          min_deal_value: strategy.min_deal_value ?? 0,
          max_discount_percent: strategy.max_discount_percent ?? 50,
          min_contract_months: strategy.min_contract_months ?? 12,
          max_contract_months: strategy.max_contract_months ?? 60,
          allowed_payment_terms: strategy.allowed_payment_terms ?? ['net_30', 'net_45', 'net_60'],
          segment_thresholds: strategy.segment_thresholds ?? {},
          created_by: userData.user?.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data as MarketStrategy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-strategy'] });
      queryClient.invalidateQueries({ queryKey: ['market-strategies'] });
      toast({
        title: 'Strategy created',
        description: 'Market strategy has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating strategy',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Update market strategy
export function useUpdateMarketStrategy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MarketStrategy> & { id: string }) => {
      const { data, error } = await supabase
        .from('market_strategy')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as MarketStrategy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-strategy'] });
      queryClient.invalidateQueries({ queryKey: ['market-strategies'] });
      toast({
        title: 'Strategy updated',
        description: 'Market strategy has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating strategy',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
