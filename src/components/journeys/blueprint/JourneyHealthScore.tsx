import { Journey } from '@/types/journeys';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, AlertTriangle, Layers, Target, TrendingUp } from 'lucide-react';

interface JourneyHealthScoreProps {
  journey: Journey;
}

export function JourneyHealthScore({ journey }: JourneyHealthScoreProps) {
  const stages = journey.stages || [];
  const allTouchpoints = stages.flatMap(s => s.touchpoints || []);
  
  const totalTouchpoints = allTouchpoints.length;
  const momentsOfTruth = allTouchpoints.filter(t => t.is_moment_of_truth).length;
  const highPainPoints = allTouchpoints.filter(t => t.pain_point_level >= 4).length;
  const avgPainLevel = totalTouchpoints > 0 
    ? (allTouchpoints.reduce((sum, t) => sum + (t.pain_point_level || 0), 0) / totalTouchpoints).toFixed(1)
    : '0';
  
  // Calculate health score (0-100)
  const valueMessageCoverage = totalTouchpoints > 0 
    ? allTouchpoints.filter(t => t.value_message).length / totalTouchpoints 
    : 0;
  const momentOfTruthRatio = totalTouchpoints > 0 ? momentsOfTruth / totalTouchpoints : 0;
  const painScore = 1 - (highPainPoints / Math.max(totalTouchpoints, 1));
  
  const healthScore = Math.round((valueMessageCoverage * 40 + momentOfTruthRatio * 30 + painScore * 30));
  
  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 70) return 'Healthy';
    if (score >= 40) return 'Needs Attention';
    return 'Critical';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {/* Health Score */}
      <Card className="bg-gradient-to-br from-card to-muted/30 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Journey Health</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getHealthColor(healthScore)}`}>
              {healthScore}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          <Badge variant="outline" className={`mt-2 ${getHealthColor(healthScore)}`}>
            {getHealthLabel(healthScore)}
          </Badge>
        </CardContent>
      </Card>

      {/* Stages */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Stages</span>
          </div>
          <span className="text-3xl font-bold">{stages.length}</span>
        </CardContent>
      </Card>

      {/* Total Touchpoints */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Touchpoints</span>
          </div>
          <span className="text-3xl font-bold">{totalTouchpoints}</span>
        </CardContent>
      </Card>

      {/* Moments of Truth */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground font-medium">Moments of Truth</span>
          </div>
          <span className="text-3xl font-bold text-yellow-500">{momentsOfTruth}</span>
        </CardContent>
      </Card>

      {/* Pain Points */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-xs text-muted-foreground font-medium">High Pain Points</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-red-500">{highPainPoints}</span>
            <span className="text-sm text-muted-foreground">avg: {avgPainLevel}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
