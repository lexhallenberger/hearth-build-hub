import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useSaveDealScore, useCalculateDealScore } from '@/hooks/useDeals';
import { ScoringAttribute, DealScore, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/deals';
import { Loader2 } from 'lucide-react';

interface DealScoringProps {
  dealId: string;
  scores: (DealScore & { attribute: ScoringAttribute })[];
  attributes: ScoringAttribute[];
}

export function DealScoring({ dealId, scores, attributes }: DealScoringProps) {
  const saveDealScore = useSaveDealScore();
  const calculateScore = useCalculateDealScore();
  const [localValues, setLocalValues] = useState<Record<string, number>>({});

  const getScoreForAttribute = (attributeId: string) => {
    if (localValues[attributeId] !== undefined) {
      return localValues[attributeId];
    }
    const existingScore = scores.find((s) => s.attribute_id === attributeId);
    return existingScore?.raw_value ?? null;
  };

  const normalizeScore = (value: number, attr: ScoringAttribute): number => {
    const range = attr.max_value - attr.min_value;
    if (range === 0) return 50;

    let normalized = ((value - attr.min_value) / range) * 100;

    // If lower is better (e.g., discount), invert the score
    if (!attr.higher_is_better) {
      normalized = 100 - normalized;
    }

    return Math.max(0, Math.min(100, normalized));
  };

  const handleScoreChange = async (attr: ScoringAttribute, value: number) => {
    setLocalValues((prev) => ({ ...prev, [attr.id]: value }));

    const normalizedScore = normalizeScore(value, attr);

    await saveDealScore.mutateAsync({
      deal_id: dealId,
      attribute_id: attr.id,
      raw_value: value,
      normalized_score: normalizedScore,
    });

    // Recalculate total score
    await calculateScore.mutateAsync(dealId);
  };

  // Group attributes by category
  const groupedAttributes = attributes.reduce(
    (acc, attr) => {
      if (!acc[attr.category]) {
        acc[attr.category] = [];
      }
      acc[attr.category].push(attr);
      return acc;
    },
    {} as Record<string, ScoringAttribute[]>
  );

  return (
    <div className="space-y-6">
      {Object.entries(groupedAttributes).map(([category, attrs]) => (
        <Card key={category}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}>
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
              </Badge>
              <CardTitle className="text-lg">
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]} Attributes
              </CardTitle>
            </div>
            <CardDescription>
              Score each attribute to calculate the deal's overall score
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {attrs.map((attr) => {
              const currentValue = getScoreForAttribute(attr.id);
              const existingScore = scores.find((s) => s.attribute_id === attr.id);
              const isScored = existingScore !== undefined;

              return (
                <div key={attr.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">{attr.name}</Label>
                      {attr.description && (
                        <p className="text-xs text-muted-foreground">{attr.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Weight: {attr.weight}%</span>
                      {isScored && (
                        <Badge variant="outline" className="text-xs">
                          Score: {Math.round(existingScore.normalized_score)}
                        </Badge>
                      )}
                      {saveDealScore.isPending && localValues[attr.id] !== undefined && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-16">
                      {attr.min_value}
                    </span>
                    <Slider
                      value={[currentValue ?? attr.min_value]}
                      min={attr.min_value}
                      max={attr.max_value}
                      step={attr.max_value > 10 ? 1 : 0.5}
                      onValueChange={([value]) => handleScoreChange(attr, value)}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {attr.max_value}
                    </span>
                    <Input
                      type="number"
                      value={currentValue ?? ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value >= attr.min_value && value <= attr.max_value) {
                          handleScoreChange(attr, value);
                        }
                      }}
                      className="w-20 text-center"
                      min={attr.min_value}
                      max={attr.max_value}
                      step={attr.max_value > 10 ? 1 : 0.5}
                    />
                  </div>

                  {!attr.higher_is_better && (
                    <p className="text-xs text-muted-foreground italic">
                      * Lower values are better for this attribute
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
