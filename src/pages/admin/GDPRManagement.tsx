import { useState, useEffect } from 'react'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Shield, 
  Download, 
  Trash2, 
  Edit, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Search,
  Filter,
  BarChart3,
  Users,
  FileText
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface GDPRRequest {
  id: string
  email?: string
  visitor_id?: string
  request_type: string
  status: string
  reason?: string
  requested_data?: any
  created_at: string
  processed_at?: string
  processed_by?: string
}

interface ConsentRecord {
  id: string
  visitor_id: string
  consent_type: string
  consent_given: boolean
  consent_date: string
  withdrawal_date?: string
  purpose: string
}

interface AnalyticsData {
  total_visitors: number
  total_page_views: number
  consent_rate: number
  top_pages: Array<{ page_url: string; count: number }>
  device_breakdown: Array<{ device_type: string; count: number }>
}

export default function GDPRManagement() {
  const [gdprRequests, setGdprRequests] = useState<GDPRRequest[]>([])
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchGDPRRequests(),
        fetchConsentRecords(),
        fetchAnalyticsData()
      ])
    } catch (error) {
      console.error('Failed to fetch GDPR data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load GDPR management data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGDPRRequests = async () => {
    const { data, error } = await supabase
      .from('gdpr_deletion_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    setGdprRequests(data || [])
  }

  const fetchConsentRecords = async () => {
    const { data, error } = await supabase
      .from('user_consent')
      .select('*')
      .order('consent_date', { ascending: false })
      .limit(100)

    if (error) throw error
    setConsentRecords(data || [])
  }

  const fetchAnalyticsData = async () => {
    // Fetch analytics summary
    const { data: visitors, error: visitorsError } = await supabase
      .from('visitor_analytics')
      .select('visitor_id, page_url, device_type')

    if (visitorsError) throw visitorsError

    const { data: consent, error: consentError } = await supabase
      .from('user_consent')
      .select('visitor_id, consent_given')
      .eq('consent_type', 'analytics')

    if (consentError) throw consentError

    // Process analytics data
    const uniqueVisitors = new Set(visitors?.map(v => v.visitor_id) || []).size
    const totalPageViews = visitors?.length || 0
    const consentGiven = consent?.filter(c => c.consent_given).length || 0
    const consentRate = consent?.length ? (consentGiven / consent.length) * 100 : 0

    // Top pages
    const pageViews = visitors?.reduce((acc: Record<string, number>, visitor) => {
      acc[visitor.page_url] = (acc[visitor.page_url] || 0) + 1
      return acc
    }, {}) || {}

    const topPages = Object.entries(pageViews)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([page_url, count]) => ({ page_url, count }))

    // Device breakdown
    const deviceCounts = visitors?.reduce((acc: Record<string, number>, visitor) => {
      const device = visitor.device_type || 'unknown'
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {}) || {}

    const deviceBreakdown = Object.entries(deviceCounts)
      .map(([device_type, count]) => ({ device_type, count }))

    setAnalyticsData({
      total_visitors: uniqueVisitors,
      total_page_views: totalPageViews,
      consent_rate: consentRate,
      top_pages: topPages,
      device_breakdown: deviceBreakdown
    })
  }

  const handleProcessRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const status = action === 'approve' ? 'completed' : 'rejected'
      
      const { error } = await supabase
        .from('gdpr_deletion_requests')
        .update({
          status,
          processed_at: new Date().toISOString(),
          processed_by: 'admin' // In real app, use actual admin user ID
        })
        .eq('id', requestId)

      if (error) throw error

      toast({
        title: 'Success',
        description: `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`
      })

      fetchGDPRRequests()
    } catch (error) {
      console.error('Failed to process request:', error)
      toast({
        title: 'Error',
        description: 'Failed to process request',
        variant: 'destructive'
      })
    }
  }

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const data = {
        gdpr_requests: gdprRequests,
        consent_records: consentRecords,
        analytics_summary: analyticsData,
        export_date: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gdpr-data-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Success',
        description: `Data exported as ${format.toUpperCase()}`
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Processing</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    }
  }

  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'export': return Download
      case 'deletion': return Trash2
      case 'rectification': return Edit
      default: return FileText
    }
  }

  const filteredRequests = gdprRequests.filter(request => {
    const matchesSearch = !searchTerm || 
      request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.visitor_id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <AdminLayout title="GDPR Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading GDPR data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="GDPR Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-8 w-8 text-accent" />
              GDPR Management
            </h1>
            <p className="text-muted-foreground">
              Manage data protection requests, consent records, and privacy compliance
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => exportData('json')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button onClick={() => exportData('csv')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analyticsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Visitors</p>
                    <p className="text-2xl font-bold text-foreground">{analyticsData.total_visitors}</p>
                  </div>
                  <Users className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                    <p className="text-2xl font-bold text-foreground">{analyticsData.total_page_views}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Consent Rate</p>
                    <p className="text-2xl font-bold text-foreground">{analyticsData.consent_rate.toFixed(1)}%</p>
                  </div>
                  <Shield className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">GDPR Requests</p>
                    <p className="text-2xl font-bold text-foreground">{gdprRequests.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">GDPR Requests</TabsTrigger>
            <TabsTrigger value="consent">Consent Records</TabsTrigger>
            <TabsTrigger value="analytics">Analytics Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by email or visitor ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Requests Table */}
            <Card>
              <CardHeader>
                <CardTitle>Data Protection Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRequests.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No requests found</p>
                  ) : (
                    filteredRequests.map((request) => {
                      const RequestIcon = getRequestIcon(request.request_type)
                      return (
                        <div key={request.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <RequestIcon className="h-5 w-5 text-accent mt-1" />
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-foreground capitalize">
                                    {request.request_type} Request
                                  </h3>
                                  {getStatusBadge(request.status)}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {request.email || `Visitor: ${request.visitor_id}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Submitted: {new Date(request.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {request.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleProcessRequest(request.id, 'approve')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleProcessRequest(request.id, 'reject')}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                          {request.reason && (
                            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                              <strong>Reason:</strong> {request.reason}
                            </p>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Consent Records</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Recent consent and withdrawal records from visitors
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {consentRecords.slice(0, 20).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border border-border rounded">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={record.consent_given ? 'default' : 'destructive'}>
                            {record.consent_type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {record.consent_given ? 'Consent Given' : 'Consent Withdrawn'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Visitor: {record.visitor_id} • {new Date(record.consent_date).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{record.purpose}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {analyticsData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Pages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.top_pages.map((page, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-foreground truncate flex-1">
                            {page.page_url}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground ml-2">
                            {page.count} views
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Device Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.device_breakdown.map((device, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-foreground capitalize">
                            {device.device_type}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            {device.count} visitors
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}