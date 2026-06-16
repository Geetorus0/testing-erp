'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Users,
  GraduationCap,
  Calendar,
  TrendingUp,
  BookOpen,
  ClipboardCheck,
  AlertTriangle,
  Award,
  UserCheck,
  CalendarClock,
  FileBarChart,
  PieChart as PieChartIcon,
  BarChart3,
  UserPlus,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Building2
} from 'lucide-react'
import { toast } from 'sonner'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// Types
interface DashboardStats {
  totalFaculty: number
  totalStudents: number
  avgAttendance: number
  avgCgpa: number
  placementRate: number
  activeSubjects: number
  hodName: string
  designation: string
  department: string
  departmentCode: string
}

interface FacultyMember {
  id: string
  name: string
  email: string
  designation: string
  subjects: { id: string; name: string; code: string; semester: string }[]
  studentCount: number
  avgAttendance: number
  avgMarks: number
  status: string
}

interface Student {
  id: string
  name: string
  email: string
  rollNo: string
  section: string
  semester: string
  year: number
  cgpa: number
  attendance: number
  placementStatus: string
  riskScore: number
}

interface RiskStudent {
  id: string
  name: string
  rollNo: string
  cgpa: number
  attendance: number
  riskScore: number
  riskFactors: string[]
}

interface TopPerformer {
  id: string
  name: string
  rollNo: string
  cgpa: number
  attendance: number
  achievements: string[]
}

interface Subject {
  id: string
  name: string
  code: string
  semester: string
  faculty: string
  facultyId: string | null
  isAssigned: boolean
}

interface AnalyticsData {
  yearWiseDistribution: { year: string; count: number }[]
  sectionWiseStrength: { section: string; count: number }[]
  riskStudents: RiskStudent[]
  topPerformers: TopPerformer[]
  subjectAllocation: Subject[]
  unassignedSubjects: Subject[]
}

// Colors for charts
const COLORS = ['#10B981', '#059669', '#047857', '#065F46', '#064E3B']
const BAR_COLORS = ['#10B981', '#059669', '#047857']

