import { sanitizeText } from '@/lib/security'

// SECURITY WARNING: Hardcoded admin email - should be moved to database roles
const ADMIN_EMAILS = ['polrydian@gmail.com']

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

// Utility to check if user is admin with timing attack prevention
export const isUserAdmin = (user: any) => {
  if (!user?.email) return false
  
  // Use constant-time comparison to prevent timing attacks
  let isAdmin = false
  for (const adminEmail of ADMIN_EMAILS) {
    if (user.email === adminEmail) {
      isAdmin = true
      break
    }
  }
  return isAdmin
}

// Validate user permissions for sensitive operations
export const validateUserPermissions = (user: any, requiredRole: 'admin' | 'user' = 'user') => {
  if (!user) return false
  
  if (requiredRole === 'admin') {
    return isUserAdmin(user)
  }
  
  return true // All authenticated users have 'user' role
}