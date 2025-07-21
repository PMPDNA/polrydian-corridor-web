import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session, isAdmin } = useSupabaseAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing LinkedIn authorization...');

  useEffect(() => {
    const handleLinkedInCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setStatus('error');
        setMessage(errorDescription || 'LinkedIn authorization failed');
        toast({
          title: "Authorization Failed",
          description: errorDescription || error,
          variant: "destructive",
        });
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received from LinkedIn');
        toast({
          title: "Authorization Failed",
          description: "No authorization code received",
          variant: "destructive",
        });
        return;
      }

      // Process LinkedIn callback
      setStatus('loading');
      setMessage('Processing LinkedIn authorization...');
      
      try {
        // First, test the debug function
        const { data: debugData, error: debugError } = await supabase.functions.invoke('linkedin-debug', {
          body: { code }
        });
        
        console.log('Debug response:', debugData, debugError);
        
        // Send code via POST to avoid double-call issue
        const { data, error: functionError } = await supabase.functions.invoke('linkedin-oauth', {
          body: { code }
        });

        if (functionError) {
          throw new Error(functionError.message);
        }

        if (!data || !data.success) {
          throw new Error(data?.error || 'No response data received');
        }

        setStatus('success');
        setMessage('LinkedIn connected successfully!');
        toast({
          title: "LinkedIn Connected",
          description: "Your LinkedIn account has been successfully connected.",
        });

        // Redirect to admin page after 2 seconds
        setTimeout(() => {
          navigate('/admin');
        }, 2000);

      } catch (error) {
        console.error('LinkedIn OAuth error:', error);
        setStatus('error');
        setMessage(`Failed to connect LinkedIn: ${error.message}`);
        toast({
          title: "LinkedIn Connection Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    handleLinkedInCallback();
  }, [searchParams, navigate, toast]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle>LinkedIn Authorization</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Processing your LinkedIn authorization...'}
            {status === 'success' && 'Authorization completed successfully!'}
            {status === 'error' && 'Authorization failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          
          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Redirecting to admin panel in a few seconds...
              </p>
              <p className="text-xs text-amber-600">
                ⚠️ Check browser console for access token setup instructions
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <Button onClick={() => navigate('/admin')} variant="outline">
              Return to Admin
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};