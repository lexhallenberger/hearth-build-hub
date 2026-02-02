import { useState } from 'react';
import { Journey, JourneyStage, JourneyTouchpoint } from '@/types/journeys';
import { JourneyHealthScore } from './JourneyHealthScore';
import { StageCard } from './StageCard';
import { TouchpointDetailSheet } from './TouchpointDetailSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  AlertTriangle, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Layers
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface JourneyBlueprintViewProps {
  journey: Journey;
  onEditTouchpoint?: (touchpoint: JourneyTouchpoint, stageId: string) => void;
}

type FilterType = 'all' | 'moments-of-truth' | 'high-pain' | 'missing-value';

export function JourneyBlueprintView({ journey, onEditTouchpoint }: JourneyBlueprintViewProps) {
  const [selectedTouchpoint, setSelectedTouchpoint] = useState<JourneyTouchpoint | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(['all']);
  const [allExpanded, setAllExpanded] = useState(false);

  const stages = journey.stages || [];

  // Filter stages and touchpoints based on search and filters
  const filteredStages = stages.map(stage => {
    let touchpoints = stage.touchpoints || [];

    // Apply search filter
    if (searchQuery) {
      touchpoints = touchpoints.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.value_message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.owner_role?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filters
    if (!activeFilters.includes('all')) {
      touchpoints = touchpoints.filter(t => {
        if (activeFilters.includes('moments-of-truth') && t.is_moment_of_truth) return true;
        if (activeFilters.includes('high-pain') && t.pain_point_level >= 4) return true;
        if (activeFilters.includes('missing-value') && !t.value_message) return true;
        return false;
      });
    }

    return { ...stage, touchpoints };
  }).filter(stage => stage.touchpoints && stage.touchpoints.length > 0 || !searchQuery && activeFilters.includes('all'));

  const handleTouchpointClick = (touchpoint: JourneyTouchpoint, stageId: string) => {
    setSelectedTouchpoint(touchpoint);
    setSelectedStageId(stageId);
  };

  const handleEditTouchpoint = (touchpoint: JourneyTouchpoint) => {
    if (onEditTouchpoint && selectedStageId) {
      onEditTouchpoint(touchpoint, selectedStageId);
      setSelectedTouchpoint(null);
    }
  };

  const toggleFilter = (filter: FilterType) => {
    if (filter === 'all') {
      setActiveFilters(['all']);
    } else {
      setActiveFilters(prev => {
        const newFilters = prev.filter(f => f !== 'all');
        if (newFilters.includes(filter)) {
          const result = newFilters.filter(f => f !== filter);
          return result.length === 0 ? ['all'] : result;
        }
        return [...newFilters, filter];
      });
    }
  };

  const totalTouchpoints = stages.reduce((sum, s) => sum + (s.touchpoints?.length || 0), 0);
  const visibleTouchpoints = filteredStages.reduce((sum, s) => sum + (s.touchpoints?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Health Dashboard */}
      <JourneyHealthScore journey={journey} />

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
                {!activeFilters.includes('all') && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuCheckboxItem
                checked={activeFilters.includes('all')}
                onCheckedChange={() => toggleFilter('all')}
              >
                <Layers className="h-4 w-4 mr-2" />
                All Touchpoints
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={activeFilters.includes('moments-of-truth')}
                onCheckedChange={() => toggleFilter('moments-of-truth')}
              >
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                Moments of Truth
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={activeFilters.includes('high-pain')}
                onCheckedChange={() => toggleFilter('high-pain')}
              >
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                High Pain Points
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={activeFilters.includes('missing-value')}
                onCheckedChange={() => toggleFilter('missing-value')}
              >
                <span className="h-4 w-4 mr-2">💬</span>
                Missing Value Message
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Filter Badges */}
          <div className="hidden md:flex gap-2">
            {!activeFilters.includes('all') && activeFilters.map(filter => (
              <Badge 
                key={filter}
                variant="secondary" 
                className="cursor-pointer"
                onClick={() => toggleFilter(filter)}
              >
                {filter === 'moments-of-truth' && '⭐ Moments of Truth'}
                {filter === 'high-pain' && '🔴 High Pain'}
                {filter === 'missing-value' && '💬 Missing Value'}
                <span className="ml-1">×</span>
              </Badge>
            ))}
          </div>

          {/* Expand/Collapse All */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setAllExpanded(!allExpanded)}
            className="gap-2"
          >
            {allExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Collapse All
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Expand All
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* Results Count */}
          <span className="text-sm text-muted-foreground">
            {visibleTouchpoints} of {totalTouchpoints} touchpoints
          </span>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search touchpoints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px] sm:w-[250px]"
            />
          </div>
        </div>
      </div>

      {/* Stage Cards */}
      <div className="space-y-4">
        {filteredStages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No touchpoints match your filters</p>
            <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => {
                setActiveFilters(['all']);
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          filteredStages.map((stage, index) => (
            <StageCard
              key={stage.id}
              stage={stage}
              index={index}
              defaultOpen={allExpanded || index === 0}
              onTouchpointClick={(tp) => handleTouchpointClick(tp, stage.id)}
            />
          ))
        )}
      </div>

      {/* Touchpoint Detail Sheet */}
      <TouchpointDetailSheet
        touchpoint={selectedTouchpoint}
        open={!!selectedTouchpoint}
        onOpenChange={(open) => !open && setSelectedTouchpoint(null)}
        onEdit={onEditTouchpoint ? handleEditTouchpoint : undefined}
      />
    </div>
  );
}
