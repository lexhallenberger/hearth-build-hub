import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, ChevronRight, Clock, Zap, MessageCircle, FileText, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TouchpointSuggestionsProps {
  dealId: string;
  currentStageId: string | null;
  completedTouchpointIds: string[];
  onSelectTouchpoint?: (touchpointId: string) => void;
}

const channelIcons: Record<string, React.ElementType> = {
  email: Mail,
  phone: Phone,
  meeting: MessageCircle,
  document: FileText,
};

export function TouchpointSuggestions({ 
  dealId, 
  currentStageId, 
  completedTouchpointIds = [],
  onSelectTouchpoint 
}: TouchpointSuggestionsProps) {
  // Fetch touchpoints for current and next stages
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['touchpoint-suggestions', currentStageId],
    queryFn: async () => {
      if (!currentStageId) return { current: [], next: [], upcoming: [] };

      // Get current stage and its journey
      const { data: currentStage } = await supabase
        .from('journey_stages')
        .select('journey_id, stage_order')
        .eq('id', currentStageId)
        .single();

      if (!currentStage) return { current: [], next: [], upcoming: [] };

      // Get all stages with touchpoints for this journey
      const { data: stages } = await supabase
        .from('journey_stages')
        .select('id, name, stage_order, touchpoints:journey_touchpoints(*)')
        .eq('journey_id', currentStage.journey_id)
        .order('stage_order', { ascending: true });

      if (!stages) return { current: [], next: [], upcoming: [] };

      const currentIndex = stages.findIndex(s => s.id === currentStageId);
      const currentStageTouchpoints = stages[currentIndex]?.touchpoints || [];
      const nextStage = stages[currentIndex + 1];
      const nextStageTouchpoints = nextStage?.touchpoints || [];

      // Filter out completed touchpoints
      const pendingCurrent = currentStageTouchpoints.filter(
        (t: any) => !completedTouchpointIds.includes(t.id)
      );

      // Prioritize moments of truth and high pain points
      const sortByPriority = (a: any, b: any) => {
        if (a.is_moment_of_truth && !b.is_moment_of_truth) return -1;
        if (!a.is_moment_of_truth && b.is_moment_of_truth) return 1;
        return (b.pain_point_level || 0) - (a.pain_point_level || 0);
      };

      return {
        current: pendingCurrent.sort(sortByPriority).slice(0, 3),
        next: nextStageTouchpoints.sort(sortByPriority).slice(0, 2),
        nextStageName: nextStage?.name || null,
        upcoming: stages.slice(currentIndex + 2).flatMap((s: any) => 
          s.touchpoints?.filter((t: any) => t.is_moment_of_truth) || []
        ).slice(0, 2),
      };
    },
    enabled: !!currentStageId,
  });

  if (!currentStageId) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasCurrentSuggestions = suggestions?.current && suggestions.current.length > 0;
  const hasNextSuggestions = suggestions?.next && suggestions.next.length > 0;
  const hasUpcoming = suggestions?.upcoming && suggestions.upcoming.length > 0;

  if (!hasCurrentSuggestions && !hasNextSuggestions) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-accent" />
          Suggested Next Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Stage Suggestions */}
        {hasCurrentSuggestions && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Complete Now
            </p>
            <div className="space-y-2">
              {suggestions?.current.map((touchpoint: any, index: number) => {
                const IconComponent = channelIcons[touchpoint.channel] || Zap;
                
                return (
                  <button
                    key={touchpoint.id}
                    onClick={() => onSelectTouchpoint?.(touchpoint.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                      "bg-accent/5 border-accent/20 hover:bg-accent/10 hover:border-accent/40",
                      index === 0 && "ring-2 ring-accent/30"
                    )}
                  >
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{touchpoint.name}</p>
                        {touchpoint.is_moment_of_truth && (
                          <Badge className="bg-accent text-accent-foreground text-xs">
                            Key
                          </Badge>
                        )}
                      </div>
                      {touchpoint.value_message && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {touchpoint.value_message}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Next Stage Preview */}
        {hasNextSuggestions && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Coming Up: {suggestions?.nextStageName}
              </p>
            </div>
            <div className="space-y-2">
              {suggestions?.next.map((touchpoint: any) => {
                const IconComponent = channelIcons[touchpoint.channel] || Zap;
                
                return (
                  <div
                    key={touchpoint.id}
                    className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30 border-muted opacity-70"
                  >
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{touchpoint.name}</p>
                    </div>
                    {touchpoint.is_moment_of_truth && (
                      <Badge variant="outline" className="text-xs">
                        Key
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Key Moments */}
        {hasUpcoming && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              <span className="font-medium">Key moments ahead:</span>{' '}
              {suggestions?.upcoming.map((t: any) => t.name).join(', ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
