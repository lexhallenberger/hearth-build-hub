import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Deal, STATUS_LABELS } from '@/types/deals';
import { Calendar, DollarSign, Percent, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface DealInfoProps {
  deal: Deal;
}

export function DealInfo({ deal }: DealInfoProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPaymentTerms = (terms: string | null) => {
    if (!terms) return 'Not specified';
    const labels: Record<string, string> = {
      net_30: 'Net 30',
      net_60: 'Net 60',
      net_90: 'Net 90',
      annual_upfront: 'Annual Upfront',
      quarterly: 'Quarterly',
      monthly: 'Monthly',
    };
    return labels[terms] || terms;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Deal Information</CardTitle>
          <CardDescription>Basic details about this deal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Customer</p>
              <p className="text-sm text-muted-foreground">{deal.customer_name}</p>
            </div>
          </div>

          {deal.description && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground">{deal.description}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Expected Close Date</p>
              <p className="text-sm text-muted-foreground">
                {deal.expected_close_date
                  ? format(new Date(deal.expected_close_date), 'MMMM d, yyyy')
                  : 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(deal.created_at), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Terms</CardTitle>
          <CardDescription>Contract and payment details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Deal Value</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(deal.deal_value)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Percent className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Discount</p>
              <p className="text-sm text-muted-foreground">{deal.discount_percent}%</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Payment Terms</p>
              <p className="text-sm text-muted-foreground">
                {formatPaymentTerms(deal.payment_terms)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Contract Length</p>
              <p className="text-sm text-muted-foreground">{deal.contract_length_months} months</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
