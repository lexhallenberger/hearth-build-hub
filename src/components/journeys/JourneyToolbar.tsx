import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Grid3X3,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface JourneyToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFitToScreen: () => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  showConnections?: boolean;
  onToggleConnections?: () => void;
  className?: string;
}

export function JourneyToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitToScreen,
  showGrid = true,
  onToggleGrid,
  showConnections = true,
  onToggleConnections,
  className,
}: JourneyToolbarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'flex items-center gap-1 p-1.5 rounded-lg bg-card/80 backdrop-blur-sm border shadow-lg',
          className
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom out (⌘-)</TooltipContent>
        </Tooltip>

        <Badge variant="secondary" className="min-w-[4rem] justify-center text-xs font-mono">
          {Math.round(zoom * 100)}%
        </Badge>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom in (⌘+)</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset view (⌘0)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onFitToScreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fit to screen</TooltipContent>
        </Tooltip>

        {(onToggleGrid || onToggleConnections) && (
          <>
            <Separator orientation="vertical" className="h-6 mx-1" />

            {onToggleGrid && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showGrid ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={onToggleGrid}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle grid</TooltipContent>
              </Tooltip>
            )}

            {onToggleConnections && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showConnections ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={onToggleConnections}
                  >
                    {showConnections ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle connections</TooltipContent>
              </Tooltip>
            )}
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
