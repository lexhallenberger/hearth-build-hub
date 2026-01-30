import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Customer, CustomerHealthScore } from '@/types/customers';
import { HEALTH_STATUS_LABELS, HEALTH_STATUS_COLORS } from '@/types/customers';

interface CustomerHealthCardProps {
  customer: Customer;
  recentScores?: CustomerHealthScore[];
}

export function CustomerHealthCard({ customer, recentScores = [] }: CustomerHealthCardProps) {
  const currentScore = customer.health_score;
  const previousScore = recentScores.length > 1 ? recentScores[1].score : currentScore;
  const trend = currentScore - previousScore;
  
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            Health Score
          </span>
          <Badge className={HEALTH_STATUS_COLORS[customer.health_status]}>
            {HEALTH_STATUS_LABELS[customer.health_status]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4">
          <div className={`text-4xl font-bold ${getScoreColor(currentScore)}`}>
            {Math.round(currentScore)}
          </div>
          <div className="flex items-center gap-1 text-sm pb-1">
            {trend > 0 && (
              <>
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-green-500">+{trend.toFixed(1)}</span>
              </>
            )}
            {trend < 0 && (
              <>
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-red-500">{trend.toFixed(1)}</span>
              </>
            )}
            {trend === 0 && (
              <>
                <Minus className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">No change</span>
              </>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Progress 
            value={currentScore} 
            className="h-2"
            indicatorClassName={getProgressColor(currentScore)}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Score out of 100 • Updated {recentScores[0] 
            ? new Date(recentScores[0].scored_at).toLocaleDateString() 
            : 'Never'}
        </p>
      </CardContent>
    </Card>
  );
}
