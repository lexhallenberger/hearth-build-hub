import { cn } from '@/lib/utils';

interface ConnectionLineProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color?: string;
  animated?: boolean;
  className?: string;
}

export function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  color = 'hsl(var(--accent))',
  animated = true,
  className,
}: ConnectionLineProps) {
  // Calculate bezier curve control points
  const midX = (fromX + toX) / 2;
  const path = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;

  return (
    <g className={cn('connection-line', className)}>
      {/* Shadow/glow effect */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.2}
        filter="blur(2px)"
      />
      
      {/* Main line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={animated ? '8 4' : 'none'}
        className={cn(animated && 'animate-flow')}
      />
      
      {/* Arrow head */}
      <circle
        cx={toX}
        cy={toY}
        r={4}
        fill={color}
      />
    </g>
  );
}

interface StageConnectionProps {
  stageIndex: number;
  stageWidth: number;
  stageHeight: number;
  gapWidth: number;
  color?: string;
}

export function StageConnection({
  stageIndex,
  stageWidth,
  stageHeight,
  gapWidth,
  color,
}: StageConnectionProps) {
  const fromX = stageIndex * (stageWidth + gapWidth) + stageWidth;
  const toX = fromX + gapWidth;
  const y = stageHeight / 2;

  return (
    <ConnectionLine
      fromX={fromX}
      fromY={y}
      toX={toX}
      toY={y}
      color={color}
      animated
    />
  );
}
