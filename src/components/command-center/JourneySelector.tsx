import { Journey } from '@/types/journeys';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, Users, Briefcase, Handshake, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JourneySelectorProps {
  journeys: Journey[];
  onSelect: (journey: Journey) => void;
}

const JOURNEY_TYPE_CONFIG = {
  customer: {
    icon: Users,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-500',
    label: 'Customer Journey',
    description: 'End-to-end customer experience from awareness to advocacy',
  },
  seller: {
    icon: Briefcase,
    gradient: 'from-emerald-500/20 to-green-500/20',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-500',
    label: 'Seller Journey',
    description: 'Sales team activities aligned to customer buying process',
  },
  partner: {
    icon: Handshake,
    gradient: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'border-purple-500/30',
    iconColor: 'text-purple-500',
    label: 'Partner Journey',
    description: 'Channel partner engagement and enablement lifecycle',
  },
  deal: {
    icon: FileText,
    gradient: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-500',
    label: 'Deal Journey',
    description: 'Deal progression from discovery to close',
  },
};

export function JourneySelector({ journeys, onSelect }: JourneySelectorProps) {
  // Group journeys by type
  const journeysByType = journeys.reduce((acc, journey) => {
    const type = journey.journey_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(journey);
    return acc;
  }, {} as Record<string, Journey[]>);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Object.entries(JOURNEY_TYPE_CONFIG).map(([type, config]) => {
        const typeJourneys = journeysByType[type] || [];
        const primaryJourney = typeJourneys[0];
        const Icon = config.icon;

        return (
          <Card
            key={type}
            className={cn(
              'group relative overflow-hidden cursor-pointer transition-all duration-300',
              'hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1',
              'bg-gradient-to-br',
              config.gradient,
              config.borderColor,
              'border-2'
            )}
            onClick={() => primaryJourney && onSelect(primaryJourney)}
          >
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-40 h-40 bg-current rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-current rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-2xl',
                  'bg-background/80 backdrop-blur-sm shadow-lg',
                  'transition-transform duration-300 group-hover:scale-110'
                )}>
                  <Icon className={cn('h-7 w-7', config.iconColor)} />
                </div>
                <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                  {typeJourneys.length} {typeJourneys.length === 1 ? 'journey' : 'journeys'}
                </Badge>
              </div>

              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                {config.label}
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4">
                {config.description}
              </p>

              {primaryJourney ? (
                <div className="p-3 rounded-lg bg-background/60 backdrop-blur-sm">
                  <p className="text-sm font-medium truncate">{primaryJourney.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {primaryJourney.description || 'No description'}
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-background/40 backdrop-blur-sm border-2 border-dashed border-muted">
                  <p className="text-sm text-muted-foreground text-center">
                    No journey created yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
