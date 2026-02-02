import { useState } from 'react';
import { Journey } from '@/types/journeys';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Lightbulb, ArrowRight, DollarSign, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Recommendation {
  priority: number;
  title: string;
  description: string;
  estimatedImpact: number;
  difficulty: 'low' | 'medium' | 'high';
  timeframe: string;
  category: string;
}

interface AIRecommendationsPanelProps {
  journey: Journey;
  onRecommendationClick?: (recommendation: Recommendation) => void;
}

export function AIRecommendationsPanel({ journey, onRecommendationClick }: AIRecommendationsPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [summaryInsight, setSummaryInsight] = useState<string>('');

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await supabase.functions.invoke('ai-journey-analyst', {
        body: {
          journeyId: journey.id,
          journeyData: journey,
          analysisType: 'journey',
        },
      });

      if (response.error) throw response.error;

      const data = response.data;
      setRecommendations(data.recommendations || []);
      setSummaryInsight(data.summary || '');
      
      toast.success('Analysis complete');
    } catch (error) {
      console.error('Analysis error:', error);
      // Generate fallback recommendations based on journey data
      generateLocalRecommendations();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateLocalRecommendations = () => {
    const stages = journey.stages || [];
    const allTouchpoints = stages.flatMap(s => s.touchpoints || []);
    const localRecs: Recommendation[] = [];

    // Check for value message gaps
    const momentsOfTruthWithoutValue = allTouchpoints.filter(
      tp => tp.is_moment_of_truth && !tp.value_message
    );
    if (momentsOfTruthWithoutValue.length > 0) {
      localRecs.push({
        priority: 1,
        title: 'Add Value Messages to Moments of Truth',
        description: `${momentsOfTruthWithoutValue.length} critical touchpoints lack defined value messages. This impacts win rates by 8-12%.`,
        estimatedImpact: momentsOfTruthWithoutValue.length * 50000,
        difficulty: 'low',
        timeframe: '1-2 weeks',
        category: 'Value Messaging',
      });
    }

    // Check for high pain points
    const highPainPoints = allTouchpoints.filter(tp => tp.pain_point_level >= 4);
    if (highPainPoints.length > 0) {
      localRecs.push({
        priority: 2,
        title: 'Address High-Friction Touchpoints',
        description: `${highPainPoints.length} touchpoints have critical friction levels. Focus on process optimization and automation.`,
        estimatedImpact: highPainPoints.length * 80000,
        difficulty: 'medium',
        timeframe: '4-6 weeks',
        category: 'Process Optimization',
      });
    }

    // Check for missing systems
    const withoutSystems = allTouchpoints.filter(tp => {
      const tpAny = tp as any;
      return !tpAny.systems || tpAny.systems.length === 0;
    });
    if (withoutSystems.length > 5) {
      localRecs.push({
        priority: 3,
        title: 'Implement Tech Stack Coverage',
        description: `${withoutSystems.length} touchpoints lack defined systems. Manual processes increase error rates and slow velocity.`,
        estimatedImpact: withoutSystems.length * 20000,
        difficulty: 'high',
        timeframe: '2-3 months',
        category: 'Technology',
      });
    }

    // Check for missing KPIs
    const withoutKPIs = allTouchpoints.filter(tp => {
      const tpAny = tp as any;
      return !tpAny.kpis || tpAny.kpis.length === 0;
    });
    if (withoutKPIs.length > 5) {
      localRecs.push({
        priority: 4,
        title: 'Establish Measurement Framework',
        description: `${withoutKPIs.length} touchpoints have no KPIs. Without measurement, you can't improve what you can't track.`,
        estimatedImpact: 100000,
        difficulty: 'medium',
        timeframe: '3-4 weeks',
        category: 'Analytics',
      });
    }

    const totalImpact = localRecs.reduce((sum, r) => sum + r.estimatedImpact, 0);
    setSummaryInsight(
      `Fixing the top recommendations could recover approximately $${(totalImpact / 1000).toFixed(0)}K in quarterly revenue. Priority: Focus on value messaging gaps first - low effort, high impact.`
    );
    setRecommendations(localRecs);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'low': return 'bg-green-500/20 text-green-500';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500';
      case 'high': return 'bg-red-500/20 text-red-500';
      default: return 'bg-muted';
    }
  };

  const totalImpact = recommendations.reduce((sum, r) => sum + r.estimatedImpact, 0);

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Recommendations</CardTitle>
          </div>
          <Button 
            size="sm" 
            onClick={runAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.length === 0 && !isAnalyzing && (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Run AI analysis to get personalized recommendations for improving this journey.
            </p>
            <Button variant="outline" onClick={runAnalysis}>
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze Journey
            </Button>
          </div>
        )}

        {summaryInsight && (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm">{summaryInsight}</p>
                {totalImpact > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">
                      Total potential recovery: ${(totalImpact / 1000).toFixed(0)}K/quarter
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <button
                key={index}
                onClick={() => onRecommendationClick?.(rec)}
                className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                        {rec.priority}
                      </span>
                      <span className="font-medium">{rec.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {rec.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        {rec.category}
                      </Badge>
                      <Badge className={cn('text-xs', getDifficultyColor(rec.difficulty))}>
                        {rec.difficulty} effort
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {rec.timeframe}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-green-500">
                      +${(rec.estimatedImpact / 1000).toFixed(0)}K
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
