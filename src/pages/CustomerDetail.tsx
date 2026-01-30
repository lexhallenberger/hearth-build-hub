import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useCustomer, useCustomerHealthScores, useCustomerRenewals, useAddHealthScore } from '@/hooks/useCustomers';
import { CustomerFormDialog } from '@/components/customers/CustomerFormDialog';
import { CustomerHealthCard } from '@/components/customers/CustomerHealthCard';
import { HealthScoreHistory } from '@/components/customers/HealthScoreHistory';
import { RenewalFormDialog } from '@/components/customers/RenewalFormDialog';
import { 
  ArrowLeft, Loader2, Building2, Calendar, DollarSign, 
  Mail, User, Edit, Plus, AlertCircle, RefreshCw
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { 
  TIER_LABELS, TIER_COLORS, 
  HEALTH_STATUS_LABELS, HEALTH_STATUS_COLORS,
  RENEWAL_STATUS_LABELS, RENEWAL_STATUS_COLORS
} from '@/types/customers';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading: customerLoading } = useCustomer(id);
  const { data: healthScores = [] } = useCustomerHealthScores(id);
  const { data: renewals = [] } = useCustomerRenewals(id);
  const addHealthScore = useAddHealthScore();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [renewalDialogOpen, setRenewalDialogOpen] = useState(false);
  const [newHealthScore, setNewHealthScore] = useState(50);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleAddHealthScore = async () => {
    if (!id) return;
    await addHealthScore.mutateAsync({
      customerId: id,
      score: newHealthScore,
      indicators: {
        engagement: Math.random() * 100,
        support_tickets: Math.random() * 100,
        usage: Math.random() * 100,
        nps: Math.random() * 100,
      },
    });
  };

  if (customerLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium">Customer not found</h2>
        <Button className="mt-4" onClick={() => navigate('/customers')}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const daysUntilRenewal = customer.contract_end_date 
    ? differenceInDays(new Date(customer.contract_end_date), new Date())
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
                <Badge className={TIER_COLORS[customer.tier]}>
                  {TIER_LABELS[customer.tier]}
                </Badge>
                <Badge className={HEALTH_STATUS_COLORS[customer.health_status]}>
                  {HEALTH_STATUS_LABELS[customer.health_status]}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {customer.industry || 'Industry not specified'} • {formatCurrency(customer.arr)} ARR
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <CustomerHealthCard customer={customer} recentScores={healthScores} />
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(customer.mrr)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(customer.arr)} annually
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contract Period</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.contract_start_date && customer.contract_end_date ? (
              <>
                <div className="text-lg font-medium">
                  {format(new Date(customer.contract_start_date), 'MMM yyyy')} - {format(new Date(customer.contract_end_date), 'MMM yyyy')}
                </div>
                {daysUntilRenewal !== null && (
                  <p className={`text-xs mt-1 ${daysUntilRenewal <= 30 ? 'text-red-500' : daysUntilRenewal <= 90 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                    {daysUntilRenewal > 0 ? `${daysUntilRenewal} days until renewal` : 'Contract expired'}
                  </p>
                )}
              </>
            ) : (
              <div className="text-muted-foreground">Not specified</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Primary Contact</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.primary_contact_name ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{customer.primary_contact_name}</span>
                </div>
                {customer.primary_contact_email && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{customer.primary_contact_email}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-muted-foreground">Not specified</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="health" className="space-y-6">
        <TabsList>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="renewals">Renewals ({renewals.length})</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <HealthScoreHistory scores={healthScores} />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Record Health Score</CardTitle>
                <CardDescription>Manually record a new health score for this customer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Health Score</span>
                    <span className={`font-bold ${
                      newHealthScore >= 70 ? 'text-green-500' : 
                      newHealthScore >= 40 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {newHealthScore}
                    </span>
                  </div>
                  <Slider
                    value={[newHealthScore]}
                    onValueChange={([value]) => setNewHealthScore(value)}
                    min={0}
                    max={100}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Critical</span>
                    <span>At Risk</span>
                    <span>Healthy</span>
                  </div>
                </div>
                <Button 
                  onClick={handleAddHealthScore} 
                  disabled={addHealthScore.isPending}
                  className="w-full"
                >
                  {addHealthScore.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Record Score
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="renewals" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setRenewalDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Renewal
            </Button>
          </div>
          
          {renewals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No renewals</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Track renewal opportunities for this customer
                </p>
                <Button onClick={() => setRenewalDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Renewal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {renewals.map((renewal) => (
                <Card key={renewal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(renewal.renewal_date), 'MMMM d, yyyy')}
                          </span>
                          <Badge className={RENEWAL_STATUS_COLORS[renewal.status]}>
                            {RENEWAL_STATUS_LABELS[renewal.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Current: {formatCurrency(renewal.current_value)} → Proposed: {formatCurrency(renewal.proposed_value)}
                        </p>
                      </div>
                      <Badge variant={renewal.risk_level === 'high' ? 'destructive' : renewal.risk_level === 'medium' ? 'secondary' : 'outline'}>
                        {renewal.risk_level} risk
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-muted-foreground">Company Name</label>
                  <p className="font-medium">{customer.name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Industry</label>
                  <p className="font-medium">{customer.industry || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Tier</label>
                  <p className="font-medium">{TIER_LABELS[customer.tier]}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">MRR</label>
                  <p className="font-medium">{formatCurrency(customer.mrr)}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Contract Start</label>
                  <p className="font-medium">
                    {customer.contract_start_date 
                      ? format(new Date(customer.contract_start_date), 'MMMM d, yyyy')
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Contract End</label>
                  <p className="font-medium">
                    {customer.contract_end_date 
                      ? format(new Date(customer.contract_end_date), 'MMMM d, yyyy')
                      : 'Not specified'}
                  </p>
                </div>
              </div>
              
              {customer.notes && (
                <div>
                  <label className="text-sm text-muted-foreground">Notes</label>
                  <p className="font-medium whitespace-pre-wrap">{customer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CustomerFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        customer={customer}
      />
      
      <RenewalFormDialog
        open={renewalDialogOpen}
        onOpenChange={setRenewalDialogOpen}
        customerId={id}
      />
    </div>
  );
}
