import { sanitizeText } from '@/lib/security'
import { supabase } from '@/integrations/supabase/client'

// Cache for user roles to prevent excessive database calls
const roleCache = new Map<string, { role: string; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Utility to get user display name with XSS protection
export const getUserDisplayName = (user: any) => {
  if (!user) return 'Guest'
  
  // Try to get display name from user metadata first
  if (user.user_metadata?.display_name) {
    return sanitizeText(user.user_metadata.display_name)
  }
  
  // Try to get name from user metadata
  if (user.user_metadata?.name) {
    return sanitizeText(user.user_metadata.name)
  }
  
  // Extract name from email for known admin users
  if (user.email === 'polrydian@gmail.com') {
    return 'Patrick Misiewicz'
  }
  
  // Default to extracting username from email
  if (user.email) {
    const username = user.email.split('@')[0]
    const sanitizedUsername = sanitizeText(username)
    return sanitizedUsername.charAt(0).toUpperCase() + sanitizedUsername.slice(1)
  }
  
  return 'User'
}

// Get user role from database with caching
export const getUserRole = async (userId: string): Promise<string | null> => {
  const cached = roleCache.get(userId)
  const now = Date.now()
  
  // Return cached role if still valid
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.role
  }
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .order('role', { ascending: true }) // Admin first, then moderator, then user
      .limit(1)
      .single()
    
    if (error || !data) {
      // Cache null result to prevent repeated failed queries
      roleCache.set(userId, { role: 'user', timestamp: now })
      return 'user'
    }
    
    // Cache the result
    roleCache.set(userId, { role: data.role, timestamp: now })
    return data.role
  } catch (error) {
    console.warn('Failed to fetch user role:', error)
    return 'user'
  }
}

// Utility to check if user is admin (async version for database queries)
export const isUserAdmin = async (user: any): Promise<boolean> => {
  if (!user?.id) return false
  
  const role = await getUserRole(user.id)
  return role === 'admin'
}

// Synchronous version for immediate checks (uses cache only)
export const isUserAdminSync = (user: any): boolean => {
  if (!user?.id) return false
  
  const cached = roleCache.get(user.id)
  if (!cached) return false
  
  return cached.role === 'admin'
}

// Validate user permissions for sensitive operations
export const validateUserPermissions = async (user: any, requiredRole: 'admin' | 'moderator' | 'user' = 'user'): Promise<boolean> => {
  if (!user) return false
  
  if (requiredRole === 'user') {
    return true // All authenticated users have 'user' role
  }
  
  const userRole = await getUserRole(user.id)
  
  if (requiredRole === 'admin') {
    return userRole === 'admin'
  }
  
  if (requiredRole === 'moderator') {
    return userRole === 'admin' || userRole === 'moderator'
  }
  
  return false
}

// Clear role cache for a specific user (useful after role changes)
export const clearUserRoleCache = (userId: string) => {
  roleCache.delete(userId)
}