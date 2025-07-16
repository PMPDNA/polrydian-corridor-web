import { Navigation } from "@/components/Navigation";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Badge } from "@/components/ui/badge";
import { Calendar, Globe, User, Clock } from "lucide-react";

const Analytics = () => {
  const { events } = useAnalytics();

  const recentEvents = events.slice(-10).reverse();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your website performance and user engagement
          </p>
        </div>

        <div className="space-y-8">
          <AnalyticsDashboard />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No recent activity to display
                  </p>
                ) : (
                  recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {event.event === 'page_view' ? (
                          <Globe className="h-4 w-4 text-blue-500" />
                        ) : (
                          <User className="h-4 w-4 text-green-500" />
                        )}
                        <div>
                          <p className="font-medium">{event.event.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">{event.page}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Analytics;