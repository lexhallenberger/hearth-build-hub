import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Map, ChevronRight, Check, Clock, Target, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Journey, JourneyStage } from '@/types/journeys';

interface DealJourneyMapperProps {
  dealId: string;
  currentStageId: string | null;
  touchpointIds: string[];
  onUpdate?: () => void;
}

export function DealJourneyMapper({ 
  dealId, 
  currentStageId, 
  touchpointIds = [],
  onUpdate 
}: DealJourneyMapperProps) {
  const queryClient = useQueryClient();
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);

  // Fetch deal journeys
  const { data: journeys, isLoading: journeysLoading } = useQuery({
    queryKey: ['deal-journeys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journeys')
        .select('*, stages:journey_stages(*, touchpoints:journey_touchpoints(*))')
        .eq('journey_type', 'deal')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as (Journey & { stages: (JourneyStage & { touchpoints: any[] })[] })[];
    },
  });

  // Get the current journey based on stage
  const { data: currentStage } = useQuery({
    queryKey: ['deal-current-stage', currentStageId],
    queryFn: async () => {
      if (!currentStageId) return null;
      const { data, error } = await supabase
        .from('journey_stages')
        .select('*, journey:journeys(*)')
        .eq('id', currentStageId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentStageId,
  });

  const selectedJourney = journeys?.find(j => 
    j.id === selectedJourneyId || 
    j.stages?.some(s => s.id === currentStageId)
  );

  // Update deal stage mutation
  const updateStageMutation = useMutation({
    mutationFn: async (stageId: string) => {
      const { error } = await supabase
        .from('deals')
        .update({ journey_stage_id: stageId })
        .eq('id', dealId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals', dealId] });
      toast.success('Deal stage updated');
      onUpdate?.();
    },
    onError: (error) => {
      toast.error('Failed to update stage');
      console.error(error);
    },
  });

  // Toggle touchpoint completion
  const toggleTouchpointMutation = useMutation({
    mutationFn: async (touchpointId: string) => {
      const newIds = touchpointIds.includes(touchpointId)
        ? touchpointIds.filter(id => id !== touchpointId)
        : [...touchpointIds, touchpointId];
      
      const { error } = await supabase
        .from('deals')
        .update({ touchpoint_ids: newIds })
        .eq('id', dealId);
      
      if (error) throw error;
      return newIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals', dealId] });
      onUpdate?.();
    },
    onError: (error) => {
      toast.error('Failed to update touchpoint');
      console.error(error);
    },
  });

  if (journeysLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const stages = selectedJourney?.stages?.sort((a, b) => a.stage_order - b.stage_order) || [];
  const currentStageIndex = stages.findIndex(s => s.id === currentStageId);
  const progress = stages.length > 0 
    ? ((currentStageIndex + 1) / stages.length) * 100 
    : 0;

  // Calculate touchpoint completion for current stage
  const currentStageTouchpoints = stages.find(s => s.id === currentStageId)?.touchpoints || [];
  const completedTouchpoints = currentStageTouchpoints.filter(t => touchpointIds.includes(t.id)).length;
  const touchpointProgress = currentStageTouchpoints.length > 0
    ? (completedTouchpoints / currentStageTouchpoints.length) * 100
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Map className="h-5 w-5 text-accent" />
          Deal Journey Mapping
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Journey Selector */}
        {!selectedJourney && !currentStageId && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Link this deal to a journey to track progress through stages
            </p>
            <Select onValueChange={(value) => setSelectedJourneyId(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a deal journey" />
              </SelectTrigger>
              <SelectContent>
                {journeys?.map((journey) => (
                  <SelectItem key={journey.id} value={journey.id}>
                    {journey.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Journey Progress */}
        {selectedJourney && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{selectedJourney.name}</h4>
                <p className="text-xs text-muted-foreground">
                  Stage {currentStageIndex + 1} of {stages.length}
                </p>
              </div>
              <Badge variant="outline" className="text-accent border-accent">
                {Math.round(progress)}% Complete
              </Badge>
            </div>
            
            <Progress value={progress} className="h-2" />

            {/* Stage Pipeline */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {stages.map((stage, index) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = stage.id === currentStageId;
                const isUpcoming = index > currentStageIndex;
                
                return (
                  <div key={stage.id} className="flex items-center">
                    <Button
                      variant={isCurrent ? "default" : isCompleted ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-auto py-2 px-3 flex flex-col items-start min-w-[100px]",
                        isCurrent && "bg-accent hover:bg-accent/90",
                        isCompleted && "bg-success/20 text-success",
                        isUpcoming && "opacity-50"
                      )}
                      onClick={() => updateStageMutation.mutate(stage.id)}
                      disabled={updateStageMutation.isPending}
                    >
                      <div className="flex items-center gap-1 text-xs font-medium">
                        {isCompleted && <Check className="h-3 w-3" />}
                        {isCurrent && <Target className="h-3 w-3" />}
                        {isUpcoming && <Clock className="h-3 w-3" />}
                        <span>Stage {index + 1}</span>
                      </div>
                      <span className="text-[10px] opacity-75 truncate max-w-[80px]">
                        {stage.name}
                      </span>
                    </Button>
                    {index < stages.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mx-1" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Current Stage Touchpoints */}
            {currentStageId && currentStageTouchpoints.length > 0 && (
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium">Stage Touchpoints</h5>
                  <span className="text-xs text-muted-foreground">
                    {completedTouchpoints}/{currentStageTouchpoints.length} complete
                  </span>
                </div>
                <Progress value={touchpointProgress} className="h-1.5" />
                <div className="space-y-2">
                  {currentStageTouchpoints.map((touchpoint) => {
                    const isComplete = touchpointIds.includes(touchpoint.id);
                    
                    return (
                      <button
                        key={touchpoint.id}
                        onClick={() => toggleTouchpointMutation.mutate(touchpoint.id)}
                        disabled={toggleTouchpointMutation.isPending}
                        className={cn(
                          "w-full flex items-center gap-3 p-2 rounded-lg border transition-colors text-left",
                          isComplete 
                            ? "bg-success/10 border-success/30" 
                            : "bg-card hover:bg-accent/5 border-border"
                        )}
                      >
                        <div className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                          isComplete 
                            ? "bg-success border-success" 
                            : "border-muted-foreground"
                        )}>
                          {isComplete && <Check className="h-3 w-3 text-success-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            isComplete && "line-through opacity-60"
                          )}>
                            {touchpoint.name}
                          </p>
                          {touchpoint.channel && (
                            <p className="text-xs text-muted-foreground">
                              {touchpoint.channel}
                            </p>
                          )}
                        </div>
                        {touchpoint.is_moment_of_truth && (
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            Key
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* No Journeys Message */}
        {!journeysLoading && (!journeys || journeys.length === 0) && (
          <div className="text-center py-6">
            <Map className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No deal journeys available. Create a deal journey to start mapping.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
