import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { ScoringAttribute, DealScore, CATEGORY_LABELS } from '@/types/deals';

interface DealScoreChartProps {
  scores: (DealScore & { attribute: ScoringAttribute })[];
  attributes: ScoringAttribute[];
}

export function DealScoreChart({ scores, attributes }: DealScoreChartProps) {
  const chartData = useMemo(() => {
    return attributes.map((attr) => {
      const score = scores.find((s) => s.attribute_id === attr.id);
      return {
        attribute: attr.name,
        score: score?.normalized_score ?? 0,
        fullMark: 100,
      };
    });
  }, [scores, attributes]);

  // Group scores by category for summary
  const categoryScores = useMemo(() => {
    const grouped: Record<string, { total: number; count: number; weight: number }> = {};

    attributes.forEach((attr) => {
      const score = scores.find((s) => s.attribute_id === attr.id);
      if (!grouped[attr.category]) {
        grouped[attr.category] = { total: 0, count: 0, weight: 0 };
      }
      if (score) {
        grouped[attr.category].total += score.normalized_score * attr.weight;
        grouped[attr.category].weight += attr.weight;
        grouped[attr.category].count += 1;
      }
    });

    return Object.entries(grouped).map(([category, data]) => ({
      category,
      label: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS],
      score: data.weight > 0 ? Math.round(data.total / data.weight) : 0,
      count: data.count,
    }));
  }, [scores, attributes]);

  if (scores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Score Visualization</CardTitle>
          <CardDescription>Score attributes to see the radar chart</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
            <p className="text-sm text-muted-foreground">No scores yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Breakdown</CardTitle>
        <CardDescription>Visual representation of all scoring attributes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="attribute"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="hsl(var(--accent))"
                fill="hsl(var(--accent))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Category Scores</h4>
          <div className="grid gap-2">
            {categoryScores.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{cat.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">{cat.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
