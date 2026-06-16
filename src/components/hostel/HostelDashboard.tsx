'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Building2,
  DoorOpen,
  Users,
  BedDouble,
  AlertTriangle,
  TrendingUp,
  Wrench,
  Zap,
  Droplet,
  Sofa,
  Sparkles,
  MoreHorizontal
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'

// Types
interface DashboardStats {
  totalHostels: number
  totalRooms: number
  occupiedRooms: number
  availableBeds: number
  totalBeds: number
  occupancyRate: number
  pendingComplaints: number
}

interface HostelOccupancy {
  name: string
  occupied: number
  available: number
  total: number
  occupancyRate: number
}

interface Complaint {
  id: string
  category: string
  description: string
  status: string
  roomNumber: string
  hostelName: string
  createdAt: string
  studentName?: string
}

const COLORS = {
  occupied: '#10B981',
  available: '#6B7280',
  pending: '#F59E0B',
  in_progress: '#3B82F6',
  resolved: '#10B981'
}

const categoryIcons: Record<string, React.ReactNode> = {
  electrical: <Zap className="h-4 w-4" />,
  plumbing: <Droplet className="h-4 w-4" />,
  furniture: <Sofa className="h-4 w-4" />,
  cleaning: <Sparkles className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />
}

const chartConfig = {
  occupied: {
    label: 'Occupied',
    color: '#10B981'
  },
  available: {
    label: 'Available',
    color: '#6B7280'
  }
}

export default function HostelDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [hostelData, setHostelData] = useState<HostelOccupancy[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hostel/dashboard')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data.stats)
        setHostelData(data.data.hostelOccupancy)
        setComplaints(data.data.recentComplaints)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const occupancyPieData = stats ? [
    { name: 'Occupied', value: stats.occupiedRooms, color: COLORS.occupied },
    { name: 'Available', value: stats.totalRooms - stats.occupiedRooms, color: COLORS.available }
  ] : []

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hostels</p>
                <p className="text-3xl font-bold text-foreground">{stats?.totalHostels || 0}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <Building2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Rooms</p>
                <p className="text-3xl font-bold text-foreground">{stats?.totalRooms || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DoorOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupied Rooms</p>
                <p className="text-3xl font-bold text-foreground">{stats?.occupiedRooms || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Beds</p>
                <p className="text-3xl font-bold text-foreground">{stats?.availableBeds || 0}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <BedDouble className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Occupancy Rate Gauge */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Overall Occupancy Rate
            </CardTitle>
            <CardDescription>Current bed occupancy across all hostels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={occupancyPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {occupancyPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-foreground">
                      {stats?.occupancyRate || 0}%
                    </span>
                    <p className="text-xs text-muted-foreground">Occupancy</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-muted-foreground">Occupied ({stats?.occupiedRooms})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-sm text-muted-foreground">Available ({stats?.totalRooms ? stats.totalRooms - stats.occupiedRooms : 0})</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hostel-wise Occupancy Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Hostel-wise Occupancy
            </CardTitle>
            <CardDescription>Room occupancy by hostel</CardDescription>
          </CardHeader>
          <CardContent>
            {hostelData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-64">
                <BarChart data={hostelData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={80} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="occupied" stackId="a" fill="var(--color-occupied)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="available" stackId="a" fill="var(--color-available)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No hostel data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Complaints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Recent Complaints
            {stats?.pendingComplaints ? (
              <Badge variant="secondary" className="ml-2">
                {stats.pendingComplaints} pending
              </Badge>
            ) : null}
          </CardTitle>
          <CardDescription>Latest hostel maintenance requests</CardDescription>
        </CardHeader>
        <CardContent>
          {complaints.length > 0 ? (
            <ScrollArea className="h-72">
              <div className="space-y-3">
                {complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-muted">
                      {categoryIcons[complaint.category] || <Wrench className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground capitalize">
                          {complaint.category}
                        </p>
                        <Badge variant="outline" className={getStatusColor(complaint.status)}>
                          {complaint.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {complaint.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Room {complaint.roomNumber}</span>
                        <span>•</span>
                        <span>{complaint.hostelName}</span>
                        <span>•</span>
                        <span>{formatDate(complaint.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              No complaints found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
