import { useState } from 'react';
import { Journey, JourneyStage, JourneyTouchpoint } from '@/types/journeys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  Star,
  Layers,
  BarChart3,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { StageHealthBar } from './StageHealthBar';
import { FrictionPointsPanel } from './FrictionPointsPanel';
import { AIRecommendationsPanel } from './AIRecommendationsPanel';
import { TouchpointComparisonSheet } from './TouchpointComparisonSheet';
import { StageCard } from '../blueprint/StageCard';
import { cn } from '@/lib/utils';

interface JourneyIntelligenceDashboardProps {
  journey: Journey;
  onEditTouchpoint?: (touchpoint: JourneyTouchpoint, stageId: string) => void;
}

function calculateJourneyScore(journey: Journey): number {
  const stages = journey.stages || [];
  const allTouchpoints = stages.flatMap(s => s.touchpoints || []);
  
  if (allTouchpoints.length === 0) return 0;

  let score = 100;
  
  allTouchpoints.forEach(tp => {
    const tpAny = tp as any;
    
    // Deduct for high pain points
    if (tp.pain_point_level >= 4) score -= 3;
    else if (tp.pain_point_level >= 3) score -= 1;
    
    // Deduct for missing value messages (especially on MOT)
    if (tp.is_moment_of_truth && !tp.value_message) score -= 4;
    else if (!tp.value_message) score -= 1;
    
    // Deduct for missing systems/kpis
    if (!tpAny.systems || tpAny.systems.length === 0) score -= 1;
    if (!tpAny.kpis || tpAny.kpis.length === 0) score -= 1;
    
    // Deduct for missing owner
    if (!tp.owner_role) score -= 0.5;
  });

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getScoreGrade(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Optimized', color: 'text-green-500' };
  if (score >= 60) return { label: 'Needs Attention', color: 'text-yellow-500' };
  if (score >= 40) return { label: 'Underperforming', color: 'text-orange-500' };
  return { label: 'Critical', color: 'text-red-500' };
}

export function JourneyIntelligenceDashboard({ 
  journey, 
  onEditTouchpoint 
}: JourneyIntelligenceDashboardProps) {
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [selectedTouchpoint, setSelectedTouchpoint] = useState<JourneyTouchpoint | null>(null);
  const [selectedStage, setSelectedStage] = useState<JourneyStage | null>(null);
  const [showAllStages, setShowAllStages] = useState(false);

  const stages = journey.stages || [];
  const allTouchpoints = stages.flatMap(s => s.touchpoints || []);
  
  const journeyScore = calculateJourneyScore(journey);
  const grade = getScoreGrade(journeyScore);
  const momentsOfTruth = allTouchpoints.filter(t => t.is_moment_of_truth).length;
  const highPainPoints = allTouchpoints.filter(t => t.pain_point_level >= 4).length;
  const valueMessageGaps = allTouchpoints.filter(t => t.is_moment_of_truth && !t.value_message).length;

  const handleTouchpointClick = (touchpoint: JourneyTouchpoint, stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    setSelectedTouchpoint(touchpoint);
    setSelectedStage(stage || null);
  };

  const handleEditFromSheet = (touchpoint: JourneyTouchpoint) => {
    if (selectedStage && onEditTouchpoint) {
      onEditTouchpoint(touchpoint, selectedStage.id);
      setSelectedTouchpoint(null);
    }
  };

  const displayedStages = showAllStages ? stages : stages.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Health Score Header */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Main Score */}
        <Card className="md:col-span-2 bg-gradient-to-br from-card to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Journey Intelligence Score
                </p>
                <div className="flex items-baseline gap-2">
                  <span className={cn('text-5xl font-bold', grade.color)}>
                    {journeyScore}
                  </span>
                  <span className="text-lg text-muted-foreground">/100</span>
                </div>
                <Badge variant="outline" className={cn('mt-2', grade.color)}>
                  {grade.label}
                </Badge>
              </div>
              <div className="h-24 w-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                <TrendingUp className={cn('h-10 w-10', grade.color)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardContent className="p-4 flex flex-col justify-center h-full">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Layers className="h-4 w-4" />
              <span className="text-xs font-medium">Stages / Touchpoints</span>
            </div>
            <p className="text-2xl font-bold">{stages.length} / {allTouchpoints.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col justify-center h-full">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-medium">Moments of Truth</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-yellow-500">{momentsOfTruth}</p>
              {valueMessageGaps > 0 && (
                <span className="text-xs text-red-500">({valueMessageGaps} missing value msg)</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col justify-center h-full">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium">High Friction Points</span>
            </div>
            <p className={cn('text-2xl font-bold', highPainPoints > 0 ? 'text-red-500' : 'text-green-500')}>
              {highPainPoints}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stage Health Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Stage Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StageHealthBar 
            stages={stages} 
            onStageClick={setSelectedStageId}
            selectedStageId={selectedStageId || undefined}
          />
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="friction" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friction" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Friction Analysis
          </TabsTrigger>
          <TabsTrigger value="stages" className="gap-2">
            <Layers className="h-4 w-4" />
            Stage Details
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friction" className="mt-4">
          <FrictionPointsPanel 
            journey={journey}
            onTouchpointClick={handleTouchpointClick}
          />
        </TabsContent>

        <TabsContent value="stages" className="mt-4 space-y-4">
          {displayedStages.map((stage, index) => (
            <StageCard
              key={stage.id}
              stage={stage}
              index={index}
              defaultOpen={selectedStageId === stage.id || index === 0}
              onTouchpointClick={(tp) => handleTouchpointClick(tp, stage.id)}
            />
          ))}
          
          {stages.length > 4 && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowAllStages(!showAllStages)}
            >
              {showAllStages ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show All {stages.length} Stages
                </>
              )}
            </Button>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4">
          <AIRecommendationsPanel journey={journey} />
        </TabsContent>
      </Tabs>

      {/* Touchpoint Comparison Sheet */}
      <TouchpointComparisonSheet
        touchpoint={selectedTouchpoint}
        stage={selectedStage}
        open={!!selectedTouchpoint}
        onOpenChange={(open) => !open && setSelectedTouchpoint(null)}
        onEdit={handleEditFromSheet}
      />
    </div>
  );
}
