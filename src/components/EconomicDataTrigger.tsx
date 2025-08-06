import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export function EconomicDataTrigger() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const triggerDataCollection = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const { data, error } = await supabase.functions.invoke('economic-data-scheduler');
      
      if (error) {
        throw error;
      }
      
      setMessage('Economic data collection triggered successfully!');
    } catch (error: any) {
      console.error('Error triggering economic data collection:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-background">
      <h3 className="text-lg font-semibold mb-4">Economic Data Collection</h3>
      <Button 
        onClick={triggerDataCollection} 
        disabled={loading}
        className="mb-4"
      >
        {loading ? 'Loading...' : 'Trigger Data Collection'}
      </Button>
      {message && (
        <p className={`text-sm ${message.includes('Error') ? 'text-destructive' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}