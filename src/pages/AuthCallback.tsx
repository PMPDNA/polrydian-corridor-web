import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
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

      try {
        // Here we would normally exchange the code for an access token
        // For now, we'll just show success and store the code
        console.log('LinkedIn authorization code:', code);
        
        setStatus('success');
        setMessage('LinkedIn authorization successful! Code received.');
        
        toast({
          title: "Authorization Successful",
          description: "LinkedIn authorization code received successfully",
        });

        // Redirect to home page after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);

      } catch (error) {
        console.error('Error processing LinkedIn callback:', error);
        setStatus('error');
        setMessage('Failed to process LinkedIn authorization');
        toast({
          title: "Processing Failed",
          description: "Failed to process LinkedIn authorization",
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
            <p className="text-xs text-muted-foreground">
              Redirecting to home page in a few seconds...
            </p>
          )}
          
          {status === 'error' && (
            <Button onClick={() => navigate('/')} variant="outline">
              Return to Home
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};