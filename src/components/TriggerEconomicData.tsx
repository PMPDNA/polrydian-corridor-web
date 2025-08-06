import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function TriggerEconomicData() {
  const { toast } = useToast();

  const handleTrigger = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('economic-data-scheduler');
      
      if (error) throw error;
      
      toast({
        title: "Economic Data Collection Started",
        description: "FRED data is being collected and stored in the insights table.",
      });
    } catch (error: any) {
      console.error('Error triggering economic data:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleTrigger} variant="outline">
      Trigger Economic Data Collection
    </Button>
  );
}