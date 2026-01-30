import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import type { CustomerHealthScore } from '@/types/customers';

interface HealthScoreHistoryProps {
  scores: CustomerHealthScore[];
}

export function HealthScoreHistory({ scores }: HealthScoreHistoryProps) {
  const chartData = [...scores]
    .reverse()
    .map((score) => ({
      date: format(new Date(score.scored_at), 'MMM d'),
      score: score.score,
      fullDate: format(new Date(score.scored_at), 'MMM d, yyyy'),
    }));

  if (scores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Health Score History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            No health score history available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Health Score History</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
            />
            <YAxis 
              domain={[0, 100]}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelFormatter={(_, payload) => payload[0]?.payload?.fullDate}
              formatter={(value: number) => [`${value.toFixed(1)}`, 'Score']}
            />
            <ReferenceLine y={70} stroke="hsl(var(--success))" strokeDasharray="5 5" />
            <ReferenceLine y={40} stroke="hsl(var(--warning))" strokeDasharray="5 5" />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-green-500" />
            <span>Healthy (70+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-yellow-500" />
            <span>At Risk (40+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-500" />
            <span>Critical (&lt;40)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
