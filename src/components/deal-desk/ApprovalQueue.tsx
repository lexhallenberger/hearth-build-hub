import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useApproveDeal, useRejectDeal } from '@/hooks/useDealDesk';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Deal {
  id: string;
  name: string;
  customer_name: string;
  deal_value: number;
  total_score: number | null;
  classification: 'green' | 'yellow' | 'red' | null;
  status: string;
  created_at: string;
  discount_percent: number | null;
  segment?: {
    name: string;
    approval_level: number;
    approval_sla_hours: number;
    color: string;
  } | null;
}

interface ApprovalQueueProps {
  deals: Deal[];
  isLoading?: boolean;
}

export function ApprovalQueue({ deals, isLoading }: ApprovalQueueProps) {
  const navigate = useNavigate();
  const approveDeal = useApproveDeal();
  const rejectDeal = useRejectDeal();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const getClassificationColor = (classification: string | null) => {
    switch (classification) {
      case 'green': return 'bg-green-500 text-white';
      case 'yellow': return 'bg-amber-500 text-white';
      case 'red': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSLAStatus = (createdAt: string, slaHours: number) => {
    const created = new Date(createdAt);
    const deadline = new Date(created.getTime() + slaHours * 60 * 60 * 1000);
    const now = new Date();
    const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < 0) {
      return { status: 'overdue', label: 'Overdue', color: 'text-red-500 bg-red-500/10' };
    } else if (hoursRemaining < 2) {
      return { status: 'urgent', label: `${Math.ceil(hoursRemaining)}h left`, color: 'text-amber-500 bg-amber-500/10' };
    } else {
      return { status: 'ok', label: `${Math.ceil(hoursRemaining)}h left`, color: 'text-green-500 bg-green-500/10' };
    }
  };

  const filteredDeals = deals.filter((deal) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      deal.name.toLowerCase().includes(query) ||
      deal.customer_name.toLowerCase().includes(query)
    );
  });

  const handleAction = (deal: Deal, type: 'approve' | 'reject') => {
    setSelectedDeal(deal);
    setActionType(type);
    setNotes('');
  };

  const handleConfirmAction = async () => {
    if (!selectedDeal || !actionType) return;

    if (actionType === 'approve') {
      await approveDeal.mutateAsync({ dealId: selectedDeal.id, notes: notes || undefined });
    } else {
      if (!notes.trim()) {
        return; // Require reason for rejection
      }
      await rejectDeal.mutateAsync({ dealId: selectedDeal.id, reason: notes });
    }

    setSelectedDeal(null);
    setActionType(null);
    setNotes('');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Approval Queue
              </CardTitle>
              <CardDescription>
                {deals.length} {deals.length === 1 ? 'deal' : 'deals'} pending approval
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-green-600">All caught up!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No deals pending approval
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDeals.map((deal) => {
                const slaStatus = deal.segment 
                  ? getSLAStatus(deal.created_at, deal.segment.approval_sla_hours)
                  : null;

                return (
                  <div
                    key={deal.id}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-lg border',
                      'hover:bg-muted/50 transition-colors',
                      slaStatus?.status === 'overdue' && 'border-red-500/50 bg-red-500/5'
                    )}
                  >
                    {/* Score Badge */}
                    <div className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                      getClassificationColor(deal.classification)
                    )}>
                      <span className="text-lg font-bold">
                        {deal.total_score ? Math.round(deal.total_score) : '—'}
                      </span>
                    </div>

                    {/* Deal Info */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigate(`/deals/${deal.id}`)}
                    >
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{deal.name}</h4>
                        {deal.segment && (
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ borderColor: deal.segment.color, color: deal.segment.color }}
                          >
                            L{deal.segment.approval_level}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {deal.customer_name}
                      </p>
                    </div>

                    {/* Deal Value */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(deal.deal_value)}
                      </div>
                      {deal.discount_percent && deal.discount_percent > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {deal.discount_percent}% discount
                        </p>
                      )}
                    </div>

                    {/* SLA Status */}
                    {slaStatus && (
                      <Badge 
                        variant="outline" 
                        className={cn('shrink-0', slaStatus.color)}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {slaStatus.label}
                      </Badge>
                    )}

                    {/* Time in Queue */}
                    <div className="text-xs text-muted-foreground shrink-0 w-24 text-right">
                      {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-green-600 border-green-500/30 hover:bg-green-500/10"
                        onClick={() => handleAction(deal, 'approve')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-red-600 border-red-500/30 hover:bg-red-500/10"
                        onClick={() => handleAction(deal, 'reject')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8"
                        onClick={() => navigate(`/deals/${deal.id}`)}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={!!selectedDeal && !!actionType} onOpenChange={() => {
        setSelectedDeal(null);
        setActionType(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Approve Deal
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  Reject Deal
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedDeal?.name} - {selectedDeal?.customer_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
              <div>
                <p className="text-xs text-muted-foreground">Deal Value</p>
                <p className="font-medium">{selectedDeal && formatCurrency(selectedDeal.deal_value)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="font-medium">{selectedDeal?.total_score ? Math.round(selectedDeal.total_score) : '—'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {actionType === 'approve' ? 'Notes (optional)' : 'Rejection Reason (required)'}
              </label>
              <Textarea
                placeholder={actionType === 'approve' 
                  ? 'Add any notes about this approval...'
                  : 'Explain why this deal is being rejected...'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedDeal(null);
              setActionType(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={
                (actionType === 'reject' && !notes.trim()) ||
                approveDeal.isPending ||
                rejectDeal.isPending
              }
              className={actionType === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
            >
              {(approveDeal.isPending || rejectDeal.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
