import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ExecutiveMetrics {
  pipelineValue: number;
  totalARR: number;
  totalMRR: number;
  avgDealSize: number;
  winRate: number;
  nrrPercent: number;
  cacPaybackMonths: number;
  dealQuality: {
    green: number;
    yellow: number;
    red: number;
  };
  pendingApprovals: number;
  atRiskCustomers: number;
  totalCustomers: number;
  totalDeals: number;
}

export function useExecutiveMetrics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['executive-metrics', user?.id],
    queryFn: async (): Promise<ExecutiveMetrics> => {
      // Fetch deals
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('id, deal_value, classification, status');

      if (dealsError) throw dealsError;

      // Fetch customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, arr, mrr, health_status');

      if (customersError) throw customersError;

      // Fetch opportunities for win rate
      const { data: opportunities, error: oppsError } = await supabase
        .from('opportunities')
        .select('id, stage');

      if (oppsError) throw oppsError;

      // Calculate deal metrics
      const totalDeals = deals?.length || 0;
      const pipelineValue = deals?.reduce((sum, d) => sum + (d.deal_value || 0), 0) || 0;
      const avgDealSize = totalDeals > 0 ? pipelineValue / totalDeals : 0;
      
      const greenDeals = deals?.filter(d => d.classification === 'green').length || 0;
      const yellowDeals = deals?.filter(d => d.classification === 'yellow').length || 0;
      const redDeals = deals?.filter(d => d.classification === 'red').length || 0;
      const pendingApprovals = deals?.filter(d => d.status === 'pending_approval').length || 0;

      // Calculate customer metrics
      const totalCustomers = customers?.length || 0;
      const totalARR = customers?.reduce((sum, c) => sum + (c.arr || 0), 0) || 0;
      const totalMRR = customers?.reduce((sum, c) => sum + (c.mrr || 0), 0) || 0;
      const atRiskCustomers = customers?.filter(
        c => c.health_status === 'at_risk' || c.health_status === 'critical'
      ).length || 0;

      // Calculate win rate from opportunities
      const wonOpps = opportunities?.filter(o => o.stage === 'closed_won').length || 0;
      const lostOpps = opportunities?.filter(o => o.stage === 'closed_lost').length || 0;
      const winRate = (wonOpps + lostOpps) > 0 ? (wonOpps / (wonOpps + lostOpps)) * 100 : 0;

      // Mock NRR and CAC payback (would come from financial_metrics in production)
      const nrrPercent = 112;
      const cacPaybackMonths = 14;

      return {
        pipelineValue,
        totalARR,
        totalMRR,
        avgDealSize,
        winRate,
        nrrPercent,
        cacPaybackMonths,
        dealQuality: {
          green: greenDeals,
          yellow: yellowDeals,
          red: redDeals,
        },
        pendingApprovals,
        atRiskCustomers,
        totalCustomers,
        totalDeals,
      };
    },
    enabled: !!user,
  });
}
