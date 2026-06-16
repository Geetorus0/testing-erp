'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Building2, 
  Calendar, 
  TrendingUp, 
  Users, 
  Briefcase, 
  IndianRupee,
  ArrowRight,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'

interface DashboardStats {
  totalCompanies: number
  activeDrives: number
  totalOffers: number
  acceptedOffers: number
  placementPercentage: number
  highestPackage: number
  averagePackage: number
}

interface UpcomingDrive {
  id: string
  title: string
  company: {
    name: string
    logo: string | null
    industry: string | null
  }
  driveDate: Date
  packageMin: number | null
  packageMax: number | null
  lastDate: Date
}

interface DashboardData {
  stats: DashboardStats
  upcomingDrives: UpcomingDrive[]
  driveStatusBreakdown: { status: string; count: number }[]
  packageDistribution: Record<string, number>
}

export default function PlacementDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/placement/dashboard')
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
      title: 'Companies Visited',
      value: data?.stats.totalCompanies || 0,
      icon: Building2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
      title: 'Active Drives',
      value: data?.stats.activeDrives || 0,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Total Offers',
      value: data?.stats.totalOffers || 0,
      icon: Briefcase,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Placement Rate',
      value: `${data?.stats.placementPercentage || 0}%`,
      icon: TrendingUp,
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

      {/* Package Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-emerald-600" />
              Package Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Highest Package</span>
                <span className="text-xl font-bold text-emerald-600">
                  {data?.stats.highestPackage.toFixed(1)} LPA
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Average Package</span>
                <span className="text-xl font-bold text-blue-600">
                  {data?.stats.averagePackage.toFixed(1)} LPA
                </span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-2">Package Distribution</p>
                {data?.packageDistribution && Object.entries(data.packageDistribution).map(([range, count]) => (
                  <div key={range} className="flex items-center justify-between py-1">
                    <span className="text-sm">{range}</span>
                    <Badge variant="secondary">{count} offers</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Placement Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Overall Placement</span>
                  <span className="font-medium">{data?.stats.placementPercentage}%</span>
                </div>
                <Progress value={data?.stats.placementPercentage || 0} className="h-3" />
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-3">Offer Status</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending</span>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      {(data?.stats.totalOffers || 0) - (data?.stats.acceptedOffers || 0)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Accepted</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {data?.stats.acceptedOffers || 0}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Drives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Upcoming Placement Drives
          </CardTitle>
          <CardDescription>Next scheduled drives</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.upcomingDrives && data.upcomingDrives.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingDrives.map((drive, index) => (
                <div
                  key={drive.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{drive.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{drive.company.name}</span>
                        {drive.company.industry && (
                          <>
                            <span>•</span>
                            <span>{drive.company.industry}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-muted-foreground">Package</p>
                      <p className="font-medium">
                        {drive.packageMin && drive.packageMax
                          ? `${drive.packageMin} - ${drive.packageMax} LPA`
                          : drive.packageMin
                          ? `${drive.packageMin}+ LPA`
                          : 'TBD'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Drive Date</p>
                      <p className="font-medium">
                        {format(new Date(drive.driveDate), 'dd MMM yyyy')}
                      </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-orange-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">
                        Apply by {format(new Date(drive.lastDate), 'dd MMM')}
                      </span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No upcoming drives scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
