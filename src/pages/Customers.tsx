import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function Customers() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">Customer success and renewal management</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Success & Renewals</CardTitle>
          <CardDescription>
            Health scoring, renewal pipeline, and success playbooks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Coming in Phase 5</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Customer Health Scoring, Renewal Management, and Success Playbooks with AI-powered
              churn prediction.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
