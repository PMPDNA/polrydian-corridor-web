# Hooks and Components Documentation

## Overview
This document provides comprehensive documentation for the new hooks and components implemented in Phase 4 of the Polrydian Corridor Web application.

## Hooks

### useAdvancedSearch
Advanced search functionality with filtering, relevance scoring, and analytics.

```typescript
const {
  searchResults,
  isLoading,
  error,
  searchHistory,
  performSearch,
  clearHistory
} = useAdvancedSearch();
```

**Features:**
- Full-text search across articles
- Advanced filtering (category, date, status)
- Relevance scoring algorithm
- Search history tracking
- Performance optimization with caching

**Usage Example:**
```typescript
const results = await performSearch('corridor economics', {
  status: 'published',
  dateFrom: new Date('2024-01-01'),
  category: 'analysis'
});
```

### useRealtimeUpdates
Real-time data synchronization using Supabase subscriptions.

```typescript
const {
  isConnected,
  lastUpdate,
  updateQueue,
  error,
  isPaused,
  addUpdate,
  clearQueue,
  pauseUpdates,
  resumeUpdates,
  subscribeToTable,
  unsubscribe
} = useRealtimeUpdates();
```

**Features:**
- WebSocket connection management
- Table-specific subscriptions
- Update queue for batch processing
- Pause/resume functionality for mobile optimization
- Automatic reconnection handling

**Usage Example:**
```typescript
// Subscribe to article updates
const unsubscribe = subscribeToTable('articles', (update) => {
  console.log('Article updated:', update);
});

// Pause updates for battery saving
pauseUpdates();
```

### useOfflineSupport
Offline functionality with intelligent caching and sync.

```typescript
const {
  isOnline,
  cacheSize,
  networkStatus,
  cacheData,
  getCachedData,
  clearCache,
  syncWhenOnline
} = useOfflineSupport();
```

**Features:**
- Network status detection
- Intelligent data caching
- Automatic synchronization
- Cache size management
- Offline indicators

**Usage Example:**
```typescript
// Cache important data
await cacheData('articles', articlesData, 3600); // Cache for 1 hour

// Retrieve when offline
const cachedArticles = await getCachedData('articles');
```

### usePerformanceMonitoring
Comprehensive performance tracking and optimization insights.

```typescript
const {
  coreVitals,
  customMetrics,
  performanceScore,
  bundleAnalysis,
  insights,
  budget,
  trackRender,
  trackInteraction,
  trackRouteChange
} = usePerformanceMonitoring();
```

**Features:**
- Core Web Vitals monitoring (LCP, FID, CLS, FCP, TTFB)
- Custom metrics tracking
- Performance score calculation
- Bundle analysis and optimization suggestions
- Mobile performance considerations

**Usage Example:**
```typescript
// Track component renders
useEffect(() => {
  trackRender();
}, []);

// Track user interactions
const handleClick = () => {
  const start = Date.now();
  // ... handle click
  trackInteraction(Date.now() - start);
};
```

### useSearchAnalytics
Search behavior analytics and optimization insights.

```typescript
const {
  analytics,
  isLoading,
  trackSearch,
  trackResultClick,
  loadAnalytics,
  getSearchSuggestions,
  clearAnalytics
} = useSearchAnalytics();
```

**Features:**
- Search query tracking
- Click-through rate analysis
- Popular queries identification
- Search suggestions based on history
- Performance metrics

**Usage Example:**
```typescript
// Track search queries
await trackSearch('supply chain', 15, 250, { category: 'economics' });

// Track result interactions
await trackResultClick('supply chain', 'article-123', 'Supply Chain Analysis');

// Get smart suggestions
const suggestions = getSearchSuggestions('sup'); // Returns ['supply chain', 'support']
```

## Components

### AdvancedSearchComponent
Complete search interface with filters and suggestions.

```typescript
<AdvancedSearchComponent
  onSearch={(query, filters) => handleSearch(query, filters)}
  placeholder="Search articles, insights, and more..."
  showFilters={true}
  showSuggestions={true}
/>
```

**Features:**
- Search input with autocomplete
- Advanced filter panel
- Search suggestions
- Recent searches
- Mobile-optimized interface

### RealtimeIndicator
Visual indicator for real-time connection status.

```typescript
<RealtimeIndicator
  showDetails={true}
  className="fixed top-4 right-4"
/>
```

