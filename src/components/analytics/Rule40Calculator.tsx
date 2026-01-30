import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Rule40CalculatorProps {
  initialRevenueGrowth?: number;
  initialProfitMargin?: number;
}

export function Rule40Calculator({ 
  initialRevenueGrowth = 35, 
  initialProfitMargin = 12 
}: Rule40CalculatorProps) {
  const [revenueGrowth, setRevenueGrowth] = useState(initialRevenueGrowth);
  const [profitMargin, setProfitMargin] = useState(initialProfitMargin);
  
  const rule40Score = revenueGrowth + profitMargin;
  const isHealthy = rule40Score >= 40;

  const getScoreColor = () => {
    if (rule40Score >= 60) return 'text-green-500';
    if (rule40Score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Rule of 40 Calculator</CardTitle>
        <CardDescription>
          Revenue Growth % + Profit Margin % ≥ 40
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className={`text-5xl font-bold ${getScoreColor()}`}>
            {rule40Score.toFixed(0)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isHealthy ? '✓ Healthy' : '⚠ Below Target'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Revenue Growth Rate</Label>
              <span className="text-sm font-medium">{revenueGrowth}%</span>
            </div>
            <Slider
              value={[revenueGrowth]}
              onValueChange={([value]) => setRevenueGrowth(value)}
              min={-20}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Profit Margin</Label>
              <span className="text-sm font-medium">{profitMargin}%</span>
            </div>
            <Slider
              value={[profitMargin]}
              onValueChange={([value]) => setProfitMargin(value)}
              min={-50}
              max={50}
              step={1}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{revenueGrowth}%</div>
            <p className="text-xs text-muted-foreground">Growth</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">{profitMargin}%</div>
            <p className="text-xs text-muted-foreground">Margin</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
