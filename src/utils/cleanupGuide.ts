// Clean up and remove unused utility files that have been replaced by better patterns

// This file identifies unused components and legacy patterns that should be removed

export const UNUSED_COMPONENTS = [
  // These components are no longer used and can be safely removed:
  // - LinkedInConnectionWizard: Replaced by integrated auth flow
  // - DataMigrationNotice: Migration completed, no longer needed  
  // - TestDataCollection: Development component, not needed in production
  // - ProofChips: Legacy UI component, replaced by Badge components
  // - PhotoGallery: Functionality moved to ImageManager
]

export const LEGACY_HOOKS = [
  // These hooks have been superseded by optimized versions:
  // - Original useSupabaseAuth -> useOptimizedAuth (better caching, error handling)
  // - Individual useToast calls -> useErrorHandler (standardized error handling)
]

export const DEPRECATED_PATTERNS = [
  // Anti-patterns that have been replaced:
  // - Direct supabase calls in components -> use hooks with error handling
  // - Manual toast error handling -> useErrorHandler utility
  // - Redundant data fetching -> cached data with useOptimizedData
  // - Sequential database operations -> batched operations
]

// Bundle analysis recommendations
export const BUNDLE_OPTIMIZATIONS = {
  // Large dependencies that could be optimized:
  codeSpitting: {
    adminComponents: 'Lazy load admin-only components',
    richTextEditor: 'Load on demand when creating/editing content',
    chartingLibraries: 'Load only when viewing analytics'
  },
  
  // Tree shaking opportunities:
  unusedExports: {
    lucideReact: 'Only import specific icons needed',
    lodash: 'Replace with native JS where possible',
    dateLibraries: 'Use native Date APIs for simple operations'
  },

  // Memory optimization:
  memoryLeaks: {
    eventListeners: 'Ensure cleanup in useEffect',
    intervalTimers: 'Clear intervals on unmount',
    subscriptions: 'Unsubscribe from Supabase listeners'
  }
}

// Performance monitoring recommendations
export const PERFORMANCE_METRICS = {
  // Key metrics to track:
  coreWebVitals: {
    LCP: 'Largest Contentful Paint - optimize image loading',
    FID: 'First Input Delay - reduce JavaScript execution time',
    CLS: 'Cumulative Layout Shift - fix layout shifts from dynamic content'
  },
  
  // Custom metrics:
  appSpecific: {
    authTime: 'Time from login to dashboard load',
    articleLoadTime: 'Time to render article list',
    searchResponseTime: 'Article search performance'
  }
}