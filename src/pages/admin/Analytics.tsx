import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Users, Eye, BarChart3, Globe2, Activity, MousePointer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AdminLayout } from "@/layouts/AdminLayout";
import { Link } from "react-router-dom";

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const fetchAnalytics = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (timeRange === '7d' ? 7 : 28));

      // Fetch visitor analytics
      const { data: visitorData } = await supabase
        .from('visitor_analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Fetch consultation bookings
      const { count: recentBookingsCount } = await supabase
        .from('consultation_bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Process data for charts
      const dailyVisits = {};
      const topPages = {};
      const referrers = {};

      visitorData?.forEach(visit => {
        const date = new Date(visit.created_at).toISOString().split('T')[0];
        dailyVisits[date] = (dailyVisits[date] || 0) + 1;
        if (visit.page_url) {
          topPages[visit.page_url] = (topPages[visit.page_url] || 0) + 1;
        }
        if (visit.referrer) {
          referrers[visit.referrer] = (referrers[visit.referrer] || 0) + 1;
        }
      });

      const chartData = Object.entries(dailyVisits).map(([date, visits]) => ({
        date: new Date(date).toLocaleDateString(),
        visits
      }));

      setAnalytics({
        totalVisits: visitorData?.length || 0,
        recentBookings: recentBookingsCount || 0,
        chartData,
        topPages: Object.entries(topPages).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5),
        topReferrers: Object.entries(referrers).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <AdminLayout title="Analytics Dashboard">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics Dashboard">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <div className="flex gap-2">
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              onClick={() => setTimeRange('7d')}
            >
              7 Days
            </Button>
            <Button
              variant={timeRange === '28d' ? 'default' : 'outline'}
              onClick={() => setTimeRange('28d')}
            >
              28 Days
            </Button>
            <Button onClick={fetchAnalytics} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalVisits || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Daily Visits</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((analytics?.totalVisits || 0) / (timeRange === '7d' ? 7 : 28))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultation Requests</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.recentBookings || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Visits Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="visits" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics?.topPages?.map(([page, visits], index) => (
                  <div key={page} className="flex justify-between items-center">
                    <span className="text-sm truncate">{page}</span>
                    <span className="text-sm font-medium">{visits}</span>
                  </div>
                )) || <p className="text-muted-foreground">No data available</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Analytics Actions</CardTitle>
            <CardDescription>
              Manage analytics settings and export data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link to="/admin/performance">
                  <Activity className="h-4 w-4 mr-2" />
                  Performance Monitor
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/insights">
                  <Globe2 className="h-4 w-4 mr-2" />
                  Public Insights
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}