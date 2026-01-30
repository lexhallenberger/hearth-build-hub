import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourneys, useDeleteJourney, useCreateJourney } from '@/hooks/useJourneys';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Map, Loader2, Users, Briefcase, Handshake, FileText, Trash2 } from 'lucide-react';
import { Journey, JourneyType, JOURNEY_TYPE_LABELS, JOURNEY_TYPE_COLORS, JOURNEY_TYPE_DESCRIPTIONS } from '@/types/journeys';
import { formatDistanceToNow } from 'date-fns';

const JOURNEY_TYPE_ICONS: Record<JourneyType, React.ElementType> = {
  customer: Users,
  seller: Briefcase,
  partner: Handshake,
  deal: FileText,
};

export default function Journeys() {
  const navigate = useNavigate();
  const { data: journeys, isLoading } = useJourneys();
  const createJourney = useCreateJourney();
  const deleteJourney = useDeleteJourney();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<JourneyType | 'all'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newJourney, setNewJourney] = useState({
    name: '',
    description: '',
    journey_type: 'customer' as JourneyType,
    color: '#3b82f6',
  });

  const filteredJourneys = (journeys || []).filter((journey) => {
    const matchesSearch = journey.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || journey.journey_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreateJourney = async () => {
    const journey = await createJourney.mutateAsync(newJourney);
    setIsCreateOpen(false);
    setNewJourney({ name: '', description: '', journey_type: 'customer', color: '#3b82f6' });
    navigate(`/journeys/${journey.id}`);
  };

  const handleDeleteJourney = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this journey?')) {
      await deleteJourney.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Journeys</h1>
          <p className="text-muted-foreground">Map customer, seller, partner, and deal journeys</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90">
              <Plus className="mr-2 h-4 w-4" />
              New Journey
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Journey</DialogTitle>
              <DialogDescription>
                Define a new journey to map touchpoints and stages
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Journey Name</Label>
                <Input
                  id="name"
                  value={newJourney.name}
                  onChange={(e) => setNewJourney({ ...newJourney, name: e.target.value })}
                  placeholder="e.g., Enterprise Sales Journey"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Journey Type</Label>
                <Select
                  value={newJourney.journey_type}
                  onValueChange={(v) => setNewJourney({ ...newJourney, journey_type: v as JourneyType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(JOURNEY_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {JOURNEY_TYPE_DESCRIPTIONS[newJourney.journey_type]}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newJourney.description}
                  onChange={(e) => setNewJourney({ ...newJourney, description: e.target.value })}
                  placeholder="Brief description of this journey..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={newJourney.color}
                    onChange={(e) => setNewJourney({ ...newJourney, color: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={newJourney.color}
                    onChange={(e) => setNewJourney({ ...newJourney, color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateJourney}
                disabled={!newJourney.name || createJourney.isPending}
              >
                {createJourney.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Journey
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Journey Type Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(Object.entries(JOURNEY_TYPE_LABELS) as [JourneyType, string][]).map(([type, label]) => {
          const Icon = JOURNEY_TYPE_ICONS[type];
          const count = journeys?.filter((j) => j.journey_type === type).length || 0;
          return (
            <Card
              key={type}
              className={`cursor-pointer transition-all hover:shadow-md ${
                typeFilter === type ? 'ring-2 ring-accent' : ''
              }`}
              onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${JOURNEY_TYPE_COLORS[type]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">{count} journeys</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Journeys</CardTitle>
              <CardDescription>
                {filteredJourneys.length} journey{filteredJourneys.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search journeys..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-[250px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : filteredJourneys.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
              <Map className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No journeys found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first journey'}
              </p>
              {!search && typeFilter === 'all' && (
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Journey
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredJourneys.map((journey) => {
                const Icon = JOURNEY_TYPE_ICONS[journey.journey_type];
                return (
                  <Card
                    key={journey.id}
                    className="cursor-pointer hover:shadow-md transition-all group"
                    onClick={() => navigate(`/journeys/${journey.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: journey.color + '20' }}
                        >
                          <Icon className="h-5 w-5" style={{ color: journey.color }} />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDeleteJourney(e, journey.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <CardTitle className="text-lg mt-2">{journey.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {journey.description || JOURNEY_TYPE_DESCRIPTIONS[journey.journey_type]}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge className={JOURNEY_TYPE_COLORS[journey.journey_type]}>
                          {JOURNEY_TYPE_LABELS[journey.journey_type]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(journey.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
