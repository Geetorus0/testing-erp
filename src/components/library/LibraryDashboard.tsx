'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  IndianRupee,
  BookMarked
} from 'lucide-react'
import { format } from 'date-fns'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface DashboardStats {
  totalBooks: number
  totalCopies: number
  availableCopies: number
  issuedBooks: number
  overdueBooks: number
  totalFineCollected: number
}

interface CategoryData {
  category: string
  count: number
}

interface RecentIssue {
  id: string
  book: { title: string; author: string }
  student: { name: string; rollNumber: string }
  issueDate: Date
  dueDate: Date
  returnDate: Date | null
  status: string
  fine: number
}

interface DashboardData {
  stats: DashboardStats
  categoryDistribution: CategoryData[]
  recentIssues: RecentIssue[]
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export default function LibraryDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/library/dashboard')
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
      title: 'Total Books',
      value: data?.stats.totalBooks || 0,
      subValue: `${data?.stats.totalCopies || 0} copies`,
      icon: BookOpen,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
      title: 'Available Books',
      value: data?.stats.availableCopies || 0,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Books Issued',
      value: data?.stats.issuedBooks || 0,
      icon: BookMarked,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Overdue Books',
      value: data?.stats.overdueBooks || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30'
    },
    {
      title: 'Fine Collected',
      value: `₹${data?.stats.totalFineCollected || 0}`,
      icon: IndianRupee,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  {stat.subValue && (
                    <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Recent Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              Category Distribution
            </CardTitle>
            <CardDescription>Books by category</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.categoryDistribution && data.categoryDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ category, count }) => `${category}: ${count}`}
                    >
                      {data.categoryDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No books added yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recent Issues
            </CardTitle>
            <CardDescription>Latest book transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.recentIssues && data.recentIssues.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {data.recentIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{issue.book.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{issue.student.name}</span>
                        <span>•</span>
                        <span>{issue.student.rollNumber}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">Issue Date</p>
                        <p className="text-sm">{format(new Date(issue.issueDate), 'dd MMM yyyy')}</p>
                      </div>
                      <Badge 
                        variant={issue.status === 'returned' ? 'outline' : issue.status === 'issued' ? 'default' : 'destructive'}
                        className={issue.status === 'returned' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                      >
                        {issue.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recent issues</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
