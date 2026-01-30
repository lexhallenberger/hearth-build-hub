import { useState, useCallback, useRef, useEffect } from 'react';

export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
}

export interface UseJourneyCanvasOptions {
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
}

export function useJourneyCanvas(options: UseJourneyCanvasOptions = {}) {
  const { minZoom = 0.25, maxZoom = 2, zoomStep = 0.1 } = options;
  
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + zoomStep, maxZoom));
  }, [zoomStep, maxZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - zoomStep, minZoom));
  }, [zoomStep, minZoom]);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    // Reset to default view
    setZoom(0.8);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
        setZoom((prev) => Math.min(Math.max(prev + delta, minZoom), maxZoom));
      }
    },
    [zoomStep, minZoom, maxZoom]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        handleZoomReset();
      } else if ((e.metaKey || e.ctrlKey) && e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleZoomReset]);

  return {
    zoom,
    pan,
    isDragging,
    containerRef,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleFitToScreen,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    setZoom,
    setPan,
  };
}
