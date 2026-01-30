import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2, RefreshCw, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import type { Deal } from '@/types/deals';

interface AICoachPanelProps {
  deal: Deal;
}

export function AICoachPanel({ deal }: AICoachPanelProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('ai-deal-coach', {
        body: { dealId: deal.id, action: 'analyze' },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to get AI analysis');
      }

      setAnalysis(response.data.analysis);
    } catch (err) {
      console.error('AI Coach error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get AI analysis');
      toast.error('Failed to get AI analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAnalysis = (text: string) => {
    // Convert markdown-style formatting to JSX
    return text.split('\n').map((line, i) => {
      // Headers
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h4 key={i} className="font-bold mt-4 mb-2 text-foreground">
            {line.replace(/\*\*/g, '')}
          </h4>
        );
      }
      // Bold inline
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.+?)\*\*/g);
        return (
          <p key={i} className="mb-1">
            {parts.map((part, j) => 
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
          </p>
        );
      }
      // Bullet points
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <li key={i} className="ml-4 mb-1">
            {line.substring(2)}
          </li>
        );
      }
      // Numbered items
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={i} className="ml-4 mb-1 list-decimal">
            {line.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      // Regular text
      if (line.trim()) {
        return <p key={i} className="mb-2 text-muted-foreground">{line}</p>;
      }
      return null;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          AI Deal Coach
        </CardTitle>
        <CardDescription>
          Get AI-powered insights and recommendations for this deal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Ready to Analyze</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get AI-powered recommendations to improve this deal's score and increase your chances of winning.
            </p>
            <Button onClick={getAnalysis} className="bg-accent hover:bg-accent/90">
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Deal
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
            <p className="text-sm text-muted-foreground">Analyzing deal...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="font-medium mb-2">Analysis Failed</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={getAnalysis} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Analysis Complete
              </Badge>
              <Button onClick={getAnalysis} variant="ghost" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {formatAnalysis(analysis)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
