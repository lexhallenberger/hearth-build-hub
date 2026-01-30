import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useRequestApproval, useDealApprovals, useRespondToApproval, useEscalateApproval } from '@/hooks/useApprovals';
import { useAuth } from '@/contexts/AuthContext';
import { Deal, DealApproval, CLASSIFICATION_COLORS, CLASSIFICATION_LABELS } from '@/types/deals';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle, ArrowUpCircle, Clock, Loader2, Send } from 'lucide-react';

interface DealApprovalPanelProps {
  deal: Deal;
}

const APPROVAL_STATUS_COLORS = {
  pending: 'bg-warning/20 text-warning',
  approved: 'bg-success/20 text-success',
  rejected: 'bg-destructive/20 text-destructive',
  escalated: 'bg-accent/20 text-accent',
};

const APPROVAL_STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  escalated: 'Escalated',
};

export function DealApprovalPanel({ deal }: DealApprovalPanelProps) {
  const { user, hasAnyRole } = useAuth();
  const { data: approvals, isLoading } = useDealApprovals(deal.id);
  const requestApproval = useRequestApproval();
  const respondToApproval = useRespondToApproval();
  const escalateApproval = useEscalateApproval();

  const [requestNotes, setRequestNotes] = useState('');
  const [responseNotes, setResponseNotes] = useState('');

  const canApprove = hasAnyRole(['admin', 'deal_desk', 'executive', 'finance']);
  const pendingApproval = approvals?.find(
    (a) => a.status === 'pending' && (a.assigned_to === user?.id || canApprove)
  );
  const isOwner = deal.owner_id === user?.id;

  const handleRequestApproval = async () => {
    await requestApproval.mutateAsync({
      dealId: deal.id,
      notes: requestNotes || undefined,
    });
    setRequestNotes('');
  };

  const handleApprove = async () => {
    if (!pendingApproval) return;
    await respondToApproval.mutateAsync({
      approvalId: pendingApproval.id,
      dealId: deal.id,
      approved: true,
      notes: responseNotes || undefined,
    });
    setResponseNotes('');
  };

  const handleReject = async () => {
    if (!pendingApproval) return;
    await respondToApproval.mutateAsync({
      approvalId: pendingApproval.id,
      dealId: deal.id,
      approved: false,
      notes: responseNotes || undefined,
    });
    setResponseNotes('');
  };

  const handleEscalate = async () => {
    if (!pendingApproval) return;
    await escalateApproval.mutateAsync({
      approvalId: pendingApproval.id,
      dealId: deal.id,
      notes: responseNotes || undefined,
    });
    setResponseNotes('');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Workflow</CardTitle>
        <CardDescription>
          {deal.classification === 'green'
            ? 'Green deals may be auto-approved'
            : deal.classification === 'yellow'
            ? 'Yellow deals require standard approval'
            : 'Red deals require executive approval'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        {deal.classification && (
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className="flex-1">
              <p className="text-sm font-medium">Deal Classification</p>
              <p className="text-xs text-muted-foreground">Based on scoring results</p>
            </div>
            <Badge className={CLASSIFICATION_COLORS[deal.classification]}>
              {CLASSIFICATION_LABELS[deal.classification]}
            </Badge>
          </div>
        )}

        {/* Request Approval Section */}
        {isOwner && deal.status === 'draft' && deal.classification && (
          <div className="space-y-3">
            <Textarea
              placeholder="Add notes for the approver (optional)..."
              value={requestNotes}
              onChange={(e) => setRequestNotes(e.target.value)}
              className="min-h-[60px]"
            />
            <Button
              onClick={handleRequestApproval}
              disabled={requestApproval.isPending}
              className="w-full bg-accent hover:bg-accent/90"
            >
              {requestApproval.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              Submit for Approval
            </Button>
          </div>
        )}

        {/* Pending Approval Actions */}
        {pendingApproval && canApprove && (
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Approval Required</span>
            </div>

            {pendingApproval.request_notes && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                <p className="font-medium text-foreground mb-1">Request Notes:</p>
                {pendingApproval.request_notes}
              </div>
            )}

            <Textarea
              placeholder="Response notes (optional)..."
              value={responseNotes}
              onChange={(e) => setResponseNotes(e.target.value)}
              className="min-h-[60px]"
            />

            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={respondToApproval.isPending}
                className="flex-1 bg-success hover:bg-success/90"
              >
                {respondToApproval.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                onClick={handleReject}
                disabled={respondToApproval.isPending}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={handleEscalate}
                disabled={escalateApproval.isPending}
                variant="outline"
              >
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Escalate
              </Button>
            </div>
          </div>
        )}

        {/* Approval History */}
        {approvals && approvals.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Approval History</h4>
            <div className="space-y-2">
              {approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={APPROVAL_STATUS_COLORS[approval.status]}>
                        {APPROVAL_STATUS_LABELS[approval.status]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Level {approval.approval_level}
                      </span>
                    </div>
                    {approval.response_notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {approval.response_notes}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(approval.requested_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