export default function HodDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFaculty: 0,
    totalStudents: 0,
    avgAttendance: 0,
    avgCgpa: 0,
    placementRate: 0,
    activeSubjects: 0,
    hodName: 'Dr. Michael Anderson',
    designation: 'Professor & Head',
    department: 'Computer Science & Engineering',
    departmentCode: 'CSE'
  })
  const [faculty, setFaculty] = useState<FacultyMember[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mentorDialogOpen, setMentorDialogOpen] = useState(false)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)

  useEffect(() => {
    fetchAllData()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchAllData = async () => {
    try {
      const [dashboardRes, facultyRes, studentsRes, analyticsRes] = await Promise.all([
        fetch('/api/hod/dashboard'),
        fetch('/api/hod/faculty'),
        fetch('/api/hod/students'),
        fetch('/api/hod/analytics')
      ])

      if (dashboardRes.ok) {
        const data = await dashboardRes.json()
        setStats(data)
      }
      if (facultyRes.ok) {
        const data = await facultyRes.json()
        setFaculty(data.faculty)
      }
      if (studentsRes.ok) {
        const data = await studentsRes.json()
        setStudents(data.students)
      }
      if (analyticsRes.ok) {
        const data = await analyticsRes.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch HOD data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

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

  // Stat cards configuration
  const statCards = [
    {
      title: 'Total Faculty',
      value: stats.totalFaculty,
      icon: <Users className="h-5 w-5" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: <GraduationCap className="h-5 w-5" />,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-950/30'
    },
    {
      title: 'Avg Attendance',
      value: `${stats.avgAttendance}%`,
      icon: <ClipboardCheck className="h-5 w-5" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30'
    },
    {
      title: 'Avg CGPA',
      value: stats.avgCgpa.toFixed(1),
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30'
    },
    {
      title: 'Placement Rate',
      value: `${stats.placementRate}%`,
      icon: <Award className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30'
    },
    {
      title: 'Active Subjects',
      value: stats.activeSubjects,
      icon: <BookOpen className="h-5 w-5" />,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50 dark:bg-sky-950/30'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-80 bg-muted animate-pulse rounded-lg" />
          <div className="h-80 bg-muted animate-pulse rounded-lg" />
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
              <h1 className="text-2xl md:text-3xl font-bold">{stats.hodName}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                  {stats.designation}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
                  <Building2 className="h-3 w-3 mr-1" />
                  {stats.departmentCode} - {stats.department}
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
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
            <Dialog open={mentorDialogOpen} onOpenChange={setMentorDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                  <UserPlus className="h-5 w-5" />
                  <span className="text-xs">Assign Mentor</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Mentor to Student</DialogTitle>
                  <DialogDescription>
                    Select a student and assign a faculty mentor.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.slice(0, 10).map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.rollNo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Faculty Mentor" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculty.map(f => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name} - {f.designation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="w-full" onClick={() => {
                    toast.success('Mentor assigned successfully')
                    setMentorDialogOpen(false)
                  }}>
                    Assign Mentor
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                  <CalendarClock className="h-5 w-5" />
                  <span className="text-xs">Faculty Schedules</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Faculty Schedules</DialogTitle>
                  <DialogDescription>
                    View and manage faculty class schedules.
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Faculty</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Room</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faculty.slice(0, 5).flatMap(f => f.subjects.slice(0, 2).map((s, i) => (
                        <TableRow key={`${f.id}-${s.id}`}>
                          <TableCell className="font-medium">{f.name}</TableCell>
                          <TableCell>{s.name}</TableCell>
                          <TableCell>{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i]}</TableCell>
                          <TableCell>{['9:00 AM', '11:00 AM', '2:00 PM'][i % 3]}</TableCell>
                          <TableCell>Room {201 + i}</TableCell>
                        </TableRow>
                      )))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => toast.info('Opening department reports...')}>
              <FileBarChart className="h-5 w-5" />
              <span className="text-xs">Department Reports</span>
            </Button>

            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => toast.info('Opening analytics...')}>
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Unassigned Subjects Alert */}
      {analytics && analytics.unassignedSubjects.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unassigned Subjects Alert</AlertTitle>
          <AlertDescription>
            {analytics.unassignedSubjects.length} subject(s) need faculty assignment: {' '}
            {analytics.unassignedSubjects.map(s => s.name).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="faculty" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="faculty" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Faculty</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Students</span>
          </TabsTrigger>
          <TabsTrigger value="subjects" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Subjects</span>
          </TabsTrigger>
        </TabsList>

        {/* Faculty Performance Tab */}
        <TabsContent value="faculty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Faculty Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faculty Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead className="text-center">Students</TableHead>
                      <TableHead className="text-center">Avg Attendance</TableHead>
                      <TableHead className="text-center">Avg Marks</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faculty.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{f.name}</p>
                            <p className="text-xs text-muted-foreground">{f.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{f.designation}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            {f.subjects.map((s, i) => (
                              <Badge key={i} variant="outline" className="mr-1 mb-1 text-xs">
                                {s.code}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{f.studentCount}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={f.avgAttendance} className="w-16 h-2" />
                            <span className={`text-sm ${f.avgAttendance >= 85 ? 'text-emerald-600' : f.avgAttendance >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
                              {f.avgAttendance}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`text-sm font-medium ${f.avgMarks >= 75 ? 'text-emerald-600' : f.avgMarks >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {f.avgMarks}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={f.status === 'Active' ? 'default' : 'secondary'} className={f.status === 'Active' ? 'bg-emerald-600' : ''}>
                            {f.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <>
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Year-wise Distribution Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Year-wise Student Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.yearWiseDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ year, percent }) => `${year} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={100}
                            fill="#10B981"
                            dataKey="count"
                            nameKey="year"
                          >
                            {analytics.yearWiseDistribution.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Section-wise Strength Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Section-wise Strength
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.sectionWiseStrength}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="section" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]}>
                            {analytics.sectionWiseStrength.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Students & Top Performers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Risk Students */}
                <Card className="border-rose-200 dark:border-rose-900">
                  <CardHeader className="bg-rose-50 dark:bg-rose-950/30">
                    <CardTitle className="text-lg flex items-center gap-2 text-rose-700 dark:text-rose-400">
                      <AlertTriangle className="h-5 w-5" />
                      At-Risk Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-80">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead className="text-center">CGPA</TableHead>
                            <TableHead className="text-center">Attn %</TableHead>
                            <TableHead className="text-center">Risk</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analytics.riskStudents.map((s) => (
                            <TableRow key={s.id} className="bg-rose-50/50 dark:bg-rose-950/10">
                              <TableCell>
                                <div>
                                  <p className="font-medium">{s.name}</p>
                                  <p className="text-xs text-muted-foreground">{s.rollNo}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-rose-600 font-medium">{s.cgpa.toFixed(1)}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-amber-600">{s.attendance}%</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="destructive" className="gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  {s.riskScore}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Top Performers */}
                <Card className="border-emerald-200 dark:border-emerald-900">
                  <CardHeader className="bg-emerald-50 dark:bg-emerald-950/30">
                    <CardTitle className="text-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <Award className="h-5 w-5" />
                      Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-80">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead className="text-center">CGPA</TableHead>
                            <TableHead className="text-center">Attn %</TableHead>
                            <TableHead>Achievements</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analytics.topPerformers.map((s, i) => (
                            <TableRow key={s.id} className="bg-emerald-50/50 dark:bg-emerald-950/10">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-700' : 'bg-emerald-600'}`}>
                                    {i + 1}
                                  </div>
                                  <div>
                                    <p className="font-medium">{s.name}</p>
                                    <p className="text-xs text-muted-foreground">{s.rollNo}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-emerald-600 font-bold">{s.cgpa.toFixed(1)}</span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-emerald-600">{s.attendance}%</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {s.achievements.slice(0, 2).map((a, j) => (
                                    <Badge key={j} variant="outline" className="text-xs text-emerald-600 border-emerald-300">
                                      {a}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Department Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead className="text-center">CGPA</TableHead>
                      <TableHead className="text-center">Attendance</TableHead>
                      <TableHead>Placement</TableHead>
                      <TableHead className="text-center">Risk</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.rollNo}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{s.section}</TableCell>
                        <TableCell>{s.year}{['st', 'nd', 'rd', 'th'][Math.min(s.year - 1, 3)]} Year</TableCell>
                        <TableCell className="text-center">
                          <span className={`font-medium ${s.cgpa >= 8 ? 'text-emerald-600' : s.cgpa >= 6.5 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {s.cgpa.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={s.attendance} className="w-12 h-2" />
                            <span className={`text-sm ${s.attendance >= 85 ? 'text-emerald-600' : s.attendance >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
                              {s.attendance}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.placementStatus === 'PLACED' ? 'default' : 'secondary'} className={s.placementStatus === 'PLACED' ? 'bg-emerald-600' : ''}>
                            {s.placementStatus === 'PLACED' ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> Placed</>
                            ) : (
                              <><Clock className="h-3 w-3 mr-1" /> Not Placed</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={s.riskScore >= 50 ? 'destructive' : s.riskScore >= 30 ? 'secondary' : 'outline'} className="text-xs">
                            {s.riskScore}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subject Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Subject Name</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Assigned Faculty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics?.subjectAllocation.map((s) => (
                      <TableRow key={s.id} className={!s.isAssigned ? 'bg-rose-50/50 dark:bg-rose-950/10' : ''}>
                        <TableCell className="font-mono font-medium">{s.code}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.semester}</TableCell>
                        <TableCell>
                          {s.isAssigned ? (
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-emerald-600" />
                              {s.faculty}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {s.isAssigned ? (
                            <Badge className="bg-emerald-600">
                              <CheckCircle className="h-3 w-3 mr-1" /> Assigned
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" /> Unassigned
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toast.info(`Opening assignment dialog for ${s.name}`)}
                          >
                            {s.isAssigned ? 'Reassign' : 'Assign'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
