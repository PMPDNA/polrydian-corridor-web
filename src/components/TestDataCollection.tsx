import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TrendingUp, Zap, Globe } from 'lucide-react';

export function TestDataCollection() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const triggerDataCollection = async () => {
    setLoading(true);
    try {
      // Test FRED API integration
      const { data: fredData, error: fredError } = await supabase.functions.invoke('fred-api-integration', {
        body: { operation: 'fetch_indicators', limit: 100 }
      });

      if (fredError) throw fredError;

      // Test CSIS feed fetcher
      const { data: csisData, error: csisError } = await supabase.functions.invoke('csis-feed-fetcher');
      
      if (csisError) throw csisError;

      // Test policy updates fetcher
      const { data: policyData, error: policyError } = await supabase.functions.invoke('policy-updates-fetcher');
      
      if (policyError) throw policyError;

      setResults({
        fred: fredData,
        csis: csisData,
        policy: policyData
      });

      toast({
        title: "Data Collection Complete",
        description: "All economic data feeds have been updated successfully",
      });

    } catch (error: any) {
      console.error('Data collection error:', error);
      toast({
        title: "Data Collection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Test Economic Data Collection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Test all economic data collection services including FRED API, CSIS feed, and policy updates.
          </p>
          
          <Button 
            onClick={triggerDataCollection} 
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Collecting Data...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Trigger Data Collection
              </>
            )}
          </Button>

          {results && (
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold">Collection Results:</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-sm">FRED API</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {results.fred?.indicators_processed || 0} indicators processed
                  </p>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-sm">CSIS Feed</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {results.csis?.articles_processed || 0} articles processed
                  </p>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-purple-500" />
                    <span className="font-medium text-sm">Policy Updates</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {results.policy?.updates_processed || 0} updates processed
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}