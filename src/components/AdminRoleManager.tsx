import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRoleManager() {
  const { user, isAdmin } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You must be an admin to access this feature.
        </AlertDescription>
      </Alert>
    );
  }

  const handleAssignAdmin = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Search for user by email using secure admin function
      const { data: searchResult, error: searchError } = await supabase.functions.invoke('search-users', {
        body: { searchTerm: email }
      });

      if (searchError || !searchResult?.users?.length) {
        throw new Error('User not found. Make sure the user has signed up first.');
      }

      const userToPromote = searchResult.users.find((u: any) => u.email === email);
      if (!userToPromote) {
        throw new Error('User not found with that exact email address.');
      }

      // Use the secure function to assign admin role
      const { data, error: assignError } = await supabase
        .rpc('assign_admin_role', {
          target_user_id: userToPromote.user_id
        });

      if (assignError) {
        throw assignError;
      }

      if (data) {
        toast.success(`Admin role assigned successfully to ${email}`);
        setEmail('');
      }
    } catch (err: any) {
      console.error('Error assigning admin role:', err);
      setError(err.message || 'Failed to assign admin role');
      toast.error(err.message || 'Failed to assign admin role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Role Manager
        </CardTitle>
        <CardDescription>
          Securely assign admin privileges to users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This action assigns full administrative privileges. Use with extreme caution.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <label htmlFor="admin-email" className="text-sm font-medium">
            User Email
          </label>
          <Input
            id="admin-email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleAssignAdmin}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Assigning...' : 'Assign Admin Role'}
        </Button>

        <div className="text-xs text-muted-foreground">
          <p><strong>Security Note:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>All role assignments are logged for audit purposes</li>
            <li>Users cannot self-assign admin privileges</li>
            <li>Only existing admins can grant admin access</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}