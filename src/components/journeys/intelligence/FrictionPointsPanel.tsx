import { Journey, JourneyTouchpoint } from '@/types/journeys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, TrendingDown, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FrictionPoint {
  touchpoint: JourneyTouchpoint;
  stageName: string;
  stageId: string;
  painLevel: number;
  estimatedImpact: number;
  issues: string[];
}

interface FrictionPointsPanelProps {
  journey: Journey;
  onTouchpointClick?: (touchpoint: JourneyTouchpoint, stageId: string) => void;
  maxItems?: number;
}

function calculateEstimatedImpact(touchpoint: JourneyTouchpoint): number {
  // Simple heuristic: higher pain + moment of truth = higher impact
  let baseImpact = touchpoint.pain_point_level * 20000;
  if (touchpoint.is_moment_of_truth) baseImpact *= 2;
  return baseImpact;
}

function identifyIssues(touchpoint: JourneyTouchpoint): string[] {
  const issues: string[] = [];
  const tp = touchpoint as any;
  
  if (touchpoint.pain_point_level >= 4) {
    issues.push('High friction point causing customer drop-off');
  }
  
  if (touchpoint.is_moment_of_truth && !touchpoint.value_message) {
    issues.push('Missing value message at critical moment');
  }
  
  if (!tp.systems || tp.systems.length === 0) {
    issues.push('No systems defined - manual process risk');
  }
  
  if (!tp.kpis || tp.kpis.length === 0) {
    issues.push('No KPIs tracked - can\'t measure effectiveness');
  }
  
  if (!touchpoint.owner_role) {
    issues.push('No owner assigned - accountability gap');
  }
  
  return issues;
}

export function FrictionPointsPanel({ 
  journey, 
  onTouchpointClick,
  maxItems = 5 
}: FrictionPointsPanelProps) {
  const stages = journey.stages || [];
  
  // Collect all friction points across all stages
  const frictionPoints: FrictionPoint[] = [];
  
  stages.forEach(stage => {
    (stage.touchpoints || []).forEach(touchpoint => {
      const issues = identifyIssues(touchpoint);
      if (touchpoint.pain_point_level >= 3 || issues.length >= 2) {
        frictionPoints.push({
          touchpoint,
          stageName: stage.name,
          stageId: stage.id,
          painLevel: touchpoint.pain_point_level,
          estimatedImpact: calculateEstimatedImpact(touchpoint),
          issues,
        });
      }
    });
  });
  
  // Sort by impact (highest first)
  const sortedFriction = frictionPoints
    .sort((a, b) => b.estimatedImpact - a.estimatedImpact)
    .slice(0, maxItems);
  
  const totalImpact = sortedFriction.reduce((sum, fp) => sum + fp.estimatedImpact, 0);

  if (sortedFriction.length === 0) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-green-500 mb-2">
            <Zap className="h-5 w-5" />
            <span className="font-medium">No Critical Friction Detected</span>
          </div>
          <p className="text-sm text-muted-foreground">
            This journey appears well-optimized. Continue monitoring for improvement opportunities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg">Top Friction Points</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              ~${(totalImpact / 1000).toFixed(0)}K/quarter at risk
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedFriction.map((fp, index) => (
          <button
            key={fp.touchpoint.id}
            onClick={() => onTouchpointClick?.(fp.touchpoint, fp.stageId)}
            className={cn(
              'w-full text-left p-4 rounded-lg border transition-all',
              'hover:border-primary/50 hover:bg-accent/50',
              fp.painLevel >= 4 ? 'bg-red-500/5 border-red-500/30' : 'bg-yellow-500/5 border-yellow-500/30'
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                  <span className="font-medium truncate">
                    {fp.touchpoint.name}
                  </span>
                  {fp.touchpoint.is_moment_of_truth && (
                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 text-xs">
                      ⭐ MOT
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {fp.stageName}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Pain Level: {fp.painLevel}/5
                  </span>
                </div>
                
                <ul className="space-y-1">
                  {fp.issues.slice(0, 2).map((issue, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                      <span className="text-destructive">►</span>
                      {issue}
                    </li>
                  ))}
                  {fp.issues.length > 2 && (
                    <li className="text-xs text-muted-foreground">
                      +{fp.issues.length - 2} more issues
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-bold text-destructive">
                  ${(fp.estimatedImpact / 1000).toFixed(0)}K
                </span>
                <span className="text-[10px] text-muted-foreground">
                  est. impact
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground mt-2" />
              </div>
            </div>
          </button>
        ))}
        
        {frictionPoints.length > maxItems && (
          <Button variant="ghost" size="sm" className="w-full">
            View all {frictionPoints.length} friction points
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
