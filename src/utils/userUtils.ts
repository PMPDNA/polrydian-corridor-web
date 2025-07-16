// Utility to get user display name
export const getUserDisplayName = (user: any) => {
  if (!user) return 'Guest'
  
  // Try to get display name from user metadata first
  if (user.user_metadata?.display_name) {
    return user.user_metadata.display_name
  }
  
  // Try to get name from user metadata
  if (user.user_metadata?.name) {
    return user.user_metadata.name
  }
  
  // Extract name from email for admin users
  if (user.email === 'polrydian@gmail.com') {
    return 'Patrick Misiewicz'
  }
  
  // Default to extracting username from email
  if (user.email) {
    const username = user.email.split('@')[0]
    return username.charAt(0).toUpperCase() + username.slice(1)
  }
  
  return 'User'
}

// Utility to check if user is admin
export const isUserAdmin = (user: any) => {
  return user?.email === 'polrydian@gmail.com'
}