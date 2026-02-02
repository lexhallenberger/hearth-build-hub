import { JourneyStage } from '@/types/journeys';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface StageHealthBarProps {
  stages: JourneyStage[];
  onStageClick?: (stageId: string) => void;
  selectedStageId?: string;
}

function calculateStageScore(stage: JourneyStage): number {
  const touchpoints = stage.touchpoints || [];
  if (touchpoints.length === 0) return 0;

  let score = 100;
  
  touchpoints.forEach(tp => {
    // Deduct for high pain points
    if (tp.pain_point_level >= 4) score -= 15;
    else if (tp.pain_point_level >= 3) score -= 5;
    
    // Deduct for missing value messages on moments of truth
    if (tp.is_moment_of_truth && !tp.value_message) score -= 20;
    else if (!tp.value_message) score -= 5;
    
    // Deduct for missing systems/kpis
    const tpAny = tp as any;
    if (!tpAny.systems || tpAny.systems.length === 0) score -= 5;
    if (!tpAny.kpis || tpAny.kpis.length === 0) score -= 5;
  });

  return Math.max(0, Math.min(100, score));
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-500/20 border-green-500/40';
  if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/40';
  return 'bg-red-500/20 border-red-500/40';
}

function getScoreIcon(score: number) {
  if (score >= 80) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (score >= 60) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  return <XCircle className="h-4 w-4 text-red-500" />;
}

export function StageHealthBar({ stages, onStageClick, selectedStageId }: StageHealthBarProps) {
  const sortedStages = [...stages].sort((a, b) => a.stage_order - b.stage_order);

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {sortedStages.map((stage, index) => {
        const score = calculateStageScore(stage);
        const isSelected = selectedStageId === stage.id;
        const touchpointCount = stage.touchpoints?.length || 0;
        
        return (
          <div key={stage.id} className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onStageClick?.(stage.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-4 py-3 rounded-lg border transition-all min-w-[120px]',
                    getScoreBg(score),
                    isSelected && 'ring-2 ring-primary',
                    'hover:scale-105 cursor-pointer'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {getScoreIcon(score)}
                    <span className="text-xs font-medium truncate max-w-[80px]">
                      {stage.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-lg font-bold', getScoreColor(score))}>
                      {score}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {touchpointCount} pts
                    </span>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-medium">{stage.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Health Score: {score}% • {touchpointCount} touchpoints
                  </p>
                  {stage.description && (
                    <p className="text-xs">{stage.description}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
            
            {index < sortedStages.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1 flex-shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}