**Features:**
- Connection status visualization
- Last update timestamp
- Update queue count
- Error state indication
- Customizable styling

### OfflineIndicator
Offline status and cache information display.

```typescript
<OfflineIndicator
  showCacheInfo={true}
  onClearCache={() => clearOfflineCache()}
/>
```

**Features:**
- Online/offline status
- Cache size information
- Manual cache management
- Network quality indicator
- Sync status

### PerformanceDashboard
Comprehensive performance monitoring interface.

```typescript
<PerformanceDashboard />
```

**Features:**
- Core Web Vitals visualization
- Performance score breakdown
- Custom metrics display
- Bundle analysis insights
- Optimization recommendations
- Mobile performance indicators

### SearchAnalyticsDashboard
Search analytics and insights visualization.

```typescript
<SearchAnalyticsDashboard />
```

**Features:**
- Search statistics overview
- Popular queries ranking
- Click-through rate analysis
- Performance trends
- Search optimization insights

### MobileOptimizations
Mobile-specific optimizations and controls.

```typescript
<MobileOptimizations />
```

**Features:**
- Battery status monitoring
- Network quality detection
- Data saver mode controls
- Performance optimization toggles
- Mobile-specific alerts

### IntegrationTestSuite
Automated testing interface for all integrations.

```typescript
<IntegrationTestSuite />
```

**Features:**
- Automated test execution
- Real-time test progress
- Detailed test results
- Integration health monitoring
- Quick troubleshooting tools

## Integration Patterns

### Error Handling
All hooks implement consistent error handling:

```typescript
const { data, error, isLoading } = useHook();

if (error) {
  // Error state handling
  return <ErrorComponent message={error} />;
}

if (isLoading) {
  // Loading state
  return <LoadingSpinner />;
}
```

### Caching Strategy
Smart caching implemented across hooks:

```typescript
// 1. Memory cache for immediate access
// 2. SessionStorage for tab-level persistence
// 3. LocalStorage for cross-session persistence
// 4. IndexedDB for large datasets (future)
```

### Mobile Optimization
All components are mobile-first:

```typescript
// Responsive design
// Touch-optimized interactions
// Battery and network awareness
// Reduced data usage options
```

### Performance Considerations
Built-in performance optimizations:

```typescript
// Debounced search inputs
// Virtualized large lists
// Lazy loading of heavy components
// Efficient re-render prevention
```

## Best Practices

### Hook Usage
1. **Always handle loading and error states**
2. **Use cleanup functions to prevent memory leaks**
3. **Implement proper dependency arrays**
4. **Consider mobile limitations**

### Component Implementation
1. **Use semantic HTML and ARIA labels**
2. **Implement keyboard navigation**
3. **Provide clear visual feedback**
4. **Handle edge cases gracefully**

### Performance Optimization
1. **Monitor Core Web Vitals regularly**
2. **Use React.memo() for expensive components**
3. **Implement proper key props for lists**
4. **Optimize bundle size with code splitting**

### Search Implementation
1. **Implement debounced search inputs**
2. **Cache frequent queries**
3. **Provide relevant suggestions**
4. **Track search analytics**

### Real-time Features
1. **Handle connection failures gracefully**
2. **Implement proper cleanup**
3. **Use selective subscriptions**
4. **Consider mobile battery impact**

## Testing

### Unit Tests
```typescript
// Test individual hook functionality
import { renderHook } from '@testing-library/react-hooks';
import { useAdvancedSearch } from './useAdvancedSearch';

test('should perform search', async () => {
  const { result } = renderHook(() => useAdvancedSearch());
  const results = await result.current.performSearch('test');
  expect(results).toHaveLength(0);
});
```

### Integration Tests
Use the built-in `IntegrationTestSuite` component for comprehensive testing of all features.

### Performance Tests
Monitor performance metrics using the `PerformanceDashboard` and set up alerts for regressions.

## Troubleshooting

### Common Issues
1. **Search not working**: Check Supabase permissions and table structure
2. **Real-time disconnected**: Verify WebSocket connectivity
3. **High memory usage**: Check for memory leaks in subscriptions
4. **Slow performance**: Use bundle analyzer to identify bottlenecks

### Debug Tools
- Browser DevTools Performance tab
- React DevTools Profiler
- Network tab for API monitoring
- Console logs with detailed error information

This documentation should be updated as features evolve and new patterns emerge.