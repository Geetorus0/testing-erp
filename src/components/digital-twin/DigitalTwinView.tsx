'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts'
import {
  User,
  GraduationCap,
  Target,
  TrendingUp,
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  ChevronRight,
  RefreshCw,
  Download,
  Share2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import StudentTimeline, { TimelineEvent } from './StudentTimeline'
import RiskAnalysis, { RiskAnalysisData } from './RiskAnalysis'
import SkillGapAnalysis, { SkillGapData } from './SkillGapAnalysis'

interface Student {
  id: string
  name: string
  rollNumber: string
  department: string
  semester: string
  cgpa: number
  attendancePercentage: number
  avatar?: string
}

interface DigitalTwinData {
  student: Student
  events: TimelineEvent[]
  riskAnalysis: RiskAnalysisData
  skillGap: SkillGapData
  successProbability: number
  placementReadiness: number
}

interface DigitalTwinViewProps {
  initialStudentId?: string
}

// Sample students for demo
const sampleStudents: Student[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    rollNumber: 'CSE2021001',
    department: 'Computer Science',
    semester: '6th Semester',
    cgpa: 8.5,
    attendancePercentage: 87,
  },
  {
    id: '2',
    name: 'Priya Patel',
    rollNumber: 'CSE2021015',
    department: 'Computer Science',
    semester: '6th Semester',
    cgpa: 9.2,
    attendancePercentage: 95,
  },
  {
    id: '3',
    name: 'Amit Kumar',
    rollNumber: 'CSE2021008',
    department: 'Computer Science',
    semester: '6th Semester',
    cgpa: 7.1,
    attendancePercentage: 68,
  },
]

// Sample timeline events
const sampleEvents: TimelineEvent[] = [
  {
    id: '1',
    title: 'Semester 6 Mid-Term Exams',
    description: 'Completed mid-term examinations for all subjects with good performance in Data Structures and Algorithms.',
    category: 'academic',
    date: '2024-03-15T10:00:00',
    importance: 'high',
    notes: ['Prepared well for DSA exam', 'Need to improve in DBMS'],
    metadata: { 'Average Score': '78%', 'Rank': '15/60' },
  },
  {
    id: '2',
    title: 'AWS Cloud Practitioner Certification',
    description: 'Successfully completed AWS Cloud Practitioner certification with 92% score.',
    category: 'certification',
    date: '2024-03-01T14:30:00',
    importance: 'high',
    notes: ['Completed in first attempt'],
    metadata: { 'Score': '92%', 'Validity': '3 years' },
  },
  {
    id: '3',
    title: 'Google Summer Internship Selection',
    description: 'Selected for Google Summer Internship program after 3 rounds of technical interviews.',
    category: 'internship',
    date: '2024-02-20T11:00:00',
    importance: 'high',
    metadata: { 'Stipend': '₹80,000/month', 'Duration': '3 months' },
  },
  {
    id: '4',
    title: 'Attendance Warning',
    description: 'Received warning for low attendance in Operating Systems course. Current attendance at 62%.',
    category: 'attendance',
    date: '2024-02-15T09:00:00',
    importance: 'medium',
    notes: ['Need to attend all remaining classes'],
  },
  {
    id: '5',
    title: 'Hackathon Participation',
    description: 'Participated in Smart India Hackathon and reached regional finals with AI-based solution.',
    category: 'project',
    date: '2024-02-10T08:00:00',
    importance: 'medium',
    metadata: { 'Team Size': '4', 'Project': 'AI Waste Segregation' },
  },
  {
    id: '6',
    title: 'Placement Drive - TCS',
    description: 'Cleared aptitude round in TCS placement drive. Waiting for technical interview results.',
    category: 'placement',
    date: '2024-01-25T10:00:00',
    importance: 'high',
    metadata: { 'Package': '₹7 LPA', 'Role': 'Software Engineer' },
  },
  {
    id: '7',
    title: 'Research Paper Published',
    description: 'Published research paper on Machine Learning applications in IEEE conference.',
    category: 'academic',
    date: '2024-01-15T00:00:00',
    importance: 'high',
    notes: ['Co-authored with Dr. Smith'],
    metadata: { 'Conference': 'IEEE ICML 2024', 'Citations': '3' },
  },
  {
    id: '8',
    title: 'Perfect Attendance Month',
    description: 'Achieved 100% attendance for the month of December 2023.',
    category: 'attendance',
    date: '2024-01-01T00:00:00',
    importance: 'low',
  },
  {
    id: '9',
    title: 'Techfest Project Winner',
    description: 'Won first prize in college techfest for innovative IoT project.',
    category: 'project',
    date: '2023-12-20T16:00:00',
    importance: 'medium',
    metadata: { 'Prize': '₹25,000', 'Team': 'CodeCrafters' },
  },
  {
    id: '10',
    title: 'Python Advanced Certification',
    description: 'Completed advanced Python programming certification from Coursera.',
    category: 'certification',
    date: '2023-11-30T12:00:00',
    importance: 'medium',
    metadata: { 'Platform': 'Coursera', 'Grade': '95%' },
  },
]

