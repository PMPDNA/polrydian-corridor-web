import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCombinedHeaders } from '../_shared/security.ts'

interface DatabaseResponse {
  data?: any
  error?: any
}

Deno.serve(async (req) => {
  const corsHeaders = getCombinedHeaders()

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role for migration
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Starting secure token migration...')

    // Call the migration function
    const { data, error }: DatabaseResponse = await supabase.rpc('migrate_existing_tokens')

    if (error) {
      console.error('Migration error:', error)
      throw error
    }

    console.log(`Migration completed. Migrated ${data || 0} tokens.`)

    // Log the successful migration
    await supabase.from('security_audit_log').insert({
      action: 'token_migration_executed',
      details: {
        migrated_count: data || 0,
        timestamp: new Date().toISOString(),
        severity: 'medium',
        execution_context: 'edge_function'
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        migratedTokens: data || 0,
        message: 'Token migration completed successfully'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Token migration failed:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Migration failed'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})