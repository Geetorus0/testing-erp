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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { TrendingUp, Award, BookOpen, Target } from 'lucide-react'

interface RecentMark {
  id: string
  subject: string
  subjectCode: string
  examType: string
  maxMarks: number
  obtainedMarks: number
  percentage: number
  grade: string
  date: string
}

interface SemesterPerformance {
  semester: string
  gpa: number
  credits: number
  status: string
}

interface GPATrend {
  semester: string
  gpa: number
  credits: number
}

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'O':
      return 'bg-green-500 text-white'
    case 'A+':
    case 'A':
      return 'bg-emerald-500 text-white'
    case 'B+':
    case 'B':
      return 'bg-teal-500 text-white'
    case 'C+':
    case 'C':
      return 'bg-yellow-500 text-white'
    case 'D':
      return 'bg-orange-500 text-white'
    default:
      return 'bg-red-500 text-white'
  }
}

const getPercentageColor = (percentage: number) => {
  if (percentage >= 90) return 'text-green-600 dark:text-green-400'
  if (percentage >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (percentage >= 70) return 'text-teal-600 dark:text-teal-400'
  if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400'
  if (percentage >= 50) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

export default function AcademicsCard() {
  const [recentMarks, setRecentMarks] = useState<RecentMark[]>([])
  const [semesterPerformance, setSemesterPerformance] = useState<SemesterPerformance[]>([])
  const [gpaTrend, setGpaTrend] = useState<GPATrend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAcademicData()
  }, [])

  const fetchAcademicData = async () => {
    try {
      const response = await fetch('/api/student/marks')
      const data = await response.json()
      setRecentMarks(data.recentMarks || [])
      setSemesterPerformance(data.semesterPerformance || [])
      setGpaTrend(data.gpaTrend || [])
    } catch (error) {
      console.error('Failed to fetch academic data:', error)
      // Set demo data
      setRecentMarks([
        {
          id: '1',
          subject: 'Data Structures & Algorithms',
          subjectCode: 'CS301',
          examType: 'Mid Semester',
          maxMarks: 50,
          obtainedMarks: 45,
          percentage: 90,
          grade: 'O',
          date: '2024-03-15',
        },
        {
          id: '2',
          subject: 'Database Management Systems',
          subjectCode: 'CS302',
          examType: 'Mid Semester',
          maxMarks: 50,
          obtainedMarks: 42,
          percentage: 84,
          grade: 'A',
          date: '2024-03-14',
        },
        {
          id: '3',
          subject: 'Operating Systems',
          subjectCode: 'CS303',
          examType: 'Mid Semester',
          maxMarks: 50,
          obtainedMarks: 38,
          percentage: 76,
          grade: 'B+',
          date: '2024-03-13',
        },
        {
          id: '4',
          subject: 'Computer Networks',
          subjectCode: 'CS304',
          examType: 'Mid Semester',
          maxMarks: 50,
          obtainedMarks: 35,
          percentage: 70,
          grade: 'B',
          date: '2024-03-12',
        },
        {
          id: '5',
          subject: 'Software Engineering',
          subjectCode: 'CS305',
          examType: 'Assignment',
          maxMarks: 30,
          obtainedMarks: 28,
          percentage: 93,
          grade: 'O',
          date: '2024-03-10',
        },
        {
          id: '6',
          subject: 'Machine Learning',
          subjectCode: 'CS306',
          examType: 'Quiz',
          maxMarks: 20,
          obtainedMarks: 16,
          percentage: 80,
          grade: 'A',
          date: '2024-03-08',
        },
      ])

      setSemesterPerformance([
        { semester: 'Sem 1', gpa: 7.8, credits: 22, status: 'Completed' },
        { semester: 'Sem 2', gpa: 8.0, credits: 24, status: 'Completed' },
        { semester: 'Sem 3', gpa: 8.2, credits: 24, status: 'Completed' },
        { semester: 'Sem 4', gpa: 8.4, credits: 26, status: 'Completed' },
        { semester: 'Sem 5', gpa: 8.5, credits: 24, status: 'Completed' },
        { semester: 'Sem 6', gpa: 8.5, credits: 22, status: 'Ongoing' },
      ])

      setGpaTrend([
        { semester: 'S1', gpa: 7.8, credits: 22 },
        { semester: 'S2', gpa: 8.0, credits: 24 },
        { semester: 'S3', gpa: 8.2, credits: 24 },
        { semester: 'S4', gpa: 8.4, credits: 26 },
        { semester: 'S5', gpa: 8.5, credits: 24 },
        { semester: 'S6', gpa: 8.5, credits: 22 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const currentCGPA = gpaTrend.length > 0 
    ? (gpaTrend.reduce((sum, s) => sum + s.gpa, 0) / gpaTrend.length).toFixed(2)
    : '0.00'

  const totalCredits = gpaTrend.reduce((sum, s) => sum + s.credits, 0)

  if (loading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Academic Performance</CardTitle>
          <CardDescription>Loading academic data...</CardDescription>
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Academic Performance
            </CardTitle>
            <CardDescription>Your academic journey at a glance</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {currentCGPA}
            </div>
            <div className="text-xs text-gray-500">Current CGPA</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="marks">Recent Marks</TabsTrigger>
            <TabsTrigger value="semester">Semester Wise</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* GPA Trend Chart */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                GPA Trend Across Semesters
              </h4>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gpaTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="semester"
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                    />
                    <YAxis
                      domain={[0, 10]}
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
                      formatter={(value: number, name: string) => [
                        name === 'gpa' ? value.toFixed(1) : value,
                        name === 'gpa' ? 'GPA' : 'Credits',
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="gpa"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7 }}
                      name="GPA"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    CGPA
                  </span>
                </div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {currentCGPA}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-teal-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Total Credits
                  </span>
                </div>
                <div className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                  {totalCredits}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Highest GPA
                  </span>
                </div>
                <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                  {Math.max(...gpaTrend.map((s) => s.gpa)).toFixed(1)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Rank
                  </span>
                </div>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  12th
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="marks">
            <ScrollArea className="h-72 rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-center">Exam Type</TableHead>
                    <TableHead className="text-center">Marks</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMarks.map((mark) => (
                    <TableRow key={mark.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{mark.subject}</div>
                          <div className="text-xs text-gray-500">
                            {mark.subjectCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{mark.examType}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div>
                          <span
                            className={`font-medium ${getPercentageColor(
                              mark.percentage
                            )}`}
                          >
                            {mark.obtainedMarks}
                          </span>
                          <span className="text-gray-400">/{mark.maxMarks}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {mark.percentage}%
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getGradeColor(mark.grade)}>
                          {mark.grade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="semester">
            <div className="space-y-4">
              {/* Semester Performance Bar Chart */}
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={semesterPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="semester"
                      tick={{ fontSize: 11 }}
                      stroke="#9ca3af"
                    />
                    <YAxis
                      domain={[0, 10]}
                      tick={{ fontSize: 12 }}
                      stroke="#9ca3af"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [value.toFixed(1), 'GPA']}
                    />
                    <Bar
                      dataKey="gpa"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      name="GPA"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Semester Table */}
              <ScrollArea className="h-48 rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                    <TableRow>
                      <TableHead>Semester</TableHead>
                      <TableHead className="text-center">GPA</TableHead>
                      <TableHead className="text-center">Credits</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {semesterPerformance.map((sem, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {sem.semester}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-bold ${getPercentageColor(
                              sem.gpa * 10
                            )}`}
                          >
                            {sem.gpa.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-gray-600 dark:text-gray-400">
                          {sem.credits}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              sem.status === 'Completed'
                                ? 'default'
                                : 'secondary'
                            }
                            className={
                              sem.status === 'Completed'
                                ? 'bg-emerald-500 hover:bg-emerald-600'
                                : ''
                            }
                          >
                            {sem.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>

        {/* Grade Legend */}
        <div className="mt-4 pt-4 border-t">
          <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Grade Scale
          </h5>
          <div className="flex flex-wrap gap-2">
            {[
              { grade: 'O', range: '90-100%' },
              { grade: 'A+', range: '80-89%' },
              { grade: 'A', range: '70-79%' },
              { grade: 'B+', range: '60-69%' },
              { grade: 'B', range: '50-59%' },
              { grade: 'C', range: '40-49%' },
            ].map((item) => (
              <div
                key={item.grade}
                className="flex items-center gap-1 text-xs"
              >
                <Badge className={getGradeColor(item.grade)}>
                  {item.grade}
                </Badge>
                <span className="text-gray-500">{item.range}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
