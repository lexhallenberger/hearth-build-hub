import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Map } from 'lucide-react';

export default function Journeys() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Journeys</h1>
        <p className="text-muted-foreground">Map customer, seller, partner, and deal journeys</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Journey Mapping</CardTitle>
          <CardDescription>
            Visualize and optimize journeys across your revenue lifecycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
            <Map className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Coming in Phase 3</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Interactive journey builder with drag-and-drop touchpoints for Customer, Seller,
              Partner, and Deal journeys.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
