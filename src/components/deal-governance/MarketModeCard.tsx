import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { MarketStrategy, useUpdateMarketStrategy } from '@/hooks/useMarketStrategy';
import { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Building2,
  Shield,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketModeCardProps {
  strategy: MarketStrategy | null;
  onUpdate?: () => void;
}

const MARKET_MODES = {
  market_share: {
    label: 'Market Share',
    description: 'Prioritize volume and market penetration over margins',
    icon: TrendingUp,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  revenue_optimal: {
    label: 'Revenue Optimal',
    description: 'Balance between growth and profitability',
    icon: DollarSign,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  margin_optimal: {
    label: 'Margin Optimal',
    description: 'Maximize profitability on each deal',
    icon: Target,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
};

export function MarketModeCard({ strategy, onUpdate }: MarketModeCardProps) {
  const updateStrategy = useUpdateMarketStrategy();
  const [selectedMode, setSelectedMode] = useState<string>(strategy?.market_mode || 'revenue_optimal');
  const [maxDiscount, setMaxDiscount] = useState(strategy?.max_discount_percent || 50);
  const [minContractMonths, setMinContractMonths] = useState(strategy?.min_contract_months || 12);
  const [hasChanges, setHasChanges] = useState(false);

  const handleModeChange = (mode: string) => {
    setSelectedMode(mode);
    setHasChanges(true);
    
    // Adjust defaults based on mode
    if (mode === 'market_share') {
      setMaxDiscount(60);
      setMinContractMonths(6);
    } else if (mode === 'revenue_optimal') {
      setMaxDiscount(40);
      setMinContractMonths(12);
    } else if (mode === 'margin_optimal') {
      setMaxDiscount(25);
      setMinContractMonths(24);
    }
  };

  const handleSave = async () => {
    if (!strategy) return;
    
    await updateStrategy.mutateAsync({
      id: strategy.id,
      market_mode: selectedMode as MarketStrategy['market_mode'],
      max_discount_percent: maxDiscount,
      min_contract_months: minContractMonths,
    });
    
    setHasChanges(false);
    onUpdate?.();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Market Strategy Mode
            </CardTitle>
            <CardDescription>
              Define your company's go-to-market approach
            </CardDescription>
          </div>
          {hasChanges && (
            <Button 
              onClick={handleSave}
              disabled={updateStrategy.isPending}
              size="sm"
            >
              {updateStrategy.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Market Mode Selection */}
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(MARKET_MODES).map(([mode, config]) => {
            const Icon = config.icon;
            const isSelected = selectedMode === mode;
            
            return (
              <div
                key={mode}
                className={cn(
                  'relative p-4 rounded-lg border-2 cursor-pointer transition-all',
                  isSelected && config.borderColor,
                  isSelected && config.bgColor,
                  !isSelected && 'border-muted hover:border-muted-foreground/30'
                )}
                onClick={() => handleModeChange(mode)}
              >
                {isSelected && (
                  <div className={cn('absolute top-2 right-2', config.color)}>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                )}
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg mb-3', config.bgColor)}>
                  <Icon className={cn('h-5 w-5', config.color)} />
                </div>
                <h4 className="font-semibold mb-1">{config.label}</h4>
                <p className="text-xs text-muted-foreground">{config.description}</p>
              </div>
            );
          })}
        </div>

        {/* Guardrails */}
        <div className="border-t pt-6 space-y-6">
          <h4 className="font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Deal Guardrails
          </h4>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Max Discount */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Maximum Discount</Label>
                <Badge variant="outline">{maxDiscount}%</Badge>
              </div>
              <Slider
                value={[maxDiscount]}
                min={10}
                max={70}
                step={5}
                onValueChange={([value]) => {
                  setMaxDiscount(value);
                  setHasChanges(true);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Deals exceeding this discount require escalation
              </p>
            </div>

            {/* Min Contract Length */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Minimum Contract</Label>
                <Badge variant="outline">{minContractMonths} months</Badge>
              </div>
              <Slider
                value={[minContractMonths]}
                min={3}
                max={36}
                step={3}
                onValueChange={([value]) => {
                  setMinContractMonths(value);
                  setHasChanges(true);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Shorter contracts require approval
              </p>
            </div>
          </div>
        </div>

        {/* Segment Thresholds Preview */}
        {strategy?.segment_thresholds && (
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4">Segment Thresholds</h4>
            <div className="grid gap-3 md:grid-cols-4">
              {Object.entries(strategy.segment_thresholds).map(([segment, thresholds]) => (
                <div key={segment} className="p-3 rounded-lg bg-muted/30 border">
                  <p className="text-sm font-medium capitalize">{segment.replace('_', ' ')}</p>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p>Min Value: ${thresholds.min_value?.toLocaleString() || 0}</p>
                    <p>Max Discount: {thresholds.max_discount || 0}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
