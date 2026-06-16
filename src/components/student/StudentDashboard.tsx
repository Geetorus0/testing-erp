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
import { Button } from '@/components/ui/button'
import {
  User,
  Calendar,
  BookOpen,
  ClipboardList,
  Clock,
  TrendingUp,
  Target,
  Bell,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface DashboardStats {
  studentName: string
  semester: string
  department: string
  rollNumber: string
  attendancePercentage: number
  cgpa: number
  pendingAssignments: number
  upcomingExams: number
}

const COLORS = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  primary: '#10b981',
  background: '#e5e7eb',
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/student/dashboard')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      // Set default data for demo
      setStats({
        studentName: 'Rahul Sharma',
        semester: '6th Semester',
        department: 'Computer Science & Engineering',
        rollNumber: 'CSE2021001',
        attendancePercentage: 87,
        cgpa: 8.5,
        pendingAssignments: 4,
        upcomingExams: 2,
      })
    } finally {
      setLoading(false)
    }
  }

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return COLORS.green
    if (percentage >= 60) return COLORS.yellow
    return COLORS.red
  }

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 75) return { label: 'Good', variant: 'default' as const }
    if (percentage >= 60) return { label: 'Warning', variant: 'secondary' as const }
    return { label: 'Critical', variant: 'destructive' as const }
  }

  const pieData = stats
    ? [
        { name: 'Attended', value: stats.attendancePercentage, color: getAttendanceColor(stats.attendancePercentage) },
        { name: 'Missed', value: 100 - stats.attendancePercentage, color: COLORS.background },
      ]
    : []

  const quickActions = [
    { label: 'View Schedule', icon: Calendar, color: 'bg-emerald-500 hover:bg-emerald-600' },
    { label: 'My Courses', icon: BookOpen, color: 'bg-teal-500 hover:bg-teal-600' },
    { label: 'Assignments', icon: ClipboardList, color: 'bg-cyan-500 hover:bg-cyan-600' },
    { label: 'Exam Results', icon: Target, color: 'bg-green-500 hover:bg-green-600' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-6 w-6" />
                  <h1 className="text-2xl md:text-3xl font-bold">
                    Welcome back, {stats?.studentName}!
                  </h1>
                </div>
                <p className="text-emerald-100 text-sm md:text-base">
                  {stats?.department} | Roll No: {stats?.rollNumber}
                </p>
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  {stats?.semester}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-emerald-100" />
                <span className="text-sm text-emerald-100">3 new notifications</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Attendance Card */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Attendance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.attendancePercentage}%
                  </div>
                  <Badge
                    variant={getAttendanceStatus(stats?.attendancePercentage || 0).variant}
                    className="mt-2"
                  >
                    {getAttendanceStatus(stats?.attendancePercentage || 0).label}
                  </Badge>
                </div>
                <div className="w-20 h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={38}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CGPA Card */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Current CGPA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats?.cgpa.toFixed(1)}
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${((stats?.cgpa || 0) / 10) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Out of 10.0
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span>+0.3 from last semester</span>
              </div>
            </CardContent>
          </Card>

          {/* Pending Assignments Card */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Pending Assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                {stats?.pendingAssignments}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Due this week
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  2 due tomorrow
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Exams Card */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Upcoming Exams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-rose-600 dark:text-rose-400">
                {stats?.upcomingExams}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Scheduled this month
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-rose-500" />
                <span className="text-xs text-rose-600 dark:text-rose-400">
                  First exam in 5 days
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  className={`${action.color} text-white flex flex-col items-center gap-2 h-auto py-4`}
                  variant="ghost"
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-sm">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
