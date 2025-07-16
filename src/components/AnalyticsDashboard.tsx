import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, Users, TrendingUp } from 'lucide-react';

export const AnalyticsDashboard = () => {
  const { events, performance } = useAnalytics();

  const pageViews = events.filter(event => event.event === 'page_view').length;
  const uniqueSessions = new Set(events.map(event => event.sessionId)).size;
  const avgLoadTime = performance ? Math.round(performance.pageLoadTime) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Page Views</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pageViews}</div>
          <p className="text-xs text-muted-foreground">
            Total page views
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sessions</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueSessions}</div>
          <p className="text-xs text-muted-foreground">
            Unique sessions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Load Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgLoadTime}ms</div>
          <p className="text-xs text-muted-foreground">
            Average load time
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {performance?.firstContentfulPaint ? Math.round(performance.firstContentfulPaint) : 0}ms
          </div>
          <p className="text-xs text-muted-foreground">
            First contentful paint
          </p>
        </CardContent>
      </Card>
    </div>
  );
};