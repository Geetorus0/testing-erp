'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarCheck,
  Briefcase,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Bell,
  CalendarDays,
  Megaphone,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart'

// Types
interface OverviewStats {
  totalStudents: number
  totalFaculty: number
  totalDepartments: number
  totalCourses: number
  overallAttendanceRate: number
  overallPlacementRate: number
  activePlacementDrives: number
  revenueCollected: number
  previousMonthRevenue: number
}

interface DepartmentData {
  name: string
  code: string
  students: number
  faculty: number
  attendance: number
  cgpa: number
  placementRate: number
  riskStudents: number
}

interface PlacementData {
  companyVisits: number
  offersMade: number
  highestPackage: number
  averagePackage: number
  departmentWisePlacement: Array<{
    department: string
    placed: number
    total: number
    rate: number
  }>
  monthlyTrend: Array<{
    month: string
    drives: number
    offers: number
  }>
}

interface FacultyData {
  totalFaculty: number
  qualificationDistribution: Array<{
    name: string
    value: number
    color: string
  }>
  experienceDistribution: Array<{
    range: string
    count: number
  }>
  mentorAllocation: {
    totalMentors: number
    totalMentees: number
    unallocatedStudents: number
  }
}

interface RiskData {
  highRiskCount: number
  mediumRiskCount: number
  departmentWiseRisk: Array<{
    department: string
    high: number
    medium: number
    low: number
  }>
  recentCounselingNotes: Array<{
    id: string
    studentName: string
    department: string
    date: string
    category: string
    notes: string
    facultyName: string
  }>
}

interface ActivityData {
  announcements: Array<{
    id: string
    title: string
    category: string
    priority: string
    date: string
  }>
  events: Array<{
    id: string
    title: string
    type: string
    date: string
    venue: string
  }>
  notifications: Array<{
    id: string
    message: string
    type: string
    time: string
  }>
}

