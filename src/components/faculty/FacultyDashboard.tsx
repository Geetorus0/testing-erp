'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Calendar, 
  ClipboardCheck, 
  FileText, 
  CheckCircle,
  Clock,
  BookOpen,
  Upload
} from 'lucide-react'
import { toast } from 'sonner'

interface DashboardStats {
  totalStudents: number
  todayClasses: number
  pendingEvaluations: number
  materialsUploaded: number
  facultyName: string
  designation: string
  department: string
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  variant: 'default' | 'outline' | 'secondary'
  action: () => void
}

export default function FacultyDashboard({ onAction }: { onAction?: (action: string) => void }) {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    todayClasses: 0,
    pendingEvaluations: 0,
    materialsUploaded: 0,
    facultyName: 'Dr. Sarah Johnson',
    designation: 'Associate Professor',
    department: 'Computer Science'
  })
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetchDashboardStats()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/faculty/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      // Keep demo data on error
    } finally {
      setLoading(false)
    }
  }

  const quickActions: QuickAction[] = [
    {
      id: 'attendance',
      label: 'Mark Attendance',
      icon: <CheckCircle className="h-4 w-4" />,
      variant: 'default',
      action: () => onAction?.('attendance')
    },
    {
      id: 'marks',
      label: 'Upload Marks',
      icon: <Upload className="h-4 w-4" />,
      variant: 'default',
      action: () => onAction?.('marks')
    },
    {
      id: 'materials',
      label: 'Upload Materials',
      icon: <FileText className="h-4 w-4" />,
      variant: 'outline',
      action: () => toast.info('Materials upload coming soon!')
    },
    {
      id: 'assignments',
      label: 'Create Assignment',
      icon: <BookOpen className="h-4 w-4" />,
      variant: 'outline',
      action: () => toast.info('Assignment creation coming soon!')
    }
  ]

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: <Users className="h-5 w-5" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30'
    },
    {
      title: "Today's Classes",
      value: stats.todayClasses,
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30'
    },
    {
      title: 'Pending Evaluations',
      value: stats.pendingEvaluations,
      icon: <ClipboardCheck className="h-5 w-5" />,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30'
    },
    {
      title: 'Materials Uploaded',
      value: stats.materialsUploaded,
      icon: <FileText className="h-5 w-5" />,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50 dark:bg-sky-950/30'
    }
  ]

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 overflow-hidden relative">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-emerald-100 text-sm font-medium">{getGreeting()}</p>
              <h1 className="text-2xl md:text-3xl font-bold">{stats.facultyName}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                  {stats.designation}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                  {stats.department}
                </Badge>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-emerald-100 text-sm">{formatDate(currentTime)}</p>
              <p className="text-2xl font-bold">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full" />
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant}
                className="h-auto py-4 flex flex-col gap-2"
                onClick={action.action}
              >
                {action.icon}
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: '09:00 AM', subject: 'Data Structures', class: 'CSE 3rd Year - Section A', room: 'Room 201' },
                { time: '11:00 AM', subject: 'Algorithms', class: 'CSE 2nd Year - Section B', room: 'Room 105' },
                { time: '02:00 PM', subject: 'Machine Learning', class: 'CSE 4th Year - Section A', room: 'Lab 3' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium text-emerald-600 w-20">{item.time}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.subject}</p>
                    <p className="text-sm text-muted-foreground truncate">{item.class}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">{item.room}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { task: 'Mark attendance for Data Structures', due: 'Today', priority: 'high' },
                { task: 'Upload Internal 1 marks', due: 'Tomorrow', priority: 'medium' },
                { task: 'Review assignment submissions', due: 'In 2 days', priority: 'low' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.task}</p>
                    <p className="text-sm text-muted-foreground">Due: {item.due}</p>
                  </div>
                  <Badge 
                    variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}
                  >
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
