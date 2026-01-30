import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Executive insights and performance reporting</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Executive Dashboard & Analytics</CardTitle>
          <CardDescription>
            Key metrics, deal quality analytics, and performance comparisons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Coming in Phase 6</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Rule of 40 calculation, CAC ratio analysis, Deal Quality Analytics, and Performance
              Comparisons across teams and regions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
