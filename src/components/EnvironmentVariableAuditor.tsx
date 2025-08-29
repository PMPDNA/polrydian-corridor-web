import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { safeEnv } from '@/lib/safe-utils';

interface EnvCheck {
  name: string;
  required: boolean;
  present: boolean;
  type: 'url' | 'key' | 'boolean' | 'string';
  description: string;
  recommendation?: string;
}

export const EnvironmentVariableAuditor = () => {
  const [envChecks, setEnvChecks] = useState<EnvCheck[]>([]);
  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    const checks: EnvCheck[] = [
      {
        name: 'VITE_SUPABASE_URL',
        required: true,
        present: !!safeEnv.get('VITE_SUPABASE_URL'),
        type: 'url',
        description: 'Supabase project URL',
        recommendation: 'Should start with https://'
      },
      {
        name: 'VITE_SUPABASE_ANON_KEY',
        required: true,
        present: !!safeEnv.get('VITE_SUPABASE_ANON_KEY'),
        type: 'key',
        description: 'Supabase anonymous key',
        recommendation: 'Long JWT token for client-side access'
      },
      {
        name: 'DEV',
        required: false,
        present: safeEnv.isDev(),
        type: 'boolean',
        description: 'Development environment flag'
      },
      {
        name: 'PROD',
        required: false,
        present: safeEnv.isProd(),
        type: 'boolean',
        description: 'Production environment flag'
      }
    ];

    const foundIssues: string[] = [];

    // Check for missing required variables
    checks.forEach(check => {
      if (check.required && !check.present) {
        foundIssues.push(`Missing required environment variable: ${check.name}`);
      }
    });

    // Check URL format
    const supabaseUrl = safeEnv.get('VITE_SUPABASE_URL');
    if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
      foundIssues.push('VITE_SUPABASE_URL should use HTTPS');
    }

    // Check for demo/development values in production
    if (safeEnv.isProd()) {
      if (supabaseUrl?.includes('demo') || supabaseUrl?.includes('localhost')) {
        foundIssues.push('Production environment using demo/development Supabase URL');
      }
      
      const anonKey = safeEnv.get('VITE_SUPABASE_ANON_KEY');
      if (anonKey === 'demo-key' || anonKey?.length < 100) {
        foundIssues.push('Production environment using invalid Supabase key');
      }
    }

    // Check for process.env usage (should be import.meta.env)
    if (typeof window !== 'undefined') {
      const scriptElements = document.querySelectorAll('script');
      let hasProcessEnv = false;
      scriptElements.forEach(script => {
        if (script.textContent?.includes('process.env')) {
          hasProcessEnv = true;
        }
      });
      
      if (hasProcessEnv) {
        foundIssues.push('Code may contain process.env usage - should use import.meta.env');
      }
    }

    setEnvChecks(checks);
    setIssues(foundIssues);
  }, []);

  const getStatusIcon = (check: EnvCheck) => {
    if (check.required && !check.present) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (check.present) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (check: EnvCheck) => {
    if (check.required && !check.present) {
      return <Badge className="bg-red-100 text-red-800">Missing</Badge>;
    }
    if (check.present) {
      return <Badge className="bg-green-100 text-green-800">Present</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">Optional</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables Audit</CardTitle>
        </CardHeader>
        <CardContent>
          {issues.length > 0 && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">Environment Issues Found:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {issues.map((issue, index) => (
                      <li key={index} className="text-sm">{issue}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {envChecks.map((check) => (
              <div key={check.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check)}
                  <div>
                    <div className="font-medium">{check.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {check.description}
                    </div>
                    {check.recommendation && (
                      <div className="text-xs text-blue-600 mt-1">
                        {check.recommendation}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(check)}
                  <div className="text-xs text-muted-foreground mt-1">
                    {check.required ? 'Required' : 'Optional'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Environment Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Current Mode:</span>{' '}
                {safeEnv.isDev() ? 'Development' : 'Production'}
              </div>
              <div>
                <span className="font-medium">Issues Found:</span>{' '}
                <span className={issues.length > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                  {issues.length}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};