import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PipelineFunnelProps {
  data: Record<string, number>;
}

const STAGE_CONFIG = [
  { key: 'discovery', label: 'Discovery', color: '#8b5cf6' },
  { key: 'qualification', label: 'Qualification', color: '#6366f1' },
  { key: 'proposal', label: 'Proposal', color: '#3b82f6' },
  { key: 'negotiation', label: 'Negotiation', color: '#0ea5e9' },
  { key: 'closed_won', label: 'Won', color: '#22c55e' },
  { key: 'closed_lost', label: 'Lost', color: '#ef4444' },
];

export function PipelineFunnel({ data }: PipelineFunnelProps) {
  const chartData = STAGE_CONFIG.map(stage => ({
    name: stage.label,
    count: data[stage.key] || 0,
    color: stage.color,
  }));

  const total = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Pipeline Funnel</CardTitle>
        <CardDescription>Opportunities by stage ({total} total)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
              type="category" 
              dataKey="name" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              width={90}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [`${value} opportunities`, 'Count']}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
