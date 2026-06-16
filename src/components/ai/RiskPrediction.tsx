'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  ShieldAlert,
  BarChart3,
} from 'lucide-react'

interface RiskData {
  totalStudents: number
  riskDistribution: {
    low: number
    medium: number
    high: number
  }
  riskPercentage: {
    low: number
    medium: number
    high: number
  }
  trendData: Array<{
    month: string
    low: number
    medium: number
    high: number
  }>
  departmentData: Array<{
    name: string
    low: number
    medium: number
    high: number
    total: number
  }>
  lastUpdated: string
}

const COLORS = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#ef4444',
}

export default function RiskPrediction() {
  const [data, setData] = useState<RiskData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRiskData()
  }, [])

  const fetchRiskData = async () => {
    try {
      const response = await fetch('/api/ai/risk-prediction')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch risk data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const pieData = [
    { name: 'Low Risk', value: data.riskDistribution.low, color: COLORS.low },
    { name: 'Medium Risk', value: data.riskDistribution.medium, color: COLORS.medium },
    { name: 'High Risk', value: data.riskDistribution.high, color: COLORS.high },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Low Risk Card */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Risk</p>
                <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {data.riskDistribution.low}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.riskPercentage.low}% of total students
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medium Risk Card */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medium Risk</p>
                <h3 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {data.riskDistribution.medium}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.riskPercentage.medium}% of total students
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <TrendingUp className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High Risk Card */}
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                <h3 className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {data.riskDistribution.high}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.riskPercentage.high}% of total students
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-emerald-500" />
              Risk Distribution
            </CardTitle>
            <CardDescription>
              Overview of student risk levels across all departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">Low ({data.riskDistribution.low})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-muted-foreground">Medium ({data.riskDistribution.medium})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-muted-foreground">High ({data.riskDistribution.high})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Risk Trend Over Time
            </CardTitle>
            <CardDescription>
              Monthly trend of student risk levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="low" 
                    stroke={COLORS.low} 
                    strokeWidth={2}
                    name="Low Risk"
                    dot={{ fill: COLORS.low }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="medium" 
                    stroke={COLORS.medium} 
                    strokeWidth={2}
                    name="Medium Risk"
                    dot={{ fill: COLORS.medium }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="high" 
                    stroke={COLORS.high} 
                    strokeWidth={2}
                    name="High Risk"
                    dot={{ fill: COLORS.high }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-500" />
            Department-wise Risk Distribution
          </CardTitle>
          <CardDescription>
            Breakdown of risk levels by academic department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.departmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" width={120} className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="low" stackId="a" fill={COLORS.low} name="Low Risk" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" stackId="a" fill={COLORS.medium} name="Medium Risk" />
                <Bar dataKey="high" stackId="a" fill={COLORS.high} name="High Risk" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Total Students Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>Total Students Analyzed: {data.totalStudents.toLocaleString()}</span>
        </div>
        <Badge variant="outline">
          Last Updated: {new Date(data.lastUpdated).toLocaleString()}
        </Badge>
      </div>
    </div>
  )
}