// Sample risk analysis data
const sampleRiskAnalysis: RiskAnalysisData = {
  overallScore: 28,
  riskLevel: 'low',
  factors: [
    {
      name: 'Attendance Risk',
      score: 18,
      weight: 0.3,
      trend: 'down',
      description: 'Attendance has improved after warning. Currently at 87%.',
    },
    {
      name: 'Academic Risk',
      score: 15,
      weight: 0.35,
      trend: 'down',
      description: 'Strong academic performance with CGPA of 8.5. Good trajectory.',
    },
    {
      name: 'Behavioral Risk',
      score: 35,
      weight: 0.2,
      trend: 'up',
      description: 'Some concerns about participation in group activities.',
    },
    {
      name: 'Engagement Risk',
      score: 22,
      weight: 0.15,
      trend: 'stable',
      description: 'Active in certifications and projects. Good engagement.',
    },
  ],
  recommendedActions: [
    {
      id: '1',
      title: 'Improve Group Participation',
      description: 'Join more team activities and improve collaboration skills.',
      priority: 'medium',
      category: 'Behavioral',
    },
    {
      id: '2',
      title: 'Maintain Attendance',
      description: 'Continue attending all classes to maintain good attendance.',
      priority: 'low',
      category: 'Attendance',
    },
    {
      id: '3',
      title: 'Prepare for Final Placements',
      description: 'Focus on aptitude and technical interview preparation.',
      priority: 'high',
      category: 'Career',
    },
  ],
  historicalTrend: [
    { month: 'Jan', score: 45 },
    { month: 'Feb', score: 38 },
    { month: 'Mar', score: 32 },
    { month: 'Apr', score: 35 },
    { month: 'May', score: 30 },
    { month: 'Jun', score: 28 },
  ],
}

// Sample skill gap data
const sampleSkillGap: SkillGapData = {
  targetRole: 'Software Engineer',
  skills: [
    { name: 'Programming', current: 85, required: 90, gap: 5 },
    { name: 'Data Structures', current: 80, required: 85, gap: 5 },
    { name: 'Algorithms', current: 75, required: 85, gap: 10 },
    { name: 'System Design', current: 55, required: 75, gap: 20 },
    { name: 'Database', current: 70, required: 80, gap: 10 },
    { name: 'Cloud', current: 65, required: 70, gap: 5 },
    { name: 'Communication', current: 60, required: 80, gap: 20 },
    { name: 'Problem Solving', current: 75, required: 85, gap: 10 },
  ],
  recommendedCourses: [
    {
      id: '1',
      title: 'System Design Fundamentals',
      provider: 'Educative',
      skills: ['System Design', 'Scalability'],
      duration: '20 hours',
      level: 'Intermediate',
    },
    {
      id: '2',
      title: 'Effective Communication for Engineers',
      provider: 'Coursera',
      skills: ['Communication', 'Presentation'],
      duration: '15 hours',
      level: 'Beginner',
    },
    {
      id: '3',
      title: 'Advanced Algorithms & Data Structures',
      provider: 'LeetCode',
      skills: ['Algorithms', 'Data Structures', 'Problem Solving'],
      duration: '40 hours',
      level: 'Advanced',
    },
    {
      id: '4',
      title: 'AWS Solutions Architect',
      provider: 'AWS Training',
      skills: ['Cloud', 'System Design'],
      duration: '30 hours',
      level: 'Intermediate',
    },
  ],
  overallReadiness: 72,
}

