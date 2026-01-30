import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DealApproval } from '@/types/deals';
import { useToast } from '@/hooks/use-toast';

// Fetch approvals for a deal
export function useDealApprovals(dealId: string | undefined) {
  return useQuery({
    queryKey: ['deal-approvals', dealId],
    queryFn: async () => {
      if (!dealId) return [];
      const { data, error } = await supabase
        .from('deal_approvals')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DealApproval[];
    },
    enabled: !!dealId,
  });
}

// Fetch pending approvals for the current user
export function usePendingApprovals() {
  return useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];

      const { data, error } = await supabase
        .from('deal_approvals')
        .select(`
          *,
          deal:deals(*)
        `)
        .eq('assigned_to', userData.user.id)
        .eq('status', 'pending')
        .order('requested_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// Request approval
export function useRequestApproval() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ dealId, notes }: { dealId: string; notes?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Get users with deal_desk or admin role to assign approval
      const { data: approvers } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['deal_desk', 'admin'])
        .limit(1);

      const assignedTo = approvers?.[0]?.user_id || null;

      const { data, error } = await supabase
        .from('deal_approvals')
        .insert({
          deal_id: dealId,
          requested_by: userData.user.id,
          assigned_to: assignedTo,
          request_notes: notes || null,
          status: 'pending',
          approval_level: 1,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Update deal status
      await supabase
        .from('deals')
        .update({ status: 'pending_approval' })
        .eq('id', dealId);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-approvals', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['deals', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      toast({
        title: 'Approval requested',
        description: 'Your deal has been submitted for approval.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error requesting approval',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Respond to approval
export function useRespondToApproval() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      approvalId,
      dealId,
      approved,
      notes,
    }: {
      approvalId: string;
      dealId: string;
      approved: boolean;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('deal_approvals')
        .update({
          status: approved ? 'approved' : 'rejected',
          response_notes: notes || null,
          responded_at: new Date().toISOString(),
        })
        .eq('id', approvalId)
        .select()
        .single();

      if (error) throw error;

      // Update deal status
      await supabase
        .from('deals')
        .update({ status: approved ? 'approved' : 'rejected' })
        .eq('id', dealId);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-approvals', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['deals', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      toast({
        title: variables.approved ? 'Deal approved' : 'Deal rejected',
        description: `The deal has been ${variables.approved ? 'approved' : 'rejected'}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error responding to approval',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Escalate approval
export function useEscalateApproval() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      approvalId,
      dealId,
      notes,
    }: {
      approvalId: string;
      dealId: string;
      notes?: string;
    }) => {
      // Get executives for escalation
      const { data: executives } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'executive')
        .limit(1);

      const assignedTo = executives?.[0]?.user_id || null;

      const { data, error } = await supabase
        .from('deal_approvals')
        .update({
          status: 'escalated',
          response_notes: notes || null,
          responded_at: new Date().toISOString(),
        })
        .eq('id', approvalId)
        .select()
        .single();

      if (error) throw error;

      // Create new escalated approval
      const { data: userData } = await supabase.auth.getUser();

      await supabase.from('deal_approvals').insert({
        deal_id: dealId,
        requested_by: userData.user?.id,
        assigned_to: assignedTo,
        status: 'pending',
        approval_level: 2,
        request_notes: `Escalated: ${notes || 'No notes provided'}`,
      } as any);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-approvals', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      toast({
        title: 'Deal escalated',
        description: 'The deal has been escalated to executive review.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error escalating approval',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