interface DashboardData {
  overview: OverviewStats
  departments: DepartmentData[]
  placement: PlacementData
  faculty: FacultyData
  risk: RiskData
  activities: ActivityData
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

const chartConfig = {
  students: { label: 'Students', color: '#10B981' },
  faculty: { label: 'Faculty', color: '#3B82F6' },
  attendance: { label: 'Attendance %', color: '#F59E0B' },
  cgpa: { label: 'Avg CGPA', color: '#8B5CF6' },
  placed: { label: 'Placed', color: '#10B981' },
  total: { label: 'Total', color: '#94A3B8' }
}

export default function PrincipalDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/principal/dashboard')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (!data) {
    return (
      <Card className="p-8">
        <CardContent className="text-center text-muted-foreground">
          Failed to load dashboard data. Please try again.
        </CardContent>
      </Card>
    )
  }

  const revenueChange = data.overview.previousMonthRevenue > 0
    ? ((data.overview.revenueCollected - data.overview.previousMonthRevenue) / data.overview.previousMonthRevenue * 100).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Principal Dashboard</h1>
          <p className="text-muted-foreground">Institution-wide analytics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Last updated: {new Date().toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <OverviewCard
          title="Total Students"
          value={data.overview.totalStudents.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          color="emerald"
        />
        <OverviewCard
          title="Total Faculty"
          value={data.overview.totalFaculty.toLocaleString()}
          icon={<GraduationCap className="h-5 w-5" />}
          color="blue"
        />
        <OverviewCard
          title="Departments"
          value={data.overview.totalDepartments.toString()}
          icon={<Building2 className="h-5 w-5" />}
          color="purple"
        />
        <OverviewCard
          title="Courses"
          value={data.overview.totalCourses.toString()}
          icon={<BookOpen className="h-5 w-5" />}
          color="amber"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${data.overview.overallAttendanceRate}%`}
          icon={<CalendarCheck className="h-4 w-4" />}
          progress={data.overview.overallAttendanceRate}
          color="emerald"
        />
        <StatCard
          title="Placement Rate"
          value={`${data.overview.overallPlacementRate}%`}
          icon={<Briefcase className="h-4 w-4" />}
          progress={data.overview.overallPlacementRate}
          color="blue"
        />
        <StatCard
          title="Active Drives"
          value={data.overview.activePlacementDrives.toString()}
          icon={<TrendingUp className="h-4 w-4" />}
          color="purple"
        />
        <StatCard
          title="Revenue (This Month)"
          value={`₹${(data.overview.revenueCollected / 100000).toFixed(1)}L`}
          icon={<DollarSign className="h-4 w-4" />}
          change={parseFloat(revenueChange)}
          color="amber"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Analytics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              Department-wise Analytics
            </CardTitle>
            <CardDescription>Comparative analysis across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {['students', 'faculty', 'attendance', 'cgpa'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.departments} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="code" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey={activeTab}
                      fill={chartConfig[activeTab as keyof typeof chartConfig]?.color || '#10B981'}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Table */}
            <ScrollArea className="h-[200px] mt-4">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Department</th>
                    <th className="text-right py-2 font-medium">Students</th>
                    <th className="text-right py-2 font-medium">Faculty</th>
                    <th className="text-right py-2 font-medium">Attendance</th>
                    <th className="text-right py-2 font-medium">Avg CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {data.departments.map((dept, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-2">{dept.name}</td>
                      <td className="text-right py-2">{dept.students}</td>
                      <td className="text-right py-2">{dept.faculty}</td>
                      <td className="text-right py-2">{dept.attendance}%</td>
                      <td className="text-right py-2">{dept.cgpa.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Risk Analysis
            </CardTitle>
            <CardDescription>Students requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{data.risk.highRiskCount}</p>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Medium Risk</p>
                <p className="text-2xl font-bold text-amber-600">{data.risk.mediumRiskCount}</p>
              </div>
            </div>

            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.risk.departmentWiseRisk} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="department" type="category" tick={{ fontSize: 10 }} width={60} />
                  <Tooltip />
                  <Bar dataKey="high" stackId="a" fill="#EF4444" radius={[0, 2, 2, 0]} />
                  <Bar dataKey="medium" stackId="a" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Recent Counseling Notes</p>
              <ScrollArea className="h-[150px]">
                {data.risk.recentCounselingNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-muted/50 rounded-lg mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{note.studentName}</span>
                      <Badge variant="outline" className="text-xs">{note.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{note.notes}</p>
                    <p className="text-xs text-muted-foreground mt-1">By: {note.facultyName}</p>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placement and Faculty Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placement Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              Placement Analytics
            </CardTitle>
            <CardDescription>Current academic year placement statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Company Visits</p>
                <p className="text-xl font-bold text-blue-600">{data.placement.companyVisits}</p>
              </div>
              <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Offers Made</p>
                <p className="text-xl font-bold text-emerald-600">{data.placement.offersMade}</p>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Highest Package</p>
                <p className="text-xl font-bold text-purple-600">₹{data.placement.highestPackage}L</p>
              </div>
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Avg Package</p>
                <p className="text-xl font-bold text-amber-600">₹{data.placement.averagePackage}L</p>
              </div>
            </div>

            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.placement.departmentWisePlacement}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="department" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="placed" fill="#10B981" name="Placed" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="total" fill="#94A3B8" name="Total" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Trend */}
            <div className="h-[150px]">
              <p className="text-sm font-medium mb-2">Monthly Trend</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.placement.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="drives" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="offers" stroke="#10B981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Faculty Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-500" />
              Faculty Analytics
            </CardTitle>
            <CardDescription>Faculty distribution and allocation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Total Faculty</p>
                <p className="text-xl font-bold text-purple-600">{data.faculty.totalFaculty}</p>
              </div>
              <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Mentors</p>
                <p className="text-xl font-bold text-emerald-600">{data.faculty.mentorAllocation.totalMentors}</p>
              </div>
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Unallocated</p>
                <p className="text-xl font-bold text-amber-600">{data.faculty.mentorAllocation.unallocatedStudents}</p>
              </div>
            </div>

            {/* Qualification Distribution */}
            <div>
              <p className="text-sm font-medium mb-2">Qualification Distribution</p>
              <div className="flex items-center gap-4">
                <div className="h-[150px] w-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.faculty.qualificationDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {data.faculty.qualificationDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {data.faculty.qualificationDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm text-muted-foreground ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Experience Distribution */}
            <div>
              <p className="text-sm font-medium mb-2">Experience Distribution</p>
              <div className="space-y-2">
                {data.faculty.experienceDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm w-20">{item.range}</span>
                    <Progress value={(item.count / data.faculty.totalFaculty) * 100} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground w-8">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="h-4 w-4 text-blue-500" />
              Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-3">
                {data.activities.announcements.map((item) => (
                  <div key={item.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{item.title}</p>
                      <Badge
                        variant={item.priority === 'urgent' ? 'destructive' : item.priority === 'high' ? 'default' : 'secondary'}
                        className="text-xs shrink-0"
                      >
                        {item.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-emerald-500" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-3">
                {data.activities.events.map((item) => (
                  <div key={item.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{item.title}</p>
                      <Badge variant="outline" className="text-xs shrink-0">{item.type}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground space-y-1">
                      <p>{item.date}</p>
                      <p>Venue: {item.venue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-amber-500" />
              System Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-3">
                {data.activities.notifications.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Activity className={`h-4 w-4 mt-0.5 shrink-0 ${
                      item.type === 'success' ? 'text-emerald-500' :
                      item.type === 'warning' ? 'text-amber-500' :
                      item.type === 'error' ? 'text-red-500' : 'text-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{item.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper Components
function OverviewCard({ title, value, icon, color }: {
  title: string
  value: string
  icon: React.ReactNode
  color: 'emerald' | 'blue' | 'purple' | 'amber'
}) {
  const colors = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600',
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${colors[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatCard({ title, value, icon, progress, change, color }: {
  title: string
  value: string
  icon: React.ReactNode
  progress?: number
  change?: number
  color: 'emerald' | 'blue' | 'purple' | 'amber'
}) {
  const colors = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={colors[color]}>{icon}</span>
          <span className="text-xs text-muted-foreground">{title}</span>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-xl font-bold">{value}</p>
          {change !== undefined && (
            <span className={`text-xs flex items-center gap-1 ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(change)}%
            </span>
          )}
        </div>
        {progress !== undefined && (
          <Progress value={progress} className="h-1.5 mt-2" />
        )}
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20 mt-2" />
              <Skeleton className="h-2 w-full mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-[300px] w-full mt-4" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-[300px] w-full mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
