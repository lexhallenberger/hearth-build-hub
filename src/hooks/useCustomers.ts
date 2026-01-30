import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Customer, CustomerHealthScore, Renewal, CustomerTier, HealthStatus, RenewalStatus } from '@/types/customers';

// Customers hooks
export function useCustomers() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['customers', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Customer[];
    },
    enabled: !!user,
  });
}

export function useCustomer(id: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Customer;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (customer: Omit<Customer, 'id' | 'arr' | 'created_at' | 'updated_at' | 'owner_id'>) => {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...customer,
          owner_id: user!.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create customer: ' + error.message);
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Customer> & { id: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
      toast.success('Customer updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update customer: ' + error.message);
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete customer: ' + error.message);
    },
  });
}

// Health scores hooks
export function useCustomerHealthScores(customerId: string | undefined) {
  return useQuery({
    queryKey: ['customer-health-scores', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_health_scores')
        .select('*')
        .eq('customer_id', customerId)
        .order('scored_at', { ascending: false });
      
      if (error) throw error;
      return data as CustomerHealthScore[];
    },
    enabled: !!customerId,
  });
}

export function useAddHealthScore() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      customerId, 
      score, 
      indicators 
    }: { 
      customerId: string; 
      score: number; 
      indicators: Record<string, number> 
    }) => {
      // Insert health score
      const { error: scoreError } = await supabase
        .from('customer_health_scores')
        .insert({
          customer_id: customerId,
          score,
          indicators,
          scored_by: user!.id,
        });
      
      if (scoreError) throw scoreError;
      
      // Update customer's current health score and status
      const healthStatus: HealthStatus = score >= 70 ? 'healthy' : score >= 40 ? 'at_risk' : 'critical';
      
      const { error: updateError } = await supabase
        .from('customers')
        .update({ 
          health_score: score, 
          health_status: healthStatus 
        })
        .eq('id', customerId);
      
      if (updateError) throw updateError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-health-scores', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Health score recorded');
    },
    onError: (error: Error) => {
      toast.error('Failed to record health score: ' + error.message);
    },
  });
}

// Renewals hooks
export function useRenewals() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['renewals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('renewals')
        .select(`
          *,
          customer:customers(id, name, tier, health_status, arr)
        `)
        .order('renewal_date');
      
      if (error) throw error;
      return data as (Renewal & { customer: Customer })[];
    },
    enabled: !!user,
  });
}

export function useCustomerRenewals(customerId: string | undefined) {
  return useQuery({
    queryKey: ['customer-renewals', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('renewals')
        .select('*')
        .eq('customer_id', customerId)
        .order('renewal_date', { ascending: false });
      
      if (error) throw error;
      return data as Renewal[];
    },
    enabled: !!customerId,
  });
}

export function useCreateRenewal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (renewal: Omit<Renewal, 'id' | 'created_at' | 'updated_at' | 'owner_id' | 'customer'>) => {
      const { data, error } = await supabase
        .from('renewals')
        .insert({
          ...renewal,
          owner_id: user!.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renewals'] });
      toast.success('Renewal created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create renewal: ' + error.message);
    },
  });
}

export function useUpdateRenewal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Renewal> & { id: string }) => {
      const { data, error } = await supabase
        .from('renewals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renewals'] });
      toast.success('Renewal updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update renewal: ' + error.message);
    },
  });
}

export function useDeleteRenewal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('renewals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renewals'] });
      toast.success('Renewal deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete renewal: ' + error.message);
    },
  });
}
