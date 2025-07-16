import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { migrateLegacyData, clearLegacyData, hasLegacyData } from '@/utils/dataMigration'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

export default function DataMigrationNotice() {
  const [showNotice, setShowNotice] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationComplete, setMigrationComplete] = useState(false)
  const { user } = useSupabaseAuth()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user has legacy data that needs migration
    if (user && hasLegacyData()) {
      setShowNotice(true)
    }
  }, [user])

  const handleMigration = async () => {
    if (!user) return

    setIsMigrating(true)
    
    try {
      const success = await migrateLegacyData(user.id)
      
      if (success) {
        // Clear legacy data after successful migration
        clearLegacyData()
        
        setMigrationComplete(true)
        setShowNotice(false)
        
        toast({
          title: "Migration Successful",
          description: "Your data has been securely migrated to the database. You can now enjoy enhanced security features!",
        })
      } else {
        throw new Error('Migration failed')
      }
    } catch (error) {
      console.error('Migration error:', error)
      toast({
        title: "Migration Failed",
        description: "There was an issue migrating your data. Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsMigrating(false)
    }
  }

  const handleDismiss = () => {
    setShowNotice(false)
    toast({
      title: "Migration Skipped",
      description: "You can migrate your data later from the profile settings.",
      variant: "destructive",
    })
  }

  if (!showNotice || migrationComplete) {
    return null
  }

  return (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Database className="h-5 w-5" />
          Data Migration Available
        </CardTitle>
        <CardDescription>
          We've upgraded to a more secure database system. Migrate your data now for enhanced security.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Improvements:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Row-Level Security (RLS) protection</li>
              <li>• Encrypted data storage</li>
              <li>• Role-based access control</li>
              <li>• Elimination of client-side password storage</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>What will be migrated:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Published articles and drafts</li>
              <li>• Legacy authentication data will be removed</li>
              <li>• Local storage will be cleaned up</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          <Button 
            onClick={handleMigration} 
            disabled={isMigrating}
            className="gap-2"
          >
            {isMigrating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Migrate Now
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDismiss}
            disabled={isMigrating}
          >
            Skip for Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}