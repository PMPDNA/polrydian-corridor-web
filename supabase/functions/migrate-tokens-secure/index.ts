import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Health check endpoint
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ status: 'healthy', service: 'migrate-tokens-secure' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('🔄 Starting secure token migration...')

    // Call the migration function
    const { data, error } = await supabase.rpc('migrate_existing_tokens')

    if (error) {
      console.error('❌ Migration error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Migration failed', 
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`✅ Migration completed. Migrated ${data} tokens.`)

    // Log the migration event
    await supabase.from('security_audit_log').insert({
      action: 'token_migration_executed',
      details: {
        migrated_count: data,
        timestamp: new Date().toISOString(),
        severity: 'high'
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully migrated ${data} tokens to enhanced encryption`,
        migrated_count: data
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Migration function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})