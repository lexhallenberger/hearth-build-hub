import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { JourneyTouchpoint, TouchpointType, CHANNEL_OPTIONS } from '@/types/journeys';
import { EmotionIndicator } from './EmotionIndicator';
import {
  Play,
  GitBranch,
  MessageCircle,
  Flag,
  Star,
  AlertTriangle,
  Mail,
  Phone,
  Video,
  Globe,
  Users,
  MessageSquare,
  Share2,
  FileText,
  GripVertical,
  Trash2,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOUCHPOINT_ICONS: Record<TouchpointType, React.ElementType> = {
  action: Play,
  decision: GitBranch,
  communication: MessageCircle,
  milestone: Flag,
};

const TOUCHPOINT_COLORS: Record<TouchpointType, string> = {
  action: 'border-l-chart-1',
  decision: 'border-l-chart-4',
  communication: 'border-l-chart-2',
  milestone: 'border-l-chart-3',
};

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  email: Mail,
  phone: Phone,
  meeting: Video,
  web: Globe,
  'in-person': Users,
  chat: MessageSquare,
  social: Share2,
  document: FileText,
};

interface TouchpointNodeProps {
  touchpoint: JourneyTouchpoint;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  compact?: boolean;
}

export function TouchpointNode({
  touchpoint,
  onEdit,
  onDelete,
  className,
  compact = false,
}: TouchpointNodeProps) {
  const TypeIcon = TOUCHPOINT_ICONS[touchpoint.touchpoint_type];
  const ChannelIcon = touchpoint.channel ? CHANNEL_ICONS[touchpoint.channel] : null;
  const borderColor = TOUCHPOINT_COLORS[touchpoint.touchpoint_type];

  const painLevel = touchpoint.pain_point_level || 0;
  const hasPain = painLevel > 2;

  return (
    <div
      className={cn(
        'group relative p-3 rounded-lg border-l-4 bg-card/80 backdrop-blur-sm border shadow-sm',
        'hover:shadow-md hover:bg-card transition-all duration-200 cursor-pointer',
        borderColor,
        touchpoint.is_moment_of_truth && 'ring-2 ring-warning/50 shadow-warning/20',
        className
      )}
      onClick={onEdit}
    >
      {/* Moment of Truth Badge */}
      {touchpoint.is_moment_of_truth && (
        <div className="absolute -top-2 -right-2">
          <div className="relative">
            <Star className="h-5 w-5 text-warning fill-warning animate-pulse" />
            <div className="absolute inset-0 h-5 w-5 bg-warning/30 rounded-full blur-md" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-2">
        <div className={cn(
          'p-1.5 rounded-md bg-muted/50 shrink-0',
          touchpoint.touchpoint_type === 'action' && 'bg-chart-1/10',
          touchpoint.touchpoint_type === 'decision' && 'bg-chart-4/10',
          touchpoint.touchpoint_type === 'communication' && 'bg-chart-2/10',
          touchpoint.touchpoint_type === 'milestone' && 'bg-chart-3/10',
        )}>
          <TypeIcon className={cn(
            'h-4 w-4',
            touchpoint.touchpoint_type === 'action' && 'text-chart-1',
            touchpoint.touchpoint_type === 'decision' && 'text-chart-4',
            touchpoint.touchpoint_type === 'communication' && 'text-chart-2',
            touchpoint.touchpoint_type === 'milestone' && 'text-chart-3',
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{touchpoint.name}</p>
            {hasPain && (
              <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
            )}
          </div>

          {!compact && touchpoint.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {touchpoint.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Footer */}
      {!compact && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {ChannelIcon && (
            <Badge variant="secondary" className="text-[10px] h-5 gap-1">
              <ChannelIcon className="h-3 w-3" />
              {CHANNEL_OPTIONS.find((c) => c.value === touchpoint.channel)?.label || touchpoint.channel}
            </Badge>
          )}

          {touchpoint.owner_role && (
            <Badge variant="outline" className="text-[10px] h-5">
              {touchpoint.owner_role}
            </Badge>
          )}

          {(touchpoint as any).emotion && (
            <EmotionIndicator level={(touchpoint as any).emotion} size="sm" />
          )}

          {hasPain && (
            <div className="flex items-center gap-1 ml-auto">
              <div className="flex gap-0.5">
                {Array.from({ length: painLevel }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      i < 2 ? 'bg-warning' : 'bg-destructive'
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
