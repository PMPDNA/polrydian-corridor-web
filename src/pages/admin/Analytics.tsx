import { AdminLayout } from "@/layouts/AdminLayout";
import { EnhancedAnalyticsDashboard } from "@/components/EnhancedAnalyticsDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Globe2, 
  TrendingUp,
  Activity,
  Eye,
  MousePointer
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    totalVisitors: 0,
    totalPageViews: 0,
    topPages: [],
    recentBookings: 0,
    totalArticleViews: 0
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch visitor analytics
      const { data: visitorData } = await supabase
        .from('aggregated_visitor_stats')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      // Fetch recent bookings
      const { count: recentBookingsCount } = await supabase
        .from('consultation_bookings')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Aggregate data
      const totalVisits = visitorData?.reduce((sum, day) => sum + (day.total_visits || 0), 0) || 0;
      const uniqueVisitors = visitorData?.reduce((sum, day) => sum + (day.unique_visitors || 0), 0) || 0;

      setAnalyticsData({
        totalVisitors: uniqueVisitors,
        totalPageViews: totalVisits,
        topPages: [],
        recentBookings: recentBookingsCount || 0,
        totalArticleViews: 0
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    {
      title: "Total Visitors",
      value: analyticsData.totalVisitors.toLocaleString(),
      icon: Users,
      description: "Last 30 days",
      trend: "+12%"
    },
    {
      title: "Page Views",
      value: analyticsData.totalPageViews.toLocaleString(),
      icon: Eye,
      description: "Total page views",
      trend: "+8%"
    },
    {
      title: "Consultation Requests",
      value: analyticsData.recentBookings.toString(),
      icon: MousePointer,
      description: "Recent bookings",
      trend: "+24%"
    },
    {
      title: "Article Views",
      value: analyticsData.totalArticleViews.toLocaleString(),
      icon: FileText,
      description: "Articles engagement",
      trend: "+16%"
    }
  ];

  return (
    <AdminLayout title="Analytics Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Track website performance, visitor engagement, and business metrics.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/insights">
                <Globe2 className="h-4 w-4 mr-2" />
                Public Insights
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{stat.description}</span>
                  <Badge variant="secondary" className="text-green-600">
                    {stat.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Analytics Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Detailed Analytics
            </CardTitle>
            <CardDescription>
              Comprehensive analytics including visitor behavior, content performance, and business metrics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedAnalyticsDashboard />
          </CardContent>
        </Card>

        {/* Admin Actions */}
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
              <Button variant="outline" onClick={() => fetchAnalyticsData()}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}