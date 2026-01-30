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
  Trash2,
  Edit2,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOUCHPOINT_ICONS: Record<TouchpointType, React.ElementType> = {
  action: Zap,
  decision: GitBranch,
  communication: MessageCircle,
  milestone: Flag,
};

const TOUCHPOINT_STYLES: Record<TouchpointType, { bg: string; border: string; icon: string; glow: string }> = {
  action: { 
    bg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10', 
    border: 'border-l-blue-500',
    icon: 'bg-blue-500/20 text-blue-400',
    glow: 'group-hover:shadow-blue-500/20',
  },
  decision: { 
    bg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10', 
    border: 'border-l-purple-500',
    icon: 'bg-purple-500/20 text-purple-400',
    glow: 'group-hover:shadow-purple-500/20',
  },
  communication: { 
    bg: 'bg-gradient-to-br from-green-500/20 to-green-600/10', 
    border: 'border-l-green-500',
    icon: 'bg-green-500/20 text-green-400',
    glow: 'group-hover:shadow-green-500/20',
  },
  milestone: { 
    bg: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10', 
    border: 'border-l-amber-500',
    icon: 'bg-amber-500/20 text-amber-400',
    glow: 'group-hover:shadow-amber-500/20',
  },
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
  const styles = TOUCHPOINT_STYLES[touchpoint.touchpoint_type];

  const painLevel = touchpoint.pain_point_level || 0;
  const hasPain = painLevel > 2;

  return (
    <div
      className={cn(
        'group relative rounded-xl border-l-4 overflow-hidden cursor-pointer transition-all duration-300',
        'hover:scale-[1.02] hover:-translate-y-0.5',
        'shadow-sm hover:shadow-xl',
        styles.border,
        styles.glow,
        touchpoint.is_moment_of_truth && 'ring-2 ring-amber-400/60 shadow-amber-400/20',
        className
      )}
      onClick={onEdit}
    >
      {/* Background with glass effect */}
      <div className={cn('absolute inset-0', styles.bg)} />
      <div className="absolute inset-0 bg-card/60 backdrop-blur-md" />
      
      {/* Moment of Truth special effects */}
      {touchpoint.is_moment_of_truth && (
        <>
          {/* Golden shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-400/20 to-amber-500/10 animate-pulse" />
          
          {/* Floating star badge */}
          <div className="absolute -top-2 -right-2 z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400 rounded-full blur-md animate-pulse" />
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg">
                <Star className="h-4 w-4 text-white fill-white" />
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Content */}
      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Icon with glow */}
          <div className={cn(
            'relative shrink-0 p-2.5 rounded-xl transition-transform group-hover:scale-110',
            styles.icon
          )}>
            <TypeIcon className="h-5 w-5" />
            {/* Subtle glow behind icon */}
            <div className={cn(
              'absolute inset-0 rounded-xl blur-lg opacity-50',
              touchpoint.touchpoint_type === 'action' && 'bg-blue-500',
              touchpoint.touchpoint_type === 'decision' && 'bg-purple-500',
              touchpoint.touchpoint_type === 'communication' && 'bg-green-500',
              touchpoint.touchpoint_type === 'milestone' && 'bg-amber-500',
            )} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold truncate">{touchpoint.name}</p>
              {hasPain && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-500/20">
                  <AlertTriangle className="h-3 w-3 text-red-400" />
                </div>
              )}
            </div>

            {!compact && touchpoint.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {touchpoint.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg bg-white/5 hover:bg-red-500/20 text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Footer */}
        {!compact && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {ChannelIcon && (
              <Badge variant="secondary" className="text-[10px] h-6 gap-1.5 bg-white/10 hover:bg-white/15 border-white/10">
                <ChannelIcon className="h-3 w-3" />
                {CHANNEL_OPTIONS.find((c) => c.value === touchpoint.channel)?.label || touchpoint.channel}
              </Badge>
            )}

            {touchpoint.owner_role && (
              <Badge variant="outline" className="text-[10px] h-6 border-white/20 bg-white/5">
                {touchpoint.owner_role}
              </Badge>
            )}

            {(touchpoint as any).emotion && (
              <div className="ml-auto">
                <EmotionIndicator level={(touchpoint as any).emotion} size="sm" />
              </div>
            )}

            {hasPain && !((touchpoint as any).emotion) && (
              <div className="flex items-center gap-1.5 ml-auto px-2 py-1 rounded-full bg-red-500/10">
                <span className="text-[10px] text-red-400 font-medium">Pain Level</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1.5 w-1.5 rounded-full transition-all',
                        i < painLevel 
                          ? i < 2 ? 'bg-amber-400' : 'bg-red-400' 
                          : 'bg-white/20'
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
