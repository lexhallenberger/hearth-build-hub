import { cn } from '@/lib/utils';

interface EmotionIndicatorProps {
  level: number; // 1-5
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const EMOTIONS: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: '😡', label: 'Frustrated', color: 'text-destructive' },
  2: { emoji: '😕', label: 'Confused', color: 'text-warning' },
  3: { emoji: '😐', label: 'Neutral', color: 'text-muted-foreground' },
  4: { emoji: '🙂', label: 'Satisfied', color: 'text-success' },
  5: { emoji: '😄', label: 'Delighted', color: 'text-success' },
};

const SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

export function EmotionIndicator({ level, size = 'md', showLabel = false, className }: EmotionIndicatorProps) {
  const emotion = EMOTIONS[level] || EMOTIONS[3];

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className={cn(SIZE_CLASSES[size])} role="img" aria-label={emotion.label}>
        {emotion.emoji}
      </span>
      {showLabel && (
        <span className={cn('text-xs font-medium', emotion.color)}>{emotion.label}</span>
      )}
    </div>
  );
}

interface EmotionRangeProps {
  start: number;
  end: number;
  className?: string;
}

export function EmotionRange({ start, end, className }: EmotionRangeProps) {
  const startEmotion = EMOTIONS[start] || EMOTIONS[3];
  const endEmotion = EMOTIONS[end] || EMOTIONS[3];
  const isImproving = end > start;
  const isDeclining = end < start;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-base" role="img" aria-label={startEmotion.label}>
        {startEmotion.emoji}
      </span>
      <div className="flex-1 relative h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-all',
            isImproving && 'bg-gradient-to-r from-warning to-success',
            isDeclining && 'bg-gradient-to-r from-success to-destructive',
            !isImproving && !isDeclining && 'bg-muted-foreground'
          )}
          style={{ width: `${((end - 1) / 4) * 100}%` }}
        />
      </div>
      <span className="text-base" role="img" aria-label={endEmotion.label}>
        {endEmotion.emoji}
      </span>
    </div>
  );
}
