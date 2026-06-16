'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  Receipt
} from 'lucide-react'
import { format } from 'date-fns'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'

interface DashboardStats {
  totalFeesCollected: number
  pendingPayments: number
  totalStudents: number
  paidStudents: number
  overdueAmount: number
  collectionRate: number
}

interface FeeTypeBreakdown {
  type: string
  amount: number
  percentage: number
  color: string
}

interface MonthlyTrend {
  month: string
  collected: number
  pending: number
}

interface RecentTransaction {
  id: string
  studentName: string
  amount: number
  type: string
  status: string
  date: string
  receiptNo: string
}

interface DashboardData {
  stats: DashboardStats
  feeTypeBreakdown: FeeTypeBreakdown[]
  monthlyTrend: MonthlyTrend[]
  recentTransactions: RecentTransaction[]
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const chartConfig: ChartConfig = {
  collected: {
    label: "Collected",
    color: "#10b981",
  },
  pending: {
    label: "Pending",
    color: "#f59e0b",
  },
}

const pieChartConfig: ChartConfig = {
  tuition: { label: "Tuition Fee" },
  library: { label: "Library Fee" },
  lab: { label: "Lab Fee" },
  sports: { label: "Sports Fee" },
  hostel: { label: "Hostel Fee" },
  transport: { label: "Transport Fee" },
}

export default function FinanceDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/finance/dashboard')
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const statCards = [
    {
      title: 'Total Collected',
      value: formatCurrency(data?.stats.totalFeesCollected || 0),
      icon: Wallet,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(data?.stats.pendingPayments || 0),
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      trend: '-3.2%',
      trendUp: false,
    },
    {
      title: 'Overdue Amount',
      value: formatCurrency(data?.stats.overdueAmount || 0),
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      trend: '+1.8%',
      trendUp: true,
    },
    {
      title: 'Collection Rate',
      value: `${data?.stats.collectionRate || 0}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      trend: '+5.4%',
      trendUp: true,
    },
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
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
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
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trendUp ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${stat.trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                      {stat.trend}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Fee Type - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-emerald-600" />
              Revenue by Fee Type
            </CardTitle>
            <CardDescription>Distribution of fee collection by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="h-72">
              <PieChart>
                <Pie
                  data={data?.feeTypeBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="amount"
                  nameKey="type"
                >
                  {data?.feeTypeBreakdown?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend 
                  formatter={(value: string) => {
                    const item = data?.feeTypeBreakdown?.find(d => d.type === value)
                    return `${value} (${item?.percentage || 0}%)`
                  }}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Collection Trend - Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Monthly Collection Trend
            </CardTitle>
            <CardDescription>Fee collection over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-72">
              <AreaChart data={data?.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  className="text-xs"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${(value / 1000000).toFixed(1)}M`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-purple-600" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Latest payment activities</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72">
            {data?.recentTransactions && data.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {data.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        transaction.status === 'COMPLETED' 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                          : transaction.status === 'PENDING'
                          ? 'bg-amber-100 dark:bg-amber-900/30'
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        <CreditCard className={`h-5 w-5 ${
                          transaction.status === 'COMPLETED' 
                            ? 'text-emerald-600' 
                            : transaction.status === 'PENDING'
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.studentName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{transaction.type}</span>
                          <span>•</span>
                          <span>{transaction.receiptNo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(transaction.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.date), 'dd MMM yyyy, hh:mm a')}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          transaction.status === 'COMPLETED' 
                            ? 'default' 
                            : transaction.status === 'PENDING'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className={
                          transaction.status === 'COMPLETED' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : transaction.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : ''
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent transactions</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
