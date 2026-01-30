import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DealSegment {
  id: string;
  name: string;
  description: string | null;
  min_deal_value: number;
  max_deal_value: number | null;
  min_score: number;
  max_score: number;
  approval_level: number;
  approval_sla_hours: number;
  touch_model: 'no_touch' | 'low_touch' | 'mid_touch' | 'high_touch';
  auto_approve_enabled: boolean;
  approver_roles: string[];
  escalation_roles: string[];
  priority: number;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch all deal segments
export function useDealSegments() {
  return useQuery({
    queryKey: ['deal-segments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_segments')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (error) throw error;
      return data as DealSegment[];
    },
  });
}

// Find matching segment for a deal
export function findDealSegment(
  segments: DealSegment[],
  dealValue: number,
  score: number | null
): DealSegment | null {
  if (score === null) return null;
  
  return segments.find((segment) => {
    const meetsValueMin = dealValue >= segment.min_deal_value;
    const meetsValueMax = segment.max_deal_value === null || dealValue <= segment.max_deal_value;
    const meetsScoreMin = score >= segment.min_score;
    const meetsScoreMax = score <= segment.max_score;
    
    return meetsValueMin && meetsValueMax && meetsScoreMin && meetsScoreMax;
  }) || null;
}

// Fetch pending approvals with deal details
export function usePendingApprovals() {
  return useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          segment:deal_segments(*)
        `)
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// Approve deal mutation
export function useApproveDeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ dealId, notes }: { dealId: string; notes?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('deals')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: userData.user.id,
        })
        .eq('id', dealId)
        .select()
        .single();

      if (error) throw error;

      // Add approval note if provided
      if (notes) {
        await supabase.from('deal_notes').insert({
          deal_id: dealId,
          note_type: 'approval',
          content: notes,
          user_id: userData.user.id,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      toast({
        title: 'Deal approved',
        description: 'The deal has been approved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error approving deal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Reject deal mutation
export function useRejectDeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ dealId, reason }: { dealId: string; reason: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('deals')
        .update({
          status: 'rejected',
        })
        .eq('id', dealId)
        .select()
        .single();

      if (error) throw error;

      // Add rejection note
      await supabase.from('deal_notes').insert({
        deal_id: dealId,
        note_type: 'rejection',
        content: reason,
        user_id: userData.user.id,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      toast({
        title: 'Deal rejected',
        description: 'The deal has been rejected.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error rejecting deal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Get deal desk metrics
export function useDealDeskMetrics() {
  return useQuery({
    queryKey: ['deal-desk-metrics'],
    queryFn: async () => {
      // Fetch all deals for metrics
      const { data: deals, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const thisMonthDeals = deals?.filter(d => new Date(d.created_at) >= thisMonth) || [];
      const lastMonthDeals = deals?.filter(d => {
        const created = new Date(d.created_at);
        return created >= lastMonth && created < thisMonth;
      }) || [];

      const pendingDeals = deals?.filter(d => d.status === 'pending_approval') || [];
      const approvedDeals = deals?.filter(d => d.status === 'approved' || d.status === 'closed_won') || [];
      const rejectedDeals = deals?.filter(d => d.status === 'rejected') || [];

      // Calculate average approval time for approved deals
      const dealsWithApprovalTime = approvedDeals.filter(d => d.approved_at);
      const avgApprovalHours = dealsWithApprovalTime.length > 0
        ? dealsWithApprovalTime.reduce((sum, d) => {
            const created = new Date(d.created_at);
            const approved = new Date(d.approved_at!);
            return sum + (approved.getTime() - created.getTime()) / (1000 * 60 * 60);
          }, 0) / dealsWithApprovalTime.length
        : 0;

      return {
        pending: pendingDeals.length,
        approved: approvedDeals.length,
        rejected: rejectedDeals.length,
        totalThisMonth: thisMonthDeals.length,
        totalLastMonth: lastMonthDeals.length,
        avgApprovalHours: Math.round(avgApprovalHours),
        approvalRate: approvedDeals.length + rejectedDeals.length > 0
          ? Math.round((approvedDeals.length / (approvedDeals.length + rejectedDeals.length)) * 100)
          : 0,
        greenDeals: deals?.filter(d => d.classification === 'green').length || 0,
        yellowDeals: deals?.filter(d => d.classification === 'yellow').length || 0,
        redDeals: deals?.filter(d => d.classification === 'red').length || 0,
      };
    },
  });
}
