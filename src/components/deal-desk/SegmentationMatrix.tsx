import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DealSegment } from '@/hooks/useDealDesk';
import { 
  Zap, 
  Clock, 
  Users, 
  Shield,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SegmentationMatrixProps {
  segments: DealSegment[];
}

const TOUCH_MODEL_LABELS = {
  no_touch: 'Auto',
  low_touch: 'Quick Review',
  mid_touch: 'Standard',
  high_touch: 'Full Review',
};

const TOUCH_MODEL_ICONS = {
  no_touch: Zap,
  low_touch: Clock,
  mid_touch: Users,
  high_touch: Shield,
};

export function SegmentationMatrix({ segments }: SegmentationMatrixProps) {
  const formatCurrency = (value: number | null) => {
    if (value === null) return '∞';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  // Group segments by score classification
  const greenSegments = segments.filter(s => s.min_score >= 70);
  const yellowSegments = segments.filter(s => s.min_score >= 40 && s.max_score < 70);
  const redSegments = segments.filter(s => s.max_score < 40);

  const SegmentRow = ({ segment }: { segment: DealSegment }) => {
    const TouchIcon = TOUCH_MODEL_ICONS[segment.touch_model];
    
    return (
      <div 
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border',
          'hover:shadow-sm transition-all'
        )}
        style={{ borderColor: `${segment.color}40` }}
      >
        <div 
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: segment.color }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{segment.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(segment.min_deal_value)} - {formatCurrency(segment.max_deal_value)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-xs">
            L{segment.approval_level}
          </Badge>
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <TouchIcon className="h-3 w-3" />
            {TOUCH_MODEL_LABELS[segment.touch_model]}
          </Badge>
          {segment.auto_approve_enabled && (
            <Badge className="bg-green-500 text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Auto
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {segment.approval_sla_hours}h SLA
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Deal Segmentation Matrix</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Green Segments */}
        {greenSegments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <h4 className="text-sm font-medium text-green-600">Green Deals (Score ≥ 70)</h4>
            </div>
            <div className="space-y-2">
              {greenSegments.map((segment) => (
                <SegmentRow key={segment.id} segment={segment} />
              ))}
            </div>
          </div>
        )}

        {/* Yellow Segments */}
        {yellowSegments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <h4 className="text-sm font-medium text-amber-600">Yellow Deals (Score 40-69)</h4>
            </div>
            <div className="space-y-2">
              {yellowSegments.map((segment) => (
                <SegmentRow key={segment.id} segment={segment} />
              ))}
            </div>
          </div>
        )}

        {/* Red Segments */}
        {redSegments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <h4 className="text-sm font-medium text-red-600">Red Deals (Score &lt; 40)</h4>
            </div>
            <div className="space-y-2">
              {redSegments.map((segment) => (
                <SegmentRow key={segment.id} segment={segment} />
              ))}
            </div>
          </div>
        )}

        {segments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No deal segments configured
          </div>
        )}
      </CardContent>
    </Card>
  );
}
