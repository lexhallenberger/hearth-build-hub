import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type RevenueType = 'new_customer' | 'upsell' | 'expansion' | 'renewal';
export type FrictionType = 'healthy' | 'unhealthy';

export interface DealEconomics {
  id: string;
  deal_id: string;
  revenue_type: RevenueType;
  customer_acquisition_cost: number;
  calculated_ltv: number;
  payback_period_months: number | null;
  cac_ltv_ratio: number | null;
  gross_margin_percent: number;
  churn_rate_percent: number;
  created_at: string;
  updated_at: string;
}

export interface FrictionEvent {
  id: string;
  deal_id: string | null;
  friction_type: FrictionType;
  category: string;
  description: string;
  duration_hours: number | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface FinancialMetrics {
  id: string;
  period_date: string;
  revenue_growth_rate: number;
  profit_margin_percent: number;
  rule_of_40_score: number;
  mrr: number;
  arr: number;
  new_arr: number;
  expansion_arr: number;
  churned_arr: number;
  net_revenue_retention: number;
  gross_revenue_retention: number;
  total_cac: number;
  avg_deal_size: number;
  avg_sales_cycle_days: number;
  created_at: string;
  updated_at: string;
}

// CAC benchmarks by revenue type (from Accenture methodology)
export const CAC_BENCHMARKS: Record<RevenueType, { min: number; max: number; label: string }> = {
  new_customer: { min: 1.13, max: 1.50, label: 'New Customer' },
  upsell: { min: 0.51, max: 0.74, label: 'Upsell' },
  expansion: { min: 0.27, max: 0.32, label: 'Expansion' },
  renewal: { min: 0.05, max: 0.13, label: 'Renewal' },
};

export function useFinancialMetrics() {
  return useQuery({
    queryKey: ['financial-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_metrics')
        .select('*')
        .order('period_date', { ascending: true });

      if (error) throw error;
      return data as FinancialMetrics[];
    },
  });
}

export function useDealEconomics() {
  return useQuery({
    queryKey: ['deal-economics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_economics')
        .select(`
          *,
          deal:deals(id, name, customer_name, deal_value, status)
        `);

      if (error) throw error;
      return data as (DealEconomics & { deal: any })[];
    },
  });
}

export function useFrictionEvents() {
  return useQuery({
    queryKey: ['friction-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('friction_events')
        .select(`
          *,
          deal:deals(id, name, customer_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (FrictionEvent & { deal: any })[];
    },
  });
}

export function useCACByRevenueType() {
  return useQuery({
    queryKey: ['cac-by-revenue-type'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_economics')
        .select('revenue_type, customer_acquisition_cost, calculated_ltv, cac_ltv_ratio');

      if (error) throw error;

      // Aggregate by revenue type
      const aggregated: Record<RevenueType, { 
        count: number; 
        totalCAC: number; 
        totalLTV: number;
        avgRatio: number;
      }> = {
        new_customer: { count: 0, totalCAC: 0, totalLTV: 0, avgRatio: 0 },
        upsell: { count: 0, totalCAC: 0, totalLTV: 0, avgRatio: 0 },
        expansion: { count: 0, totalCAC: 0, totalLTV: 0, avgRatio: 0 },
        renewal: { count: 0, totalCAC: 0, totalLTV: 0, avgRatio: 0 },
      };

      (data || []).forEach((item: any) => {
        const type = item.revenue_type as RevenueType;
        aggregated[type].count++;
        aggregated[type].totalCAC += Number(item.customer_acquisition_cost) || 0;
        aggregated[type].totalLTV += Number(item.calculated_ltv) || 0;
        aggregated[type].avgRatio += Number(item.cac_ltv_ratio) || 0;
      });

      // Calculate averages
      return Object.entries(aggregated).map(([type, data]) => ({
        type: type as RevenueType,
        count: data.count,
        avgCAC: data.count > 0 ? data.totalCAC / data.count : 0,
        avgLTV: data.count > 0 ? data.totalLTV / data.count : 0,
        avgRatio: data.count > 0 ? data.avgRatio / data.count : 0,
        benchmark: CAC_BENCHMARKS[type as RevenueType],
      }));
    },
  });
}
