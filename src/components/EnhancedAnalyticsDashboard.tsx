import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Users, 
  Eye,
  Heart,
  Share,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  topPages: Array<{ page: string; views: number; }>;
  trafficSources: Array<{ source: string; visitors: number; }>;
  deviceTypes: Array<{ device: string; count: number; }>;
  timeData: Array<{ time: string; views: number; users: number; }>;
}

interface SocialMetrics {
  platform: string;
  followers: number;
  engagement: number;
  reach: number;
  posts: number;
  trending: 'up' | 'down' | 'neutral';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function EnhancedAnalyticsDashboard() {
  const { events, performance } = useAnalytics();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    pageViews: 0,
    uniqueVisitors: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    conversionRate: 0,
    topPages: [],
    trafficSources: [],
    deviceTypes: [],
    timeData: []
  });
  const [socialMetrics, setSocialMetrics] = useState<SocialMetrics[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
    loadSocialMetrics();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock analytics data - in production this would come from your analytics service
      const mockData: AnalyticsData = {
        pageViews: 12450,
        uniqueVisitors: 8930,
        avgSessionDuration: 245,
        bounceRate: 32,
        conversionRate: 4.2,
        topPages: [
          { page: '/articles', views: 3420 },
          { page: '/insights', views: 2150 },
          { page: '/services', views: 1890 },
          { page: '/about', views: 1220 },
          { page: '/contact', views: 780 }
        ],
        trafficSources: [
          { source: 'Direct', visitors: 3500 },
          { source: 'LinkedIn', visitors: 2800 },
          { source: 'Google', visitors: 1900 },
          { source: 'Twitter', visitors: 450 },
          { source: 'Referral', visitors: 280 }
        ],
        deviceTypes: [
          { device: 'Desktop', count: 5200 },
          { device: 'Mobile', count: 3100 },
          { device: 'Tablet', count: 630 }
        ],
        timeData: [
          { time: '6 days ago', views: 1200, users: 850 },
          { time: '5 days ago', views: 1450, users: 920 },
          { time: '4 days ago', views: 1800, users: 1100 },
          { time: '3 days ago', views: 2100, users: 1250 },
          { time: '2 days ago', views: 1950, users: 1180 },
          { time: 'Yesterday', views: 2200, users: 1340 },
          { time: 'Today', views: 1750, users: 1080 }
        ]
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSocialMetrics = async () => {
    try {
      // Mock social metrics - in production this would aggregate from your social media APIs
      const mockMetrics: SocialMetrics[] = [
        {
          platform: 'LinkedIn',
          followers: 8450,
          engagement: 6.8,
          reach: 15600,
          posts: 24,
          trending: 'up'
        },
        {
          platform: 'Twitter',
          followers: 3200,
          engagement: 4.2,
          reach: 8900,
          posts: 18,
          trending: 'down'
        },
        {
          platform: 'Instagram',
          followers: 2100,
          engagement: 8.1,
          reach: 5200,
          posts: 12,
          trending: 'up'
        }
      ];

      setSocialMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading social metrics:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getTrendIcon = (trending: string) => {
    switch (trending) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mr-3" />
          <span>Loading analytics data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enhanced Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights across all platforms and user interactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.pageViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  +12% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.uniqueVisitors.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  +8% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(analyticsData.avgSessionDuration)}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  -3% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.bounceRate}%</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-green-600" />
                  -2% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.conversionRate}%</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  +0.3% from last period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Traffic Trends
              </CardTitle>
              <CardDescription>Page views and unique visitors over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={analyticsData.timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="users" stroke="#82ca9d" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Pages
                </CardTitle>
                <CardDescription>Most visited pages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.topPages}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="page" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Traffic Sources
                </CardTitle>
                <CardDescription>Where your visitors come from</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip />
                    <Pie
                      data={analyticsData.trafficSources}
                      dataKey="visitors"
                      nameKey="source"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                    >
                      {Array.isArray(analyticsData.trafficSources) && analyticsData.trafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
                
                <div className="mt-4 space-y-2">
                  {Array.isArray(analyticsData.trafficSources) && analyticsData.trafficSources.map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{source.source}</span>
                      </div>
                      <span className="text-sm font-medium">{source.visitors.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Device Types */}
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>Visitor device types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.isArray(analyticsData.deviceTypes) && analyticsData.deviceTypes.map((device, index) => (
                  <div key={device.device} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{device.device}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ 
                            width: `${analyticsData.deviceTypes.length > 0 ? (device.count / Math.max(...analyticsData.deviceTypes.map(d => d.count))) * 100 : 0}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {device.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {socialMetrics.map((metric) => (
              <Card key={metric.platform}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.platform}</CardTitle>
                  {getTrendIcon(metric.trending)}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Followers</p>
                    <p className="text-lg font-bold">{metric.followers.toLocaleString()}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Engagement</p>
                      <p className="font-medium">{metric.engagement}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reach</p>
                      <p className="font-medium">{metric.reach.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Posts this month</span>
                    <Badge variant="outline">{metric.posts}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cross-Platform Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>Cross-Platform Performance</CardTitle>
              <CardDescription>Compare engagement across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={socialMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="engagement" fill="#8884d8" name="Engagement %" />
                  <Bar dataKey="reach" fill="#82ca9d" name="Reach" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Page Load Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performance?.pageLoadTime ? Math.round(performance.pageLoadTime) : 'N/A'}ms
                </div>
                <p className="text-xs text-muted-foreground">Average load time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>First Contentful Paint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performance?.firstContentfulPaint ? Math.round(performance.firstContentfulPaint) : 'N/A'}ms
                </div>
                <p className="text-xs text-muted-foreground">Time to first content</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Largest Contentful Paint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performance?.largestContentfulPaint ? Math.round(performance.largestContentfulPaint) : 'N/A'}ms
                </div>
                <p className="text-xs text-muted-foreground">Time to main content</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>Recommendations to improve site performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Excellent Core Web Vitals</p>
                    <p className="text-sm text-muted-foreground">Your site meets Google's performance standards</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded">
                  <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Optimize Images</p>
                    <p className="text-sm text-muted-foreground">Consider using WebP format for better compression</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border rounded">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Reduce JavaScript Bundle</p>
                    <p className="text-sm text-muted-foreground">Split code to improve initial load times</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}