import { useParams, useNavigate } from 'react-router-dom';
import { useDeal, useDealScores, useDealNotes, useScoringAttributes, useCalculateDealScore, useUpdateDeal } from '@/hooks/useDeals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Calculator, CheckCircle, AlertCircle, Map } from 'lucide-react';
import { DealScoring } from '@/components/deals/DealScoring';
import { DealScoreChart } from '@/components/deals/DealScoreChart';
import { DealScoreRadar } from '@/components/deal-governance/DealScoreRadar';
import { DealInfo } from '@/components/deals/DealInfo';
import { DealActivity } from '@/components/deals/DealActivity';
import { DealApprovalPanel } from '@/components/deals/DealApprovalPanel';
import { AICoachPanel } from '@/components/deals/AICoachPanel';
import { DealJourneyMapper } from '@/components/deals/DealJourneyMapper';
import { TouchpointSuggestions } from '@/components/deals/TouchpointSuggestions';
import { CrossJourneyPanel } from '@/components/deals/CrossJourneyPanel';
import { STATUS_LABELS, STATUS_COLORS, CLASSIFICATION_COLORS, CLASSIFICATION_LABELS } from '@/types/deals';
import { useQueryClient } from '@tanstack/react-query';

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: deal, isLoading: dealLoading } = useDeal(id);
  const { data: scores, isLoading: scoresLoading } = useDealScores(id);
  const { data: notes } = useDealNotes(id);
  const { data: attributes } = useScoringAttributes();
  const calculateScore = useCalculateDealScore();
  const updateDeal = useUpdateDeal();

  if (dealLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium">Deal not found</h2>
        <Button className="mt-4" onClick={() => navigate('/deals')}>
          Back to Deals
        </Button>
      </div>
    );
  }

  const handleCalculateScore = async () => {
    await calculateScore.mutateAsync(deal.id);
  };

  const handleSubmitForApproval = async () => {
    await updateDeal.mutateAsync({
      id: deal.id,
      status: 'pending_approval',
    });
  };

  const handleJourneyUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['deals', id] });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const scoredCount = scores?.length || 0;
  const totalAttributes = attributes?.length || 0;
  const scoringComplete = scoredCount === totalAttributes && totalAttributes > 0;

  // Get journey data from deal (using type assertion for new fields)
  const dealWithJourney = deal as typeof deal & { 
    journey_stage_id?: string | null; 
    touchpoint_ids?: string[];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/deals')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{deal.name}</h1>
              <Badge className={STATUS_COLORS[deal.status]}>{STATUS_LABELS[deal.status]}</Badge>
              {deal.classification && (
                <Badge className={CLASSIFICATION_COLORS[deal.classification]}>
                  {CLASSIFICATION_LABELS[deal.classification]} - {Math.round(deal.total_score || 0)}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {deal.customer_name} • {formatCurrency(deal.deal_value)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {deal.status === 'draft' && (
            <Button
              onClick={handleCalculateScore}
              disabled={calculateScore.isPending || !scoringComplete}
              variant="outline"
            >
              {calculateScore.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Score
            </Button>
          )}
          {deal.status === 'pending_score' && deal.classification && (
            <Button
              onClick={handleSubmitForApproval}
              disabled={updateDeal.isPending}
              className="bg-accent hover:bg-accent/90"
            >
              {updateDeal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CheckCircle className="mr-2 h-4 w-4" />
              Submit for Approval
            </Button>
          )}
        </div>
      </div>

      {/* Score Overview */}
      {deal.total_score !== null && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(deal.total_score)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Classification
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deal.classification && (
                <Badge className={`${CLASSIFICATION_COLORS[deal.classification]} text-lg px-3 py-1`}>
                  {CLASSIFICATION_LABELS[deal.classification]}
                </Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Discount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{deal.discount_percent}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contract Length
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{deal.contract_length_months} mo</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="scoring" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scoring">
            Scoring ({scoredCount}/{totalAttributes})
          </TabsTrigger>
          <TabsTrigger value="journey" className="flex items-center gap-1">
            <Map className="h-3.5 w-3.5" />
            Journey
          </TabsTrigger>
          <TabsTrigger value="ai-coach">AI Coach</TabsTrigger>
          <TabsTrigger value="approval">Approval</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="scoring" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <DealScoring dealId={deal.id} scores={scores || []} attributes={attributes || []} />
            </div>
            <div>
              <DealScoreRadar 
                scores={scores || []} 
                attributes={attributes || []} 
                dealClassification={deal.classification}
                totalScore={deal.total_score}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="journey" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <DealJourneyMapper 
                dealId={deal.id}
                currentStageId={dealWithJourney.journey_stage_id || null}
                touchpointIds={dealWithJourney.touchpoint_ids || []}
                onUpdate={handleJourneyUpdate}
              />
              <TouchpointSuggestions
                dealId={deal.id}
                currentStageId={dealWithJourney.journey_stage_id || null}
                completedTouchpointIds={dealWithJourney.touchpoint_ids || []}
              />
            </div>
            <div>
              <CrossJourneyPanel
                dealId={deal.id}
                customerName={deal.customer_name}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai-coach">
          <AICoachPanel deal={deal} />
        </TabsContent>

        <TabsContent value="approval">
          <DealApprovalPanel deal={deal} />
        </TabsContent>

        <TabsContent value="details">
          <DealInfo deal={deal} />
        </TabsContent>

        <TabsContent value="activity">
          <DealActivity dealId={deal.id} notes={notes || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
