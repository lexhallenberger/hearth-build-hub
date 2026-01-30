import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PipelineMetrics {
  totalDeals: number;
  totalValue: number;
  avgDealSize: number;
  greenDeals: number;
  yellowDeals: number;
  redDeals: number;
  approvedDeals: number;
  pendingDeals: number;
  wonDeals: number;
  lostDeals: number;
  winRate: number;
}

export interface DealDistribution {
  classification: string;
  count: number;
  value: number;
}

export interface PerformanceData {
  totalOpportunities: number;
  totalLeads: number;
  conversionRate: number;
  pipelineValue: number;
  weightedValue: number;
  avgCycleTime: number;
}

export function usePipelineMetrics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pipeline-metrics', user?.id],
    queryFn: async (): Promise<PipelineMetrics> => {
      const { data: deals, error } = await supabase
        .from('deals')
        .select('id, deal_value, classification, status');

      if (error) throw error;

      const totalDeals = deals?.length || 0;
      const totalValue = deals?.reduce((sum, d) => sum + (d.deal_value || 0), 0) || 0;
      const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
      const greenDeals = deals?.filter(d => d.classification === 'green').length || 0;
      const yellowDeals = deals?.filter(d => d.classification === 'yellow').length || 0;
      const redDeals = deals?.filter(d => d.classification === 'red').length || 0;
      const approvedDeals = deals?.filter(d => d.status === 'approved').length || 0;
      const pendingDeals = deals?.filter(d => d.status === 'pending_approval').length || 0;
      const wonDeals = deals?.filter(d => d.status === 'closed_won').length || 0;
      const lostDeals = deals?.filter(d => d.status === 'closed_lost').length || 0;
      const winRate = (wonDeals + lostDeals) > 0 ? (wonDeals / (wonDeals + lostDeals)) * 100 : 0;

      return {
        totalDeals,
        totalValue,
        avgDealSize,
        greenDeals,
        yellowDeals,
        redDeals,
        approvedDeals,
        pendingDeals,
        wonDeals,
        lostDeals,
        winRate,
      };
    },
    enabled: !!user,
  });
}

export function useDealDistribution() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['deal-distribution', user?.id],
    queryFn: async (): Promise<DealDistribution[]> => {
      const { data: deals, error } = await supabase
        .from('deals')
        .select('classification, deal_value');

      if (error) throw error;

      const distribution: Record<string, { count: number; value: number }> = {
        green: { count: 0, value: 0 },
        yellow: { count: 0, value: 0 },
        red: { count: 0, value: 0 },
        unscored: { count: 0, value: 0 },
      };

      deals?.forEach(deal => {
        const key = deal.classification || 'unscored';
        if (distribution[key]) {
          distribution[key].count++;
          distribution[key].value += deal.deal_value || 0;
        }
      });

      return Object.entries(distribution).map(([classification, data]) => ({
        classification,
        ...data,
      }));
    },
    enabled: !!user,
  });
}

export function useOpportunityMetrics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['opportunity-metrics', user?.id],
    queryFn: async () => {
      const { data: opportunities, error } = await supabase
        .from('opportunities')
        .select('id, amount, probability, stage');

      if (error) throw error;

      const total = opportunities?.length || 0;
      const pipelineValue = opportunities?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0;
      const weightedValue = opportunities?.reduce((sum, o) => sum + ((o.amount || 0) * (o.probability || 0) / 100), 0) || 0;
      
      const wonOpps = opportunities?.filter(o => o.stage === 'closed_won').length || 0;
      const lostOpps = opportunities?.filter(o => o.stage === 'closed_lost').length || 0;
      const winRate = (wonOpps + lostOpps) > 0 ? (wonOpps / (wonOpps + lostOpps)) * 100 : 0;

      const stageBreakdown = {
        discovery: opportunities?.filter(o => o.stage === 'discovery').length || 0,
        qualification: opportunities?.filter(o => o.stage === 'qualification').length || 0,
        proposal: opportunities?.filter(o => o.stage === 'proposal').length || 0,
        negotiation: opportunities?.filter(o => o.stage === 'negotiation').length || 0,
        closed_won: wonOpps,
        closed_lost: lostOpps,
      };

      return {
        total,
        pipelineValue,
        weightedValue,
        winRate,
        stageBreakdown,
      };
    },
    enabled: !!user,
  });
}

export function useCustomerMetrics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer-metrics', user?.id],
    queryFn: async () => {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('id, arr, mrr, health_status, tier');

      if (error) throw error;

      const total = customers?.length || 0;
      const totalARR = customers?.reduce((sum, c) => sum + (c.arr || 0), 0) || 0;
      const totalMRR = customers?.reduce((sum, c) => sum + (c.mrr || 0), 0) || 0;
      
      const healthyCount = customers?.filter(c => c.health_status === 'healthy').length || 0;
      const atRiskCount = customers?.filter(c => c.health_status === 'at_risk').length || 0;
      const criticalCount = customers?.filter(c => c.health_status === 'critical').length || 0;

      const tierBreakdown = {
        enterprise: customers?.filter(c => c.tier === 'enterprise').length || 0,
        mid_market: customers?.filter(c => c.tier === 'mid_market').length || 0,
        smb: customers?.filter(c => c.tier === 'smb').length || 0,
        startup: customers?.filter(c => c.tier === 'startup').length || 0,
      };

      return {
        total,
        totalARR,
        totalMRR,
        healthyCount,
        atRiskCount,
        criticalCount,
        tierBreakdown,
      };
    },
    enabled: !!user,
  });
}

export function useRule40Data() {
  return useQuery({
    queryKey: ['rule40'],
    queryFn: async () => {
      // In a real app, this would come from financial data
      // For now, return sample data that can be configured
      return {
        revenueGrowth: 35,
        profitMargin: 12,
        rule40Score: 47,
      };
    },
  });
}