export default function DigitalTwinView({ initialStudentId }: DigitalTwinViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId || '1')
  const [data, setData] = useState<DigitalTwinData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDigitalTwinData()
  }, [selectedStudentId])

  const fetchDigitalTwinData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))
      
      const student = sampleStudents.find((s) => s.id === selectedStudentId) || sampleStudents[0]
      
      // Vary data based on student for demo
      let events = [...sampleEvents]
      let riskAnalysis = { ...sampleRiskAnalysis }
      let skillGap = { ...sampleSkillGap }
      
      if (selectedStudentId === '2') {
        // High performer
        riskAnalysis.overallScore = 15
        riskAnalysis.riskLevel = 'low'
        riskAnalysis.factors = riskAnalysis.factors.map(f => ({ ...f, score: Math.max(f.score - 10, 10) }))
        skillGap.overallReadiness = 88
        skillGap.skills = skillGap.skills.map(s => ({ ...s, current: Math.min(s.current + 15, 95), gap: Math.max(s.gap - 15, 0) }))
      } else if (selectedStudentId === '3') {
        // Needs attention
        riskAnalysis.overallScore = 65
        riskAnalysis.riskLevel = 'high'
        riskAnalysis.factors = riskAnalysis.factors.map(f => ({ ...f, score: Math.min(f.score + 25, 90), trend: 'up' as const }))
        skillGap.overallReadiness = 45
        skillGap.skills = skillGap.skills.map(s => ({ ...s, current: Math.max(s.current - 20, 25), gap: s.gap + 20 }))
      }
      
      setData({
        student,
        events,
        riskAnalysis,
        skillGap,
        successProbability: selectedStudentId === '2' ? 92 : selectedStudentId === '3' ? 55 : 78,
        placementReadiness: selectedStudentId === '2' ? 95 : selectedStudentId === '3' ? 48 : 72,
      })
    } catch (error) {
      console.error('Failed to fetch digital twin data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDigitalTwinData()
  }

  const handleAddNote = (eventId: string, note: string) => {
    if (!data) return
    setData({
      ...data,
      events: data.events.map((e) =>
        e.id === eventId
          ? { ...e, notes: [...(e.notes || []), note] }
          : e
      ),
    })
  }

  const getSuccessColor = (probability: number) => {
    if (probability >= 80) return '#22c55e'
    if (probability >= 60) return '#eab308'
    return '#ef4444'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const { student, events, riskAnalysis, skillGap, successProbability, placementReadiness } = data

  // Gauge data for success probability
  const successGaugeData = [
    { name: 'probability', value: successProbability, fill: getSuccessColor(successProbability) },
  ]

  return (
    <div className="space-y-6">
      {/* Header with Student Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger className="w-[280px]">
              <User className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {sampleStudents.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <div className="flex items-center gap-2">
                    <span>{s.name}</span>
                    <span className="text-muted-foreground">({s.rollNumber})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Student Overview Card */}
      <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <p className="text-emerald-100">{student.rollNumber} • {student.department}</p>
                <Badge className="mt-2 bg-white/20 text-white border-white/30">
                  {student.semester}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{student.cgpa.toFixed(1)}</div>
                <p className="text-xs text-emerald-100">CGPA</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{student.attendancePercentage}%</div>
                <p className="text-xs text-emerald-100">Attendance</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{successProbability}%</div>
                <p className="text-xs text-emerald-100">Success Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{placementReadiness}%</div>
                <p className="text-xs text-emerald-100">Placement Ready</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Probability & Event Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Probability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={successGaugeData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: getSuccessColor(successProbability) }}>
                  {successProbability}%
                </div>
                <p className="text-xs text-muted-foreground">Overall success rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Placement Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{placementReadiness}%</span>
                <Badge variant={placementReadiness >= 70 ? 'default' : 'secondary'}>
                  {placementReadiness >= 70 ? 'Ready' : 'Needs Work'}
                </Badge>
              </div>
              <Progress value={placementReadiness} className="h-2" />
              <p className="text-xs text-muted-foreground">Based on skills and certifications</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Event Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Academic', count: events.filter(e => e.category === 'academic').length, color: 'bg-blue-500' },
                { label: 'Certifications', count: events.filter(e => e.category === 'certification').length, color: 'bg-purple-500' },
                { label: 'Projects', count: events.filter(e => e.category === 'project').length, color: 'bg-cyan-500' },
                { label: 'Internships', count: events.filter(e => e.category === 'internship').length, color: 'bg-orange-500' },
                { label: 'Placement', count: events.filter(e => e.category === 'placement').length, color: 'bg-rose-500' },
                { label: 'Attendance', count: events.filter(e => e.category === 'attendance').length, color: 'bg-emerald-500' },
              ].map((cat) => (
                <div key={cat.label} className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', cat.color)} />
                  <span className="text-xs text-muted-foreground">{cat.label}</span>
                  <span className="text-xs font-bold">{cat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="timeline">
            <Calendar className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="risk">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Target className="h-4 w-4 mr-2" />
            Skills
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-0">
          <StudentTimeline events={events} onAddNote={handleAddNote} />
        </TabsContent>

        <TabsContent value="risk" className="mt-0">
          <RiskAnalysis data={riskAnalysis} />
        </TabsContent>

        <TabsContent value="skills" className="mt-0">
          <SkillGapAnalysis data={skillGap} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
