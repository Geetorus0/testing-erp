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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Clock,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Timer,
} from 'lucide-react'

interface Assignment {
  id: string
  title: string
  subject: string
  subjectCode: string
  dueDate: string
  dueTime: string
  status: 'pending' | 'submitted' | 'overdue'
  priority: 'high' | 'medium' | 'low'
  maxMarks: number
}

interface Exam {
  id: string
  subject: string
  subjectCode: string
  examType: string
  date: string
  time: string
  duration: string
  venue: string
  totalMarks: number
}

interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'low':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  }
}

const getStatusIcon = (status: 'pending' | 'submitted' | 'overdue') => {
  switch (status) {
    case 'submitted':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case 'overdue':
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-amber-500" />
  }
}

const getStatusBadge = (status: 'pending' | 'submitted' | 'overdue') => {
  switch (status) {
    case 'submitted':
      return (
        <Badge className="bg-green-500 hover:bg-green-600">Submitted</Badge>
      )
    case 'overdue':
      return (
        <Badge variant="destructive">Overdue</Badge>
      )
    default:
      return (
        <Badge variant="secondary">Pending</Badge>
      )
  }
}

export default function UpcomingCard() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    // Start countdown timer
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/student/dashboard')
      const data = await response.json()
      setAssignments(data.upcomingAssignments || [])
      setExams(data.upcomingExams || [])
    } catch (error) {
      console.error('Failed to fetch upcoming data:', error)
      // Set demo data
      setAssignments([
        {
          id: '1',
          title: 'Implement Binary Search Tree',
          subject: 'Data Structures & Algorithms',
          subjectCode: 'CS301',
          dueDate: '2024-06-20',
          dueTime: '23:59',
          status: 'pending',
          priority: 'high',
          maxMarks: 30,
        },
        {
          id: '2',
          title: 'Database Normalization Report',
          subject: 'Database Management Systems',
          subjectCode: 'CS302',
          dueDate: '2024-06-21',
          dueTime: '23:59',
          status: 'pending',
          priority: 'medium',
          maxMarks: 20,
        },
        {
          id: '3',
          title: 'OS Scheduling Algorithms',
          subject: 'Operating Systems',
          subjectCode: 'CS303',
          dueDate: '2024-06-18',
          dueTime: '23:59',
          status: 'overdue',
          priority: 'high',
          maxMarks: 25,
        },
        {
          id: '4',
          title: 'Network Protocol Analysis',
          subject: 'Computer Networks',
          subjectCode: 'CS304',
          dueDate: '2024-06-25',
          dueTime: '23:59',
          status: 'pending',
          priority: 'low',
          maxMarks: 20,
        },
        {
          id: '5',
          title: 'UML Diagrams Project',
          subject: 'Software Engineering',
          subjectCode: 'CS305',
          dueDate: '2024-06-19',
          dueTime: '18:00',
          status: 'submitted',
          priority: 'medium',
          maxMarks: 50,
        },
      ])

      setExams([
        {
          id: '1',
          subject: 'Data Structures & Algorithms',
          subjectCode: 'CS301',
          examType: 'End Semester',
          date: '2024-06-25',
          time: '09:00',
          duration: '3 hours',
          venue: 'Hall A',
          totalMarks: 100,
        },
        {
          id: '2',
          subject: 'Database Management Systems',
          subjectCode: 'CS302',
          examType: 'End Semester',
          date: '2024-06-27',
          time: '14:00',
          duration: '3 hours',
          venue: 'Hall B',
          totalMarks: 100,
        },
        {
          id: '3',
          subject: 'Operating Systems',
          subjectCode: 'CS303',
          examType: 'End Semester',
          date: '2024-06-29',
          time: '09:00',
          duration: '3 hours',
          venue: 'Hall A',
          totalMarks: 100,
        },
        {
          id: '4',
          subject: 'Computer Networks',
          subjectCode: 'CS304',
          examType: 'End Semester',
          date: '2024-07-01',
          time: '14:00',
          duration: '3 hours',
          venue: 'Hall C',
          totalMarks: 100,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const updateCountdown = () => {
    if (exams.length === 0) return

    const firstExam = exams[0]
    const examDate = new Date(`${firstExam.date}T${firstExam.time}`)
    const now = new Date()
    const diff = examDate.getTime() - now.getTime()

    if (diff <= 0) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      return
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    setCountdown({ days, hours, minutes, seconds })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  const getTimeRemaining = (dateStr: string, timeStr: string) => {
    const dueDate = new Date(`${dateStr}T${timeStr}`)
    const now = new Date()
    const diff = dueDate.getTime() - now.getTime()

    if (diff <= 0) return 'Overdue'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) {
      return `${days}d ${hours}h remaining`
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      return `${hours}h ${minutes}m remaining`
    }
  }

  if (loading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Upcoming & Deadlines</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const pendingAssignments = assignments.filter((a) => a.status === 'pending')

  return (
    <div className="space-y-4">
      {/* Exam Countdown */}
      {exams.length > 0 && (
        <Card className="shadow-md bg-gradient-to-r from-rose-500 to-pink-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Timer className="h-5 w-5" />
                  <span className="text-sm font-medium text-rose-100">
                    Next Exam Countdown
                  </span>
                </div>
                <h3 className="text-xl font-bold">{exams[0].subject}</h3>
                <p className="text-rose-100 text-sm">
                  {exams[0].examType} • {exams[0].date}
                </p>
              </div>
              <div className="flex gap-3">
                {[
                  { value: countdown.days, label: 'Days' },
                  { value: countdown.hours, label: 'Hours' },
                  { value: countdown.minutes, label: 'Mins' },
                  { value: countdown.seconds, label: 'Secs' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center min-w-[60px]"
                  >
                    <div className="text-2xl font-bold">{item.value}</div>
                    <div className="text-xs text-rose-100">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignments Card */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" />
                Upcoming Assignments
              </CardTitle>
              <CardDescription>
                {pendingAssignments.length} pending submissions
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              {assignments.filter((a) => a.status === 'overdue').length} Overdue
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(assignment.status)}
                        <h4 className="font-medium text-sm">{assignment.title}</h4>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {assignment.subject} ({assignment.subjectCode})
                      </p>
                    </div>
                    {getStatusBadge(assignment.status)}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(assignment.dueDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {assignment.dueTime}
                      </span>
                    </div>
                    {assignment.status === 'pending' && (
                      <Badge className={getPriorityColor(assignment.priority)}>
                        {assignment.priority}
                      </Badge>
                    )}
                  </div>
                  {assignment.status === 'pending' && (
                    <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeRemaining(assignment.dueDate, assignment.dueTime)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Exams Schedule Card */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            Exam Schedule
          </CardTitle>
          <CardDescription>End semester examination dates</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-56">
            <div className="space-y-3">
              {exams.map((exam, index) => (
                <div
                  key={exam.id}
                  className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {exam.examType}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {exam.subjectCode}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm">{exam.subject}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatDate(exam.date)}
                      </div>
                      <div className="text-xs text-gray-500">{exam.time}</div>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {exam.duration}
                      </span>
                      <span>Venue: {exam.venue}</span>
                    </div>
                    <span>Max: {exam.totalMarks} marks</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View Full Exam Schedule
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
