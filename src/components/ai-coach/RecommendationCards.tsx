import { Lightbulb, TrendingUp, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Recommendation {
  priority: number;
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

interface ScoreOptimization {
  current: number;
  potential: number;
  actions: string[];
}

interface RecommendationCardsProps {
  recommendations: Recommendation[];
  scoreOptimization: ScoreOptimization;
  isLoading?: boolean;
}

const effortConfig = {
  low: { label: 'Quick Win', color: 'bg-green-500 text-white' },
  medium: { label: 'Moderate', color: 'bg-yellow-500 text-black' },
  high: { label: 'Investment', color: 'bg-orange-500 text-white' },
};

export function RecommendationCards({ 
  recommendations, 
  scoreOptimization,
  isLoading 
}: RecommendationCardsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-8 bg-muted rounded w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const improvement = scoreOptimization.potential - scoreOptimization.current;

  return (
    <div className="space-y-4">
      {/* Score Optimization Card */}
      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-accent" />
            Score Optimization Potential
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {scoreOptimization.current}
                <span className="text-lg text-muted-foreground"> → </span>
                <span className="text-accent">{scoreOptimization.potential}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                +{improvement} points achievable
              </p>
            </div>
            <div className="h-16 w-16 rounded-full border-4 border-accent flex items-center justify-center">
              <span className="text-xl font-bold text-accent">+{improvement}</span>
            </div>
          </div>
          
          <Progress 
            value={(scoreOptimization.current / scoreOptimization.potential) * 100} 
            className="h-2"
          />
          
          {scoreOptimization.actions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Key Actions
              </p>
              <ul className="space-y-1">
                {scoreOptimization.actions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Zap className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-accent" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-6">
              <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No additional recommendations at this time
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec, index) => {
                const effort = effortConfig[rec.effort];
                
                return (
                  <div
                    key={index}
                    className="rounded-lg border bg-card p-3 hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-accent">
                            {rec.priority}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm">{rec.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {rec.description}
                          </p>
                        </div>
                      </div>
                      <Badge className={cn('text-xs flex-shrink-0', effort.color)}>
                        {effort.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 ml-9">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600">{rec.impact}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
