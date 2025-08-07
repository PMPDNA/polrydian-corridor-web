import React from 'react';
import { useSearchAnalytics } from '@/hooks/useSearchAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  TrendingUp, 
  MousePointer, 
  BarChart3, 
  RefreshCw,
  Trash2
} from 'lucide-react';

export const SearchAnalyticsDashboard: React.FC = () => {
  const { 
    analytics, 
    isLoading, 
    loadAnalytics, 
    clearAnalytics 
  } = useSearchAnalytics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Search Analytics</h2>
        <div className="space-x-2">
          <Button
            onClick={loadAnalytics}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={clearAnalytics}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Data
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="h-4 w-4" />
              Total Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSearches}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Avg Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageResultsPerQuery}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              Click Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.clickThroughRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Unique Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.popularQueries.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Queries */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Search Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.popularQueries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No search data available</p>
              ) : (
                analytics.popularQueries.map((query, index) => (
                  <div key={query.query} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <span className="text-sm">{query.query}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(query.count / analytics.popularQueries[0]?.count || 1) * 100} 
                        className="w-16 h-2" 
                      />
                      <Badge variant="secondary">{query.count}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="h-5 w-5" />
              Top Clicked Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topClickedResults.map((result, index) => (
                <div key={result.title} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <span className="text-sm">{result.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(result.clicks / analytics.topClickedResults[0]?.clicks || 1) * 100} 
                      className="w-16 h-2" 
                    />
                    <Badge variant="secondary">{result.clicks}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Search Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Search Quality</h4>
              <div className="text-sm text-muted-foreground">
                {analytics.clickThroughRate > 15 ? (
                  <span className="text-green-600">Excellent click-through rate</span>
                ) : analytics.clickThroughRate > 10 ? (
                  <span className="text-yellow-600">Good engagement</span>
                ) : (
                  <span className="text-orange-600">Could improve relevance</span>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Result Coverage</h4>
              <div className="text-sm text-muted-foreground">
                {analytics.averageResultsPerQuery > 5 ? (
                  <span className="text-green-600">Good content coverage</span>
                ) : (
                  <span className="text-orange-600">Consider expanding content</span>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Query Diversity</h4>
              <div className="text-sm text-muted-foreground">
                {analytics.popularQueries.length > 10 ? (
                  <span className="text-green-600">Diverse search patterns</span>
                ) : (
                  <span className="text-blue-600">Building search history</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};