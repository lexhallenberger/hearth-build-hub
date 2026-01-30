import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ScoringAttribute, DealScore, CATEGORY_LABELS } from '@/types/deals';
import { cn } from '@/lib/utils';
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DealScoreRadarProps {
  scores: (DealScore & { attribute: ScoringAttribute })[];
  attributes: ScoringAttribute[];
  dealClassification?: 'green' | 'yellow' | 'red' | null;
  totalScore?: number | null;
  showBenchmark?: boolean;
}

export function DealScoreRadar({ 
  scores, 
  attributes, 
  dealClassification,
  totalScore,
  showBenchmark = true 
}: DealScoreRadarProps) {
  // Prepare radar chart data
  const radarData = useMemo(() => {
    return attributes.map((attr) => {
      const score = scores.find((s) => s.attribute_id === attr.id);
      return {
        attribute: attr.name.length > 15 ? attr.name.substring(0, 15) + '...' : attr.name,
        fullName: attr.name,
        score: score ? Math.round(score.normalized_score) : 0,
        benchmark: 70, // Green threshold benchmark
        weight: attr.weight,
        category: attr.category,
      };
    });
  }, [scores, attributes]);

  // Calculate category scores
  const categoryScores = useMemo(() => {
    const categories: Record<string, { total: number; count: number; weight: number }> = {};
    
    scores.forEach((score) => {
      const category = score.attribute?.category;
      if (category) {
        if (!categories[category]) {
          categories[category] = { total: 0, count: 0, weight: 0 };
        }
        categories[category].total += score.normalized_score * (score.attribute?.weight || 1);
        categories[category].weight += score.attribute?.weight || 1;
        categories[category].count += 1;
      }
    });

    return Object.entries(categories).map(([category, data]) => ({
      category,
      label: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category,
      score: data.weight > 0 ? Math.round(data.total / data.weight) : 0,
      count: data.count,
    }));
  }, [scores]);

  // Score breakdown by attribute
  const scoreBreakdown = useMemo(() => {
    return scores
      .map((score) => ({
        name: score.attribute?.name || 'Unknown',
        score: Math.round(score.normalized_score),
        weight: score.attribute?.weight || 0,
        contribution: Math.round((score.normalized_score * (score.attribute?.weight || 0)) / 100),
        isStrength: score.normalized_score >= 70,
        isWeakness: score.normalized_score < 40,
      }))
      .sort((a, b) => b.contribution - a.contribution);
  }, [scores]);

  const strengths = scoreBreakdown.filter((s) => s.isStrength);
  const weaknesses = scoreBreakdown.filter((s) => s.isWeakness);
  const approvalProbability = totalScore 
    ? Math.min(100, Math.max(0, Math.round((totalScore / 100) * 120))) 
    : 0;

  const getClassificationColor = (classification: string | null | undefined) => {
    switch (classification) {
      case 'green': return 'text-green-500';
      case 'yellow': return 'text-amber-500';
      case 'red': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getClassificationBg = (classification: string | null | undefined) => {
    switch (classification) {
      case 'green': return 'bg-green-500/10 border-green-500/30';
      case 'yellow': return 'bg-amber-500/10 border-amber-500/30';
      case 'red': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-muted/10 border-muted/30';
    }
  };

  if (attributes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-center">
            No scoring attributes configured.<br />
            Contact an administrator to set up deal scoring.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Score Card with Radar */}
      <Card className={cn('overflow-hidden', getClassificationBg(dealClassification))}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Deal Score Analysis
              </CardTitle>
              <CardDescription>
                Visual breakdown of scoring attributes
              </CardDescription>
            </div>
            {totalScore !== null && totalScore !== undefined && (
              <div className="text-right">
                <div className={cn('text-4xl font-bold', getClassificationColor(dealClassification))}>
                  {Math.round(totalScore)}
                </div>
                <div className="text-xs text-muted-foreground">Total Score</div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="attribute" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                {showBenchmark && (
                  <Radar
                    name="Green Benchmark"
                    dataKey="benchmark"
                    stroke="hsl(142, 76%, 36%)"
                    fill="hsl(142, 76%, 36%)"
                    fillOpacity={0.1}
                    strokeDasharray="5 5"
                  />
                )}
                <Radar
                  name="Deal Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
                          <p className="font-medium">{data.fullName}</p>
                          <p className="text-muted-foreground">Score: <span className="font-medium text-foreground">{data.score}</span></p>
                          <p className="text-muted-foreground">Weight: <span className="font-medium text-foreground">{data.weight}%</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {categoryScores.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {categoryScores.map((cat) => (
                <div 
                  key={cat.category}
                  className={cn(
                    'p-4 rounded-lg border',
                    cat.score >= 70 && 'bg-green-500/5 border-green-500/20',
                    cat.score >= 40 && cat.score < 70 && 'bg-amber-500/5 border-amber-500/20',
                    cat.score < 40 && 'bg-red-500/5 border-red-500/20'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{cat.label}</span>
                    <Badge 
                      variant="outline"
                      className={cn(
                        cat.score >= 70 && 'border-green-500 text-green-500',
                        cat.score >= 40 && cat.score < 70 && 'border-amber-500 text-amber-500',
                        cat.score < 40 && 'border-red-500 text-red-500'
                      )}
                    >
                      {cat.score}
                    </Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        'h-full rounded-full transition-all',
                        cat.score >= 70 && 'bg-green-500',
                        cat.score >= 40 && cat.score < 70 && 'bg-amber-500',
                        cat.score < 40 && 'bg-red-500'
                      )}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {cat.count} attributes scored
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Probability & Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Approval Probability */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Approval Probability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={approvalProbability >= 70 ? 'hsl(142, 76%, 36%)' : approvalProbability >= 40 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 84%, 60%)'}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${approvalProbability * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{approvalProbability}%</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {approvalProbability >= 70 
                    ? 'High probability of approval. Deal meets green thresholds.'
                    : approvalProbability >= 40
                    ? 'Moderate probability. Consider improving weak areas.'
                    : 'Low probability. Significant improvements needed.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strengths & Weaknesses */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {strengths.length > 0 && (
              <div>
                <p className="text-xs font-medium text-green-600 mb-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Strengths ({strengths.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {strengths.slice(0, 3).map((s) => (
                    <Badge key={s.name} variant="outline" className="text-xs border-green-500/30 text-green-600">
                      {s.name}: {s.score}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {weaknesses.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-600 mb-2 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  Needs Improvement ({weaknesses.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {weaknesses.slice(0, 3).map((s) => (
                    <Badge key={s.name} variant="outline" className="text-xs border-red-500/30 text-red-600">
                      {s.name}: {s.score}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {strengths.length === 0 && weaknesses.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Score all attributes to see insights
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Score Contribution Breakdown */}
      {scoreBreakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Score Contribution Breakdown</CardTitle>
            <CardDescription>Impact of each attribute on total score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scoreBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-40 truncate text-sm">{item.name}</div>
                  <div className="flex-1">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full rounded-full transition-all',
                          item.isStrength && 'bg-green-500',
                          !item.isStrength && !item.isWeakness && 'bg-amber-500',
                          item.isWeakness && 'bg-red-500'
                        )}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-right text-sm font-medium">{item.score}</div>
                  <div className="w-16 text-right text-xs text-muted-foreground">
                    ({item.weight}% wt)
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
