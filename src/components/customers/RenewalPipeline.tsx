import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRenewals, useUpdateRenewal } from '@/hooks/useCustomers';
import { RenewalFormDialog } from './RenewalFormDialog';
import { Plus, Calendar, DollarSign, AlertTriangle, Loader2 } from 'lucide-react';
import { format, differenceInDays, isBefore } from 'date-fns';
import { RENEWAL_STATUS_LABELS, RENEWAL_STATUS_COLORS, TIER_COLORS, TIER_LABELS } from '@/types/customers';
import type { Renewal, Customer, RenewalStatus } from '@/types/customers';

export function RenewalPipeline() {
  const { data: renewals = [], isLoading } = useRenewals();
  const updateRenewal = useUpdateRenewal();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Medium Risk</Badge>;
      default:
        return <Badge variant="secondary">Low Risk</Badge>;
    }
  };

  const getDaysUntilRenewal = (date: string) => {
    const renewalDate = new Date(date);
    const today = new Date();
    return differenceInDays(renewalDate, today);
  };

  const handleStatusChange = async (renewalId: string, newStatus: RenewalStatus) => {
    await updateRenewal.mutateAsync({ id: renewalId, status: newStatus });
  };

  const upcomingRenewals = renewals.filter(r => r.status === 'upcoming' || r.status === 'in_progress');
  const completedRenewals = renewals.filter(r => r.status === 'renewed' || r.status === 'expanded' || r.status === 'churned');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Renewal Pipeline</h2>
        <Button onClick={() => { setSelectedRenewal(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Renewal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{upcomingRenewals.length}</div>
            <p className="text-xs text-muted-foreground">Active Renewals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {formatCurrency(upcomingRenewals.reduce((sum, r) => sum + r.current_value, 0))}
            </div>
            <p className="text-xs text-muted-foreground">At-Risk Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {renewals.filter(r => r.status === 'renewed' || r.status === 'expanded').length}
            </div>
            <p className="text-xs text-muted-foreground">Renewed This Quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">
              {renewals.filter(r => r.status === 'churned').length}
            </div>
            <p className="text-xs text-muted-foreground">Churned This Quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Renewals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Upcoming & In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingRenewals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No upcoming renewals</p>
          ) : (
            <div className="space-y-4">
              {upcomingRenewals.map((renewal) => {
                const daysUntil = getDaysUntilRenewal(renewal.renewal_date);
                const isOverdue = daysUntil < 0;
                const isUrgent = daysUntil <= 30 && !isOverdue;
                
                return (
                  <div
                    key={renewal.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => { setSelectedRenewal(renewal); setDialogOpen(true); }}
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{renewal.customer?.name}</span>
                          {renewal.customer?.tier && (
                            <Badge className={TIER_COLORS[renewal.customer.tier]} variant="secondary">
                              {TIER_LABELS[renewal.customer.tier]}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(renewal.renewal_date), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(renewal.current_value)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {(isOverdue || isUrgent) && (
                        <div className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-red-500' : 'text-yellow-500'}`}>
                          <AlertTriangle className="h-4 w-4" />
                          {isOverdue ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days left`}
                        </div>
                      )}
                      {getRiskBadge(renewal.risk_level)}
                      <Badge className={RENEWAL_STATUS_COLORS[renewal.status]}>
                        {RENEWAL_STATUS_LABELS[renewal.status]}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Completions */}
      {completedRenewals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recently Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedRenewals.slice(0, 5).map((renewal) => (
                <div
                  key={renewal.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <span className="font-medium">{renewal.customer?.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(renewal.proposed_value || renewal.current_value)}
                    </span>
                    <Badge className={RENEWAL_STATUS_COLORS[renewal.status]}>
                      {RENEWAL_STATUS_LABELS[renewal.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <RenewalFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        renewal={selectedRenewal}
      />
    </div>
  );
}
