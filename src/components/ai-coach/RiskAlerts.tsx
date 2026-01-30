import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RiskFactor {
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
}

interface RiskAlertsProps {
  risks: RiskFactor[];
  isLoading?: boolean;
}

const severityConfig = {
  high: {
    icon: AlertTriangle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30',
    badgeClass: 'bg-destructive text-destructive-foreground',
  },
  medium: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    badgeClass: 'bg-yellow-500 text-black',
  },
  low: {
    icon: Info,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    badgeClass: 'bg-blue-500 text-white',
  },
};

export function RiskAlerts({ risks, isLoading }: RiskAlertsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-5 w-5 text-accent" />
            Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const highRisks = risks.filter(r => r.severity === 'high');
  const mediumRisks = risks.filter(r => r.severity === 'medium');
  const lowRisks = risks.filter(r => r.severity === 'low');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-5 w-5 text-accent" />
            Risk Analysis
          </CardTitle>
          <div className="flex gap-2">
            {highRisks.length > 0 && (
              <Badge variant="destructive">{highRisks.length} High</Badge>
            )}
            {mediumRisks.length > 0 && (
              <Badge className="bg-yellow-500 text-black hover:bg-yellow-600">
                {mediumRisks.length} Medium
              </Badge>
            )}
            {lowRisks.length > 0 && (
              <Badge variant="secondary">{lowRisks.length} Low</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {risks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
              <ShieldAlert className="h-6 w-6 text-green-500" />
            </div>
            <p className="font-medium text-green-600">No significant risks identified</p>
            <p className="text-sm text-muted-foreground mt-1">
              This deal appears to be within standard parameters
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {risks.map((risk, index) => {
              const config = severityConfig[risk.severity];
              const Icon = config.icon;
              
              return (
                <div
                  key={index}
                  className={cn(
                    'rounded-lg border p-3 transition-colors',
                    config.bgColor,
                    config.borderColor
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{risk.title}</h4>
                        <Badge className={cn('text-xs', config.badgeClass)}>
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {risk.description}
                      </p>
                      <div className="flex items-start gap-2 bg-background/50 rounded p-2">
                        <span className="text-xs font-medium text-accent">Recommendation:</span>
                        <span className="text-xs text-muted-foreground">
                          {risk.recommendation}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
