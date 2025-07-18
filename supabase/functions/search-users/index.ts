import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://polrydian.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the request is from an authenticated admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get current user from JWT
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has admin role
    const { data: roles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (roleError || !roles) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { searchTerm } = await req.json()

    if (!searchTerm || typeof searchTerm !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid search term' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Search users by email (secure admin operation)
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      console.error('Error listing users:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to search users' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Filter users by email containing search term
    const filteredUsers = users.users
      .filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 10) // Limit to 10 results
      .map(user => ({
        user_id: user.id,
        email: user.email,
        display_name: user.email?.split('@')[0] // Use email prefix as display name
      }))

    return new Response(
      JSON.stringify({ users: filteredUsers }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in search-users function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})