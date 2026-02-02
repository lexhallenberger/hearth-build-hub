import { JourneyTouchpoint, TOUCHPOINT_TYPE_LABELS, CHANNEL_OPTIONS } from '@/types/journeys';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { Star, AlertTriangle, Play, GitBranch, MessageCircle, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TouchpointRowProps {
  touchpoint: JourneyTouchpoint;
  onClick: (touchpoint: JourneyTouchpoint) => void;
}

const typeIcons = {
  action: Play,
  decision: GitBranch,
  communication: MessageCircle,
  milestone: Flag,
};

export function TouchpointRow({ touchpoint, onClick }: TouchpointRowProps) {
  const Icon = typeIcons[touchpoint.touchpoint_type] || Play;
  const channelLabel = CHANNEL_OPTIONS.find(c => c.value === touchpoint.channel)?.label || touchpoint.channel;
  const painLevel = touchpoint.pain_point_level || 0;

  const getPainBadgeClass = (level: number) => {
    if (level >= 4) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (level >= 3) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    if (level >= 1) return 'bg-green-500/10 text-green-500 border-green-500/20';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <TableRow 
      className={cn(
        'cursor-pointer hover:bg-muted/50 transition-colors',
        painLevel >= 4 && 'bg-red-500/5 hover:bg-red-500/10',
        touchpoint.is_moment_of_truth && 'border-l-2 border-l-yellow-500'
      )}
      onClick={() => onClick(touchpoint)}
    >
      {/* Name & Type */}
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate max-w-[200px]">{touchpoint.name}</span>
          {touchpoint.is_moment_of_truth && (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
          )}
        </div>
      </TableCell>

      {/* Channel */}
      <TableCell>
        {channelLabel ? (
          <Badge variant="outline" className="text-xs">
            {channelLabel}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>

      {/* Owner */}
      <TableCell>
        <span className="text-sm">
          {touchpoint.owner_role || (
            <span className="text-muted-foreground">—</span>
          )}
        </span>
      </TableCell>

      {/* Pain Level */}
      <TableCell>
        <Badge variant="outline" className={cn('text-xs', getPainBadgeClass(painLevel))}>
          <AlertTriangle className="h-3 w-3 mr-1" />
          {painLevel}/5
        </Badge>
      </TableCell>

      {/* Value Message */}
      <TableCell className="max-w-[250px]">
        {touchpoint.value_message ? (
          <span className="text-sm text-muted-foreground truncate block">
            "{touchpoint.value_message.substring(0, 50)}{touchpoint.value_message.length > 50 ? '...' : ''}"
          </span>
        ) : (
          <span className="text-muted-foreground text-xs italic">No message</span>
        )}
      </TableCell>
    </TableRow>
  );
}
