import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  Play, 
  Pause, 
  Settings,
  FileText,
  TrendingUp,
  Globe,
  RefreshCw
} from 'lucide-react';

interface ContentSchedule {
  id: string;
  schedule_type: string;
  frequency_days: number;
  last_executed: string | null;
  next_execution: string | null;
  is_active: boolean;
  config: any;
}

const scheduleTypes = [
  {
    type: 'breaking_news',
    title: 'Breaking News Monitor',
    description: 'Daily monitoring of corridor economics news',
    icon: Globe,
    defaultFrequency: 1
  },
  {
    type: 'curated_article',
    title: 'Curated Articles',
    description: 'AI-generated strategic analysis articles',
    icon: FileText,
    defaultFrequency: 3
  },
  {
    type: 'monthly_summary',
    title: 'Monthly Trend Summary',
    description: 'Comprehensive monthly analysis',
    icon: TrendingUp,
    defaultFrequency: 30
  },
  {
    type: 'enhanced_data_collection',
    title: 'Economic Data Collection',
    description: 'Automated data gathering from multiple sources',
    icon: RefreshCw,
    defaultFrequency: 1
  }
];

export function AutomatedContentScheduler() {
  const [schedules, setSchedules] = useState<ContentSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('content_schedule')
        .select('*')
        .order('schedule_type');

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const createDefaultSchedules = async () => {
    setLoading(true);
    try {
      const defaultSchedules = scheduleTypes.map(type => ({
        schedule_type: type.type,
        frequency_days: type.defaultFrequency,
        is_active: true,
        config: {
          auto_created: true,
          title: type.title,
          description: type.description
        }
      }));

      const { error } = await supabase
        .from('content_schedule')
        .upsert(defaultSchedules, { onConflict: 'schedule_type' });

      if (error) throw error;

      toast({
        title: "Schedules Created",
        description: "Default content automation schedules have been set up.",
      });

      fetchSchedules();
    } catch (error: any) {
      console.error('Error creating schedules:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create schedules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSchedule = async (scheduleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('content_schedule')
        .update({ is_active: !isActive })
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: isActive ? "Schedule Disabled" : "Schedule Enabled",
        description: `Content automation has been ${isActive ? 'disabled' : 'enabled'}.`,
      });

      fetchSchedules();
    } catch (error: any) {
      console.error('Error toggling schedule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update schedule",
        variant: "destructive",
      });
    }
  };

  const executeSchedule = async (scheduleType: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-content-automation', {
        body: { 
          scheduleType,
          forceExecute: true
        }
      });

      if (error) throw error;

      toast({
        title: "Schedule Executed",
        description: `${scheduleType} automation has been triggered manually.`,
      });

      fetchSchedules();
    } catch (error: any) {
      console.error('Error executing schedule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to execute schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScheduleTypeInfo = (type: string) => {
    return scheduleTypes.find(s => s.type === type) || {
      title: type,
      description: 'Custom schedule',
      icon: Settings
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Content Automation</h2>
          <p className="text-muted-foreground">
            Automated content creation and data collection schedules
          </p>
        </div>
        {schedules.length === 0 && (
          <Button onClick={createDefaultSchedules} disabled={loading}>
            Setup Default Schedules
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schedules.map((schedule) => {
          const typeInfo = getScheduleTypeInfo(schedule.schedule_type);
          const IconComponent = typeInfo.icon;
          
          return (
            <Card key={schedule.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{typeInfo.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{typeInfo.description}</p>
                    </div>
                  </div>
                  <Badge variant={schedule.is_active ? "default" : "secondary"}>
                    {schedule.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                      <span>Frequency</span>
                    </div>
                    <span className="font-medium">
                      Every {schedule.frequency_days} day{schedule.frequency_days !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>Last Run</span>
                    </div>
                    <span className="font-medium">{formatDate(schedule.last_executed)}</span>
                  </div>
                </div>

                <div className="text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <Calendar className="h-3 w-3" />
                    <span>Next Execution</span>
                  </div>
                  <span className="font-medium">{formatDate(schedule.next_execution)}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleSchedule(schedule.id, schedule.is_active)}
                    className="flex items-center gap-1"
                  >
                    {schedule.is_active ? (
                      <>
                        <Pause className="h-3 w-3" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3" />
                        Enable
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => executeSchedule(schedule.schedule_type)}
                    disabled={loading}
                    className="flex items-center gap-1"
                  >
                    <Play className="h-3 w-3" />
                    Run Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {schedules.length === 0 && (
        <Card className="text-center p-8">
          <CardContent>
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Schedules Configured</h3>
            <p className="text-muted-foreground mb-4">
              Set up automated content creation and data collection schedules to keep your site updated.
            </p>
            <Button onClick={createDefaultSchedules} disabled={loading}>
              {loading ? 'Setting up...' : 'Create Default Schedules'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}