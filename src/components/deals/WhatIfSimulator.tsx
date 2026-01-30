import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  ChevronRight,
  Target,
  DollarSign,
  Clock,
  Percent,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from '@/components/animations/AnimatedCounter';

interface WhatIfSimulatorProps {
  initialDiscount?: number;
  initialContractLength?: number;
  initialDealValue?: number;
  initialScore?: number;
  onApplyChanges?: (changes: { discount: number; contractLength: number; dealValue: number }) => void;
}

export function WhatIfSimulator({
  initialDiscount = 20,
  initialContractLength = 12,
  initialDealValue = 100000,
  initialScore = 55,
  onApplyChanges,
}: WhatIfSimulatorProps) {
  const [discount, setDiscount] = useState(initialDiscount);
  const [contractLength, setContractLength] = useState(initialContractLength);
  const [dealValue, setDealValue] = useState(initialDealValue);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate simulated score based on changes
  const simulatedScore = useMemo(() => {
    let score = initialScore;
    
    // Discount impact: lower discount = higher score
    const discountDelta = initialDiscount - discount;
    score += discountDelta * 0.8; // Each 1% discount reduction adds 0.8 points
    
    // Contract length impact: longer contract = higher score
    const contractDelta = contractLength - initialContractLength;
    score += contractDelta * 0.5; // Each month adds 0.5 points
    
    // Deal value impact: higher value = slightly higher score (diminishing returns)
    const valueDelta = (dealValue - initialDealValue) / initialDealValue;
    score += valueDelta * 10; // 10% increase adds 1 point
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }, [discount, contractLength, dealValue, initialDiscount, initialContractLength, initialDealValue, initialScore]);

  // Determine classification
  const getClassification = (score: number) => {
    if (score >= 70) return 'green';
    if (score >= 40) return 'yellow';
    return 'red';
  };

  const currentClassification = getClassification(initialScore);
  const simulatedClassification = getClassification(simulatedScore);
  const classificationImproved = 
    (simulatedClassification === 'green' && currentClassification !== 'green') ||
    (simulatedClassification === 'yellow' && currentClassification === 'red');

  // Calculate improvement suggestions
  const suggestions = useMemo(() => {
    const items = [];
    
    if (discount > 15 && simulatedScore < 70) {
      const targetDiscount = Math.max(10, discount - Math.ceil((70 - simulatedScore) / 0.8));
      items.push({
        icon: Percent,
        text: `Reduce discount to ${targetDiscount}% to reach Green zone`,
        impact: '+' + Math.round((discount - targetDiscount) * 0.8),
      });
    }
    
    if (contractLength < 24 && simulatedScore < 70) {
      const additionalMonths = Math.min(24, Math.ceil((70 - simulatedScore) / 0.5));
      items.push({
        icon: Clock,
        text: `Extend contract to ${contractLength + additionalMonths} months`,
        impact: '+' + Math.round(additionalMonths * 0.5),
      });
    }
    
    if (dealValue < initialDealValue * 1.2 && simulatedScore < 70) {
      items.push({
        icon: DollarSign,
        text: `Increase deal value by 20% for better score`,
        impact: '+2',
      });
    }
    
    return items;
  }, [discount, contractLength, dealValue, simulatedScore, initialDealValue]);

  const handleApply = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      onApplyChanges?.({ discount, contractLength, dealValue });
    }, 500);
  };

  const hasChanges = 
    discount !== initialDiscount || 
    contractLength !== initialContractLength || 
    dealValue !== initialDealValue;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      isAnimating && "scale-[1.02] shadow-2xl"
    )}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30">
              <Calculator className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">What-If Simulator</CardTitle>
              <CardDescription>Adjust parameters to see score impact</CardDescription>
            </div>
          </div>
          {hasChanges && (
            <Button onClick={handleApply} size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Apply Changes
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-6">
        {/* Score Comparison */}
        <div className="flex items-center justify-center gap-8 p-4 rounded-xl bg-muted/50">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Current Score</div>
            <div className={cn(
              "text-3xl font-bold",
              currentClassification === 'green' && 'text-success',
              currentClassification === 'yellow' && 'text-warning',
              currentClassification === 'red' && 'text-destructive',
            )}>
              {initialScore}
            </div>
            <Badge variant="outline" className={cn(
              "mt-2",
              currentClassification === 'green' && 'bg-success/20 text-success border-success/30',
              currentClassification === 'yellow' && 'bg-warning/20 text-warning border-warning/30',
              currentClassification === 'red' && 'bg-destructive/20 text-destructive border-destructive/30',
            )}>
              {currentClassification.toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <ChevronRight className={cn(
              "h-8 w-8 transition-colors",
              classificationImproved ? 'text-success' : 'text-muted-foreground'
            )} />
            {simulatedScore > initialScore ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : simulatedScore < initialScore ? (
              <TrendingDown className="h-4 w-4 text-destructive" />
            ) : null}
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Simulated Score</div>
            <div className={cn(
              "text-3xl font-bold transition-all",
              simulatedClassification === 'green' && 'text-success',
              simulatedClassification === 'yellow' && 'text-warning',
              simulatedClassification === 'red' && 'text-destructive',
              classificationImproved && 'animate-pulse'
            )}>
              <AnimatedCounter value={simulatedScore} duration={300} />
            </div>
            <Badge variant="outline" className={cn(
              "mt-2 transition-all",
              simulatedClassification === 'green' && 'bg-success/20 text-success border-success/30',
              simulatedClassification === 'yellow' && 'bg-warning/20 text-warning border-warning/30',
              simulatedClassification === 'red' && 'bg-destructive/20 text-destructive border-destructive/30',
            )}>
              {simulatedClassification.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-6">
          {/* Discount Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                Discount
              </Label>
              <span className={cn(
                "font-semibold tabular-nums",
                discount > 30 && 'text-destructive',
                discount <= 15 && 'text-success',
              )}>
                {discount}%
              </span>
            </div>
            <Slider
              value={[discount]}
              onValueChange={([v]) => setDiscount(v)}
              max={50}
              min={0}
              step={1}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="text-success">Sweet spot: 10-15%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Contract Length Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Contract Length
              </Label>
              <span className={cn(
                "font-semibold tabular-nums",
                contractLength >= 24 && 'text-success',
                contractLength < 12 && 'text-warning',
              )}>
                {contractLength} months
              </span>
            </div>
            <Slider
              value={[contractLength]}
              onValueChange={([v]) => setContractLength(v)}
              max={60}
              min={6}
              step={6}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>6 mo</span>
              <span className="text-success">Optimal: 24-36 mo</span>
              <span>60 mo</span>
            </div>
          </div>

          {/* Deal Value Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Deal Value
              </Label>
              <span className="font-semibold tabular-nums">
                ${dealValue.toLocaleString()}
              </span>
            </div>
            <Slider
              value={[dealValue]}
              onValueChange={([v]) => setDealValue(v)}
              max={initialDealValue * 2}
              min={initialDealValue * 0.5}
              step={5000}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${(initialDealValue * 0.5).toLocaleString()}</span>
              <span>Base: ${initialDealValue.toLocaleString()}</span>
              <span>${(initialDealValue * 2).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && simulatedScore < 70 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Target className="h-4 w-4 text-accent" />
                Suggestions to reach Green zone
              </div>
              <div className="space-y-2">
                {suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20"
                  >
                    <suggestion.icon className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-sm flex-1">{suggestion.text}</span>
                    <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                      {suggestion.impact} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Success message */}
        {simulatedClassification === 'green' && currentClassification !== 'green' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/30">
            <Sparkles className="h-5 w-5 text-success" />
            <div>
              <div className="font-medium text-success">Great news!</div>
              <div className="text-sm text-success/80">
                These changes would move your deal to the Green zone for faster approval.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}