import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const StagingBanner: React.FC = () => {
  // Check if we're in staging environment
  const isStaging = typeof window !== 'undefined' && 
    (window.location.hostname.includes('staging') || 
     window.location.hostname.includes('lovableproject.com'));

  if (!isStaging) {
    return null;
  }

  return (
    <div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 relative z-50">
      <AlertTriangle className="h-4 w-4" />
      <span>
        🚧 STAGING ENVIRONMENT - This is a development version of the site
      </span>
    </div>
  );
};