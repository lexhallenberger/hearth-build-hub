import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, AlertTriangle, Lightbulb, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Deal } from '@/types/deals';
import { RiskAlerts } from '@/components/ai-coach/RiskAlerts';
import { RecommendationCards } from '@/components/ai-coach/RecommendationCards';
import { DealAdvisorChat } from '@/components/ai-coach/DealAdvisorChat';

interface AICoachPanelProps {
  deal: Deal;
}

interface RiskFactor {
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
}

interface Recommendation {
  priority: number;
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

interface ScoreOptimization {
  current: number;
  potential: number;
  actions: string[];
}

export function AICoachPanel({ deal }: AICoachPanelProps) {
  const [risks, setRisks] = useState<RiskFactor[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [scoreOptimization, setScoreOptimization] = useState<ScoreOptimization>({
    current: 0,
    potential: 0,
    actions: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuickAnalysis();
  }, [deal.id]);

  const loadQuickAnalysis = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-deal-coach', {
        body: { dealId: deal.id, action: 'quick-analysis' },
      });

      if (error) throw error;

      setRisks(data.risks || []);
      setRecommendations(data.recommendations || []);
      setScoreOptimization(data.scoreOptimization || { current: 0, potential: 0, actions: [] });
    } catch (err) {
      console.error('Quick analysis error:', err);
      toast.error('Failed to load deal analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const highRiskCount = risks.filter(r => r.severity === 'high').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">AI Deal Coach</h2>
          <p className="text-sm text-muted-foreground">
            Intelligent analysis and recommendations for {deal.name}
          </p>
        </div>
      </div>

      <Tabs defaultValue="risks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="risks" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risks
            {highRiskCount > 0 && (
              <span className="ml-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                {highRiskCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="risks">
          <RiskAlerts risks={risks} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="recommendations">
          <RecommendationCards 
            recommendations={recommendations}
            scoreOptimization={scoreOptimization}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="chat">
          <DealAdvisorChat dealId={deal.id} dealName={deal.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
