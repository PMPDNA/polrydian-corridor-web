import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Activity, Download, RefreshCw, Calendar, BarChart3 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface EconomicData {
  date: string
  value: number
  series_id: string
  series_title: string
}

interface SeriesInfo {
  id: string
  title: string
  units: string
  frequency: string
  last_updated: string
  notes: string
}

const popularSeries = [
  { id: 'GDP', title: 'Gross Domestic Product', category: 'Growth' },
  { id: 'UNRATE', title: 'Unemployment Rate', category: 'Labor' },
  { id: 'CPIAUCSL', title: 'Consumer Price Index', category: 'Inflation' },
  { id: 'FEDFUNDS', title: 'Federal Funds Rate', category: 'Monetary' },
  { id: 'DGS10', title: '10-Year Treasury Rate', category: 'Interest Rates' },
  { id: 'DEXUSEU', title: 'USD/EUR Exchange Rate', category: 'Currency' },
  { id: 'PAYEMS', title: 'Total Nonfarm Payrolls', category: 'Labor' },
  { id: 'HOUST', title: 'Housing Starts', category: 'Housing' },
  { id: 'INDPRO', title: 'Industrial Production Index', category: 'Manufacturing' },
  { id: 'RSAFS', title: 'Retail Sales', category: 'Consumer' },
]

export default function FredDashboard() {
  const [economicData, setEconomicData] = useState<EconomicData[]>([])
  const [seriesInfo, setSeriesInfo] = useState<SeriesInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSeries, setSelectedSeries] = useState('UNRATE')
  const [selectedPeriod, setSelectedPeriod] = useState('1y')
  const { toast } = useToast()

  useEffect(() => {
    fetchEconomicData()
  }, [selectedSeries, selectedPeriod])

  const fetchEconomicData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('fetch-economic-insights', {
        body: {
          series_id: selectedSeries,
          period: selectedPeriod
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      setEconomicData(data.observations || [])
      if (data.series_info) {
        setSeriesInfo([data.series_info])
      }

    } catch (error: any) {
      toast({
        title: "Error Fetching Data",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchEconomicData()
    toast({
      title: "Data Refreshed",
      description: "Economic data has been updated with the latest available information.",
    })
  }

  const getCurrentSeriesInfo = () => {
    return seriesInfo.find(s => s.id === selectedSeries) || popularSeries.find(s => s.id === selectedSeries)
  }

  const getLatestValue = () => {
    if (economicData.length === 0) return null
    return economicData[economicData.length - 1]
  }

  const getPreviousValue = () => {
    if (economicData.length < 2) return null
    return economicData[economicData.length - 2]
  }

  const calculateChange = () => {
    const latest = getLatestValue()
    const previous = getPreviousValue()
    if (!latest || !previous) return null
    
    const change = latest.value - previous.value
    const changePercent = ((change / previous.value) * 100)
    
    return {
      absolute: change,
      percent: changePercent,
      isPositive: change >= 0
    }
  }

  const latestValue = getLatestValue()
  const change = calculateChange()
  const currentSeries = getCurrentSeriesInfo()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">FRED Economic Data</h2>
          <p className="text-muted-foreground">
            Real-time economic indicators from the Federal Reserve Economic Data
          </p>
        </div>
        <Button onClick={refreshData} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Controls */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-sm">
          <Select value={selectedSeries} onValueChange={setSelectedSeries}>
            <SelectTrigger>
              <SelectValue placeholder="Select economic indicator" />
            </SelectTrigger>
            <SelectContent>
              {popularSeries.map((series) => (
                <SelectItem key={series.id} value={series.id}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {series.category}
                    </Badge>
                    {series.title}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">3 Months</SelectItem>
            <SelectItem value="6m">6 Months</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
            <SelectItem value="2y">2 Years</SelectItem>
            <SelectItem value="5y">5 Years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestValue ? latestValue.value.toLocaleString() : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentSeries?.title || selectedSeries}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Change</CardTitle>
            {change?.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${change?.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {change ? `${change.isPositive ? '+' : ''}${change.absolute.toFixed(2)}` : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {change ? `${change.isPositive ? '+' : ''}${change.percent.toFixed(2)}%` : 'vs previous period'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestValue ? new Date(latestValue.date).toLocaleDateString() : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              Latest available data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="line" className="space-y-4">
        <TabsList>
          <TabsTrigger value="line">Line Chart</TabsTrigger>
          <TabsTrigger value="area">Area Chart</TabsTrigger>
          <TabsTrigger value="bar">Bar Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="line">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {currentSeries?.title || selectedSeries} Trend
              </CardTitle>
              <CardDescription>
                Historical trend over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={economicData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [value.toLocaleString(), 'Value']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="area">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {currentSeries?.title || selectedSeries} Area
              </CardTitle>
              <CardDescription>
                Area visualization of the economic indicator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={economicData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [value.toLocaleString(), 'Value']}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {currentSeries?.title || selectedSeries} Bars
              </CardTitle>
              <CardDescription>
                Bar chart visualization of recent data points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={economicData.slice(-12)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [value.toLocaleString(), 'Value']}
                    />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Series Information */}
      {currentSeries && (
        <Card>
          <CardHeader>
            <CardTitle>About This Indicator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Series Information</h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Title</dt>
                    <dd className="text-sm">{currentSeries.title}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                    <dd className="text-sm">
                      <Badge variant="outline">{(currentSeries as any).category}</Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Series ID</dt>
                    <dd className="text-sm font-mono">{selectedSeries}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Data Insights</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    This economic indicator provides insights into {currentSeries.title.toLowerCase()} 
                    trends and helps understand the broader economic landscape.
                  </p>
                  <p>
                    Data is sourced from the Federal Reserve Economic Data (FRED) database, 
                    which provides authoritative economic statistics from various government agencies.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {economicData.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground text-center mb-4">
              Unable to fetch economic data for the selected indicator. Please try refreshing or selecting a different series.
            </p>
            <Button onClick={refreshData} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}