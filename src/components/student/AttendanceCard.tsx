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
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface SubjectAttendance {
  id: string
  subject: string
  subjectCode: string
  totalClasses: number
  attendedClasses: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
}

interface MonthlyAttendance {
  month: string
  attendance: number
  target: number
}

const getAttendanceColor = (percentage: number) => {
  if (percentage >= 75) return 'text-green-600 dark:text-green-400'
  if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

const getAttendanceBadgeVariant = (percentage: number): "default" | "secondary" | "destructive" => {
  if (percentage >= 75) return 'default'
  if (percentage >= 60) return 'secondary'
  return 'destructive'
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 75) return 'bg-green-500'
  if (percentage >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

export default function AttendanceCard() {
  const [attendanceData, setAttendanceData] = useState<SubjectAttendance[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyAttendance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttendanceData()
  }, [])

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch('/api/student/attendance')
      const data = await response.json()
      setAttendanceData(data.subjects || [])
      setMonthlyTrend(data.monthlyTrend || [])
    } catch (error) {
      console.error('Failed to fetch attendance data:', error)
      // Set demo data
      setAttendanceData([
        {
          id: '1',
          subject: 'Data Structures & Algorithms',
          subjectCode: 'CS301',
          totalClasses: 45,
          attendedClasses: 42,
          percentage: 93,
          trend: 'up',
        },
        {
          id: '2',
          subject: 'Database Management Systems',
          subjectCode: 'CS302',
          totalClasses: 42,
          attendedClasses: 38,
          percentage: 90,
          trend: 'stable',
        },
        {
          id: '3',
          subject: 'Operating Systems',
          subjectCode: 'CS303',
          totalClasses: 40,
          attendedClasses: 35,
          percentage: 87,
          trend: 'up',
        },
        {
          id: '4',
          subject: 'Computer Networks',
          subjectCode: 'CS304',
          totalClasses: 38,
          attendedClasses: 30,
          percentage: 79,
          trend: 'down',
        },
        {
          id: '5',
          subject: 'Software Engineering',
          subjectCode: 'CS305',
          totalClasses: 35,
          attendedClasses: 25,
          percentage: 71,
          trend: 'down',
        },
        {
          id: '6',
          subject: 'Machine Learning',
          subjectCode: 'CS306',
          totalClasses: 30,
          attendedClasses: 18,
          percentage: 60,
          trend: 'stable',
        },
      ])

      setMonthlyTrend([
        { month: 'Jan', attendance: 82, target: 75 },
        { month: 'Feb', attendance: 85, target: 75 },
        { month: 'Mar', attendance: 78, target: 75 },
        { month: 'Apr', attendance: 88, target: 75 },
        { month: 'May', attendance: 90, target: 75 },
        { month: 'Jun', attendance: 87, target: 75 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
          <CardDescription>Loading attendance data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Attendance Overview
          <Badge variant="outline" className="ml-2">
            {attendanceData.length} Subjects
          </Badge>
        </CardTitle>
        <CardDescription>
          Subject-wise attendance with monthly trend analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monthly Trend Chart */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Monthly Attendance Trend
          </h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Attendance']}
                />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#attendanceGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#9ca3af"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-emerald-500"></div>
              <span>Your Attendance</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-gray-400 border-dashed"></div>
              <span>Target (75%)</span>
            </div>
          </div>
        </div>

        {/* Subject-wise Attendance Table */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Subject-wise Attendance
          </h4>
          <ScrollArea className="h-72 rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Code</TableHead>
                  <TableHead className="text-center">Attended</TableHead>
                  <TableHead className="text-center">Percentage</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{subject.subject}</span>
                        {getTrendIcon(subject.trend)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-gray-500">
                      {subject.subjectCode}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm">
                        {subject.attendedClasses}/{subject.totalClasses}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16">
                          <Progress
                            value={subject.percentage}
                            className="h-2"
                          />
                        </div>
                        <span
                          className={`text-sm font-medium ${getAttendanceColor(
                            subject.percentage
                          )}`}
                        >
                          {subject.percentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getAttendanceBadgeVariant(subject.percentage)}>
                        {subject.percentage >= 75
                          ? 'Good'
                          : subject.percentage >= 60
                          ? 'Warning'
                          : 'Critical'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Good (≥75%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Warning (60-74%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Critical (&lt;60%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
