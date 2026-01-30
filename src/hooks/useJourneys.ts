import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Journey, JourneyStage, JourneyTouchpoint } from '@/types/journeys';
import { useToast } from '@/hooks/use-toast';

// Fetch all journeys
export function useJourneys() {
  return useQuery({
    queryKey: ['journeys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journeys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Journey[];
    },
  });
}

// Fetch single journey with stages and touchpoints
export function useJourney(id: string | undefined) {
  return useQuery({
    queryKey: ['journeys', id],
    queryFn: async () => {
      if (!id) return null;

      // Fetch journey
      const { data: journey, error: journeyError } = await supabase
        .from('journeys')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (journeyError) throw journeyError;
      if (!journey) return null;

      // Fetch stages
      const { data: stages, error: stagesError } = await supabase
        .from('journey_stages')
        .select('*')
        .eq('journey_id', id)
        .order('stage_order', { ascending: true });

      if (stagesError) throw stagesError;

      // Fetch touchpoints for all stages
      const stageIds = stages?.map((s) => s.id) || [];
      let touchpoints: JourneyTouchpoint[] = [];

      if (stageIds.length > 0) {
        const { data: touchpointsData, error: touchpointsError } = await supabase
          .from('journey_touchpoints')
          .select('*')
          .in('stage_id', stageIds)
          .order('touchpoint_order', { ascending: true });

        if (touchpointsError) throw touchpointsError;
        touchpoints = touchpointsData as JourneyTouchpoint[];
      }

      // Combine stages with their touchpoints
      const stagesWithTouchpoints = stages?.map((stage) => ({
        ...stage,
        touchpoints: touchpoints.filter((t) => t.stage_id === stage.id),
      })) as JourneyStage[];

      return {
        ...journey,
        stages: stagesWithTouchpoints,
      } as Journey;
    },
    enabled: !!id,
  });
}

// Create journey
export function useCreateJourney() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (journey: Partial<Journey>) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('journeys')
        .insert({
          name: journey.name!,
          description: journey.description || null,
          journey_type: journey.journey_type!,
          color: journey.color || '#3b82f6',
          owner_id: userData.user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data as Journey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
      toast({
        title: 'Journey created',
        description: 'Your journey has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating journey',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Update journey
export function useUpdateJourney() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Journey> & { id: string }) => {
      const { data, error } = await supabase
        .from('journeys')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Journey;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
      queryClient.invalidateQueries({ queryKey: ['journeys', data.id] });
      toast({
        title: 'Journey updated',
        description: 'Your journey has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating journey',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Delete journey
export function useDeleteJourney() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('journeys').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journeys'] });
      toast({
        title: 'Journey deleted',
        description: 'The journey has been deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting journey',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Create stage
export function useCreateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stage: Partial<JourneyStage>) => {
      const { data, error } = await supabase
        .from('journey_stages')
        .insert({
          journey_id: stage.journey_id!,
          name: stage.name!,
          description: stage.description || null,
          stage_order: stage.stage_order ?? 0,
          color: stage.color || null,
          icon: stage.icon || null,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data as JourneyStage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journeys', data.journey_id] });
    },
  });
}

// Update stage
export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, journey_id, ...updates }: Partial<JourneyStage> & { id: string; journey_id: string }) => {
      const { data, error } = await supabase
        .from('journey_stages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, journey_id } as JourneyStage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journeys', data.journey_id] });
    },
  });
}

// Delete stage
export function useDeleteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, journey_id }: { id: string; journey_id: string }) => {
      const { error } = await supabase.from('journey_stages').delete().eq('id', id);
      if (error) throw error;
      return { journey_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journeys', data.journey_id] });
    },
  });
}

// Create touchpoint
export function useCreateTouchpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ journey_id, ...touchpoint }: Partial<JourneyTouchpoint> & { journey_id: string }) => {
      const { data, error } = await supabase
        .from('journey_touchpoints')
        .insert({
          stage_id: touchpoint.stage_id!,
          name: touchpoint.name!,
          description: touchpoint.description || null,
          touchpoint_type: touchpoint.touchpoint_type || 'action',
          touchpoint_order: touchpoint.touchpoint_order ?? 0,
          channel: touchpoint.channel || null,
          owner_role: touchpoint.owner_role || null,
          is_moment_of_truth: touchpoint.is_moment_of_truth || false,
          pain_point_level: touchpoint.pain_point_level || 0,
          value_message: touchpoint.value_message || null,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return { ...data, journey_id } as JourneyTouchpoint & { journey_id: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journeys', data.journey_id] });
    },
  });
}

// Update touchpoint
export function useUpdateTouchpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, journey_id, ...updates }: Partial<JourneyTouchpoint> & { id: string; journey_id: string }) => {
      const { data, error } = await supabase
        .from('journey_touchpoints')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, journey_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journeys', data.journey_id] });
    },
  });
}

// Delete touchpoint
export function useDeleteTouchpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, journey_id }: { id: string; journey_id: string }) => {
      const { error } = await supabase.from('journey_touchpoints').delete().eq('id', id);
      if (error) throw error;
      return { journey_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journeys', data.journey_id] });
    },
  });
}
