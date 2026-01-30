import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

export function SeedDemoDataButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-data');
      
      if (error) throw error;
      
      if (data.success) {
        setIsSeeded(true);
        toast({
          title: "Demo Data Created! 🎉",
          description: `Created ${data.summary.deals} deals, ${data.summary.customers} customers, ${data.summary.opportunities} opportunities, and more!`,
        });
        // Refresh the page after a brief delay to show new data
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast({
          title: "Info",
          description: data.message || "Demo data may already exist",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Error seeding data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to seed demo data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSeeded) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        Demo Data Created
      </Button>
    );
  }

  return (
    <Button
      onClick={handleSeedData}
      disabled={isLoading}
      variant="outline"
      className="gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 border-purple-500/30"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating Demo Data...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 text-purple-500" />
          Populate Demo Data
        </>
      )}
    </Button>
  );
}