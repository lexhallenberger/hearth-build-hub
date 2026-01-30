import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface HealthBreakdownProps {
  healthy: number;
  atRisk: number;
  critical: number;
}

export function CustomerHealthBreakdown({ healthy, atRisk, critical }: HealthBreakdownProps) {
  const total = healthy + atRisk + critical;
  const healthyPct = total > 0 ? (healthy / total) * 100 : 0;
  const atRiskPct = total > 0 ? (atRisk / total) * 100 : 0;
  const criticalPct = total > 0 ? (critical / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Customer Health Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              Healthy
            </span>
            <span className="font-medium">{healthy} ({healthyPct.toFixed(0)}%)</span>
          </div>
          <Progress value={healthyPct} className="h-2" indicatorClassName="bg-green-500" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              At Risk
            </span>
            <span className="font-medium">{atRisk} ({atRiskPct.toFixed(0)}%)</span>
          </div>
          <Progress value={atRiskPct} className="h-2" indicatorClassName="bg-yellow-500" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              Critical
            </span>
            <span className="font-medium">{critical} ({criticalPct.toFixed(0)}%)</span>
          </div>
          <Progress value={criticalPct} className="h-2" indicatorClassName="bg-red-500" />
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between text-sm font-medium">
            <span>Total Customers</span>
            <span>{total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
