'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Bus,
  Route,
  Users,
  TrendingUp,
  MapPin,
  Gauge
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface DashboardStats {
  totalBuses: number
  totalRoutes: number
  activeRoutes: number
  studentsUsingTransport: number
  busCapacityUtilization: number
}

interface RouteStudentCount {
  routeName: string
  students: number
}

interface DashboardData {
  stats: DashboardStats
  routeWiseStudents: RouteStudentCount[]
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#6366F1']

export default function TransportDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/transport/dashboard')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Buses',
      value: data?.stats.totalBuses || 0,
      icon: Bus,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
      title: 'Total Routes',
      value: data?.stats.totalRoutes || 0,
      icon: Route,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Active Routes',
      value: data?.stats.activeRoutes || 0,
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Students Using Transport',
      value: data?.stats.studentsUsingTransport || 0,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Capacity Utilization and Route Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bus Capacity Utilization */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gauge className="h-5 w-5 text-emerald-600" />
              Bus Capacity Utilization
            </CardTitle>
            <CardDescription>Overall seating capacity usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Utilization Rate</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {data?.stats.busCapacityUtilization || 0}%
                </span>
              </div>
              <Progress value={data?.stats.busCapacityUtilization || 0} className="h-4" />
              <div className="grid grid-cols-3 gap-2 pt-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Excellent</p>
                  <p className="text-sm font-medium text-emerald-600">80%+</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Good</p>
                  <p className="text-sm font-medium text-blue-600">60-80%</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Needs Attention</p>
                  <p className="text-sm font-medium text-orange-600">&lt;60%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Route-wise Students Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Route-wise Students
            </CardTitle>
            <CardDescription>Student distribution by route</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.routeWiseStudents && data.routeWiseStudents.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.routeWiseStudents}
                    margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="routeName"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 10 }}
                      height={60}
                      className="text-muted-foreground"
                    />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="students" radius={[4, 4, 0, 0]}>
                      {data.routeWiseStudents.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Route className="h-12 w-12 mb-2 opacity-50" />
                <p>No route data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transport Overview</CardTitle>
          <CardDescription>Quick summary of transport operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <Bus className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Buses</p>
                <p className="font-semibold">{data?.stats.totalBuses || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Route className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Route Coverage</p>
                <p className="font-semibold">{((data?.stats.activeRoutes || 0) / Math.max(data?.stats.totalRoutes || 1, 1) * 100).toFixed(0)}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Students/Route</p>
                <p className="font-semibold">
                  {data?.stats.totalRoutes
                    ? Math.round((data?.stats.studentsUsingTransport || 0) / data.stats.totalRoutes)
                    : 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Gauge className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Capacity Status</p>
                <Badge variant={data?.stats.busCapacityUtilization && data.stats.busCapacityUtilization >= 80 ? 'default' : 'secondary'}>
                  {data?.stats.busCapacityUtilization && data.stats.busCapacityUtilization >= 80 ? 'Optimal' : 'Available'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
