import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Layers, 
  Users, 
  Briefcase, 
  Handshake, 
  FileText,
  ChevronRight,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { JourneyType } from '@/types/journeys';

interface CrossJourneyPanelProps {
  dealId: string;
  customerName: string;
}

const journeyTypeConfig: Record<JourneyType, { 
  icon: React.ElementType; 
  label: string; 
  color: string;
  bgColor: string;
}> = {
  customer: { 
    icon: Users, 
    label: 'Customer Journey', 
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10'
  },
  seller: { 
    icon: Briefcase, 
    label: 'Seller Journey', 
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10'
  },
  partner: { 
    icon: Handshake, 
    label: 'Partner Journey', 
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10'
  },
  deal: { 
    icon: FileText, 
    label: 'Deal Journey', 
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10'
  },
};

export function CrossJourneyPanel({ dealId, customerName }: CrossJourneyPanelProps) {
  // Fetch all related journeys and current positions
  const { data: journeyData, isLoading } = useQuery({
    queryKey: ['cross-journey-data', dealId, customerName],
    queryFn: async () => {
      // Fetch the deal with its journey stage
      const { data: deal } = await supabase
        .from('deals')
        .select(`
          journey_stage_id,
          touchpoint_ids,
          journey_stage:journey_stages(
            id, name, stage_order,
            journey:journeys(id, name, journey_type, color)
          )
        `)
        .eq('id', dealId)
        .single();

      // Fetch customer by name to get their journey info
      const { data: customers } = await supabase
        .from('customers')
        .select(`
          id,
          journey_id,
          current_stage_id,
          journey:journeys(id, name, journey_type, color),
          current_stage:journey_stages(id, name, stage_order)
        `)
        .ilike('name', `%${customerName}%`)
        .limit(1);

      const customer = customers?.[0];

      // Fetch all journey types with their stages for context
      const { data: allJourneys } = await supabase
        .from('journeys')
        .select(`
          id, name, journey_type, color, is_active,
          stages:journey_stages(id, name, stage_order)
        `)
        .eq('is_active', true)
        .order('name');

      // Group journeys by type
      const journeysByType = allJourneys?.reduce((acc, j) => {
        if (!acc[j.journey_type]) {
          acc[j.journey_type] = [];
        }
        acc[j.journey_type].push(j);
        return acc;
      }, {} as Record<string, typeof allJourneys>);

      return {
        deal: deal ? {
          journeyStageId: deal.journey_stage_id,
          touchpointIds: deal.touchpoint_ids || [],
          stage: deal.journey_stage,
        } : null,
        customer: customer ? {
          id: customer.id,
          journeyId: customer.journey_id,
          currentStageId: customer.current_stage_id,
          journey: customer.journey,
          stage: customer.current_stage,
        } : null,
        journeysByType: journeysByType || {},
      };
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const journeyTypes: JourneyType[] = ['customer', 'seller', 'deal', 'partner'];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="h-5 w-5 text-accent" />
          Cross-Journey Visibility
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {journeyTypes.map((type) => {
              const config = journeyTypeConfig[type];
              const Icon = config.icon;
              const typeJourneys = journeyData?.journeysByType[type] || [];
              
              // Determine current position for this journey type
              let currentStage = null;
              let linkedJourney = null;
              
              if (type === 'deal' && journeyData?.deal?.stage) {
                currentStage = journeyData.deal.stage;
                linkedJourney = (currentStage as any)?.journey;
              } else if (type === 'customer' && journeyData?.customer?.stage) {
                currentStage = journeyData.customer.stage;
                linkedJourney = journeyData.customer.journey;
              }

              const hasLink = !!linkedJourney;
              const availableJourneys = typeJourneys.length;

              return (
                <div 
                  key={type}
                  className={cn(
                    "rounded-lg border p-3 transition-colors",
                    hasLink ? `${config.bgColor} border-transparent` : "bg-card"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                        hasLink ? config.bgColor : "bg-muted"
                      )}>
                        <Icon className={cn(
                          "h-4 w-4",
                          hasLink ? config.color : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{config.label}</h4>
                        {hasLink ? (
                          <div className="mt-1">
                            <p className="text-xs text-muted-foreground">
                              {(linkedJourney as any)?.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="secondary" 
                                className={cn("text-xs", config.color)}
                              >
                                Stage {(currentStage as any)?.stage_order + 1}: {(currentStage as any)?.name}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">
                            {availableJourneys > 0 
                              ? `${availableJourneys} journey${availableJourneys > 1 ? 's' : ''} available`
                              : 'No journeys configured'}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {linkedJourney && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link to={`/journeys/${(linkedJourney as any).id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>

                  {/* Stage Progress Indicator */}
                  {hasLink && linkedJourney && (
                    <div className="mt-3 flex items-center gap-1">
                      {typeJourneys
                        .find((j: any) => j.id === (linkedJourney as any).id)
                        ?.stages?.sort((a: any, b: any) => a.stage_order - b.stage_order)
                        .map((stage: any, idx: number) => {
                          const isCurrent = stage.id === (currentStage as any)?.id;
                          const isPast = stage.stage_order < ((currentStage as any)?.stage_order ?? 0);
                          
                          return (
                            <div
                              key={stage.id}
                              className={cn(
                                "h-1.5 flex-1 rounded-full transition-colors",
                                isCurrent && config.color.replace('text-', 'bg-'),
                                isPast && "bg-muted-foreground/40",
                                !isCurrent && !isPast && "bg-muted"
                              )}
                              title={stage.name}
                            />
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Track {customerName}'s position across all journey types for aligned engagement
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
