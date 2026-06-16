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
import {
  AlertTriangle,
  User,
  BookOpen,
  Calendar,
  FileText,
  TrendingDown,
  Eye,
  UserPlus,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  Target,
  ChevronRight,
} from 'lucide-react'

interface AtRiskStudent {
  id: string
  name: string
  rollNumber: string
  department: string
  section: string
  semester: number
  cgpa: number
  risk: 'low' | 'medium' | 'high'
  riskScore: number
  attendance: {
    rate: number
    presentCount: number
    lateCount: number
    totalClasses: number
  }
  marks: {
    average: number
    trend: 'improving' | 'stable' | 'declining'
  }
  submissions: {
    rate: number
    onTime: number
    total: number
  }
  riskFactors: Array<{
    factor: string
    value: string
    threshold: string
    impact: 'high' | 'medium'
  }>
  interventions: string[]
  mentor: {
    name: string
    email: string
  } | null
}

interface StudentsResponse {
  students: AtRiskStudent[]
  total: number
  summary: {
    high: number
    medium: number
    low: number
  }
}

export default function SlowLearnerDetection() {
  const [data, setData] = useState<StudentsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [riskFilter, setRiskFilter] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState<AtRiskStudent | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [riskFilter])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/ai/risk-prediction/students?riskLevel=${riskFilter}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch at-risk students:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">High Risk</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Medium Risk</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Low Risk</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <span className="text-green-500 text-xs">↑ Improving</span>
      case 'declining':
        return <span className="text-red-500 text-xs">↓ Declining</span>
      default:
        return <span className="text-yellow-500 text-xs">→ Stable</span>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{data.summary.high}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <TrendingDown className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{data.summary.medium}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <User className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Risk</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data.summary.low}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Target className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Analyzed</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{data.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-emerald-500" />
                Potentially Struggling Students
              </CardTitle>
              <CardDescription>
                Students identified by AI as needing additional support
              </CardDescription>
            </div>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high">High Risk Only</SelectItem>
                <SelectItem value="medium">Medium Risk Only</SelectItem>
                <SelectItem value="low">Low Risk Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.students.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.rollNumber}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{student.department}</p>
                        <p className="text-xs text-muted-foreground">Sem {student.semester} • {student.section}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getRiskBadge(student.risk)}
                        <p className="text-xs text-muted-foreground">Score: {student.riskScore}/100</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{student.attendance.rate}%</span>
                        </div>
                        <Progress 
                          value={student.attendance.rate} 
                          className={`h-2 ${student.attendance.rate < 60 ? '[&>div]:bg-red-500' : student.attendance.rate < 75 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{student.marks.average}%</p>
                        {getTrendIcon(student.marks.trend)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${student.cgpa < 6 ? 'text-red-500' : student.cgpa < 7 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {student.cgpa.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {student.mentor ? (
                        <div>
                          <p className="text-sm font-medium">{student.mentor.name}</p>
                          <p className="text-xs text-muted-foreground">{student.mentor.email}</p>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600">Not Assigned</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <User className="h-5 w-5 text-emerald-500" />
                              Student Details: {selectedStudent?.name}
                            </DialogTitle>
                            <DialogDescription>
                              Comprehensive risk analysis and intervention recommendations
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedStudent && (
                            <div className="space-y-6">
                              {/* Basic Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">Roll Number</p>
                                  <p className="font-medium">{selectedStudent.rollNumber}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">Department</p>
                                  <p className="font-medium">{selectedStudent.department}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">Section</p>
                                  <p className="font-medium">{selectedStudent.section}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm text-muted-foreground">Semester</p>
                                  <p className="font-medium">{selectedStudent.semester}</p>
                                </div>
                              </div>

                              {/* Risk Factors */}
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                  Risk Factors
                                </h4>
                                <div className="space-y-2">
                                  {selectedStudent.riskFactors.map((factor, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${factor.impact === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                        <span className="text-sm">{factor.factor}</span>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-sm font-medium">{factor.value}</span>
                                        <span className="text-xs text-muted-foreground ml-2">(Threshold: {factor.threshold})</span>
                                      </div>
                                    </div>
                                  ))}
                                  {selectedStudent.riskFactors.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">No significant risk factors detected</p>
                                  )}
                                </div>
                              </div>

                              {/* Performance Indicators */}
                              <div className="grid grid-cols-3 gap-4">
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <Calendar className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                                    <p className="text-2xl font-bold">{selectedStudent.attendance.rate}%</p>
                                    <p className="text-xs text-muted-foreground">Attendance</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <BookOpen className="h-5 w-5 mx-auto mb-2 text-purple-500" />
                                    <p className="text-2xl font-bold">{selectedStudent.marks.average}%</p>
                                    <p className="text-xs text-muted-foreground">Average Marks</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <FileText className="h-5 w-5 mx-auto mb-2 text-orange-500" />
                                    <p className="text-2xl font-bold">{selectedStudent.submissions.rate}%</p>
                                    <p className="text-xs text-muted-foreground">Submissions</p>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Recommended Interventions */}
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <Target className="h-4 w-4 text-emerald-500" />
                                  Recommended Interventions
                                </h4>
                                <div className="space-y-2">
                                  {selectedStudent.interventions.map((intervention, i) => (
                                    <div key={i} className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                      <ChevronRight className="h-4 w-4 text-emerald-500 mt-0.5" />
                                      <span className="text-sm">{intervention}</span>
                                    </div>
                                  ))}
                                  {selectedStudent.interventions.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">No immediate interventions required</p>
                                  )}
                                </div>
                              </div>

                              {/* Mentor Assignment */}
                              <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                                <CardContent className="p-4">
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <UserPlus className="h-4 w-4 text-emerald-500" />
                                    Mentor Assignment
                                  </h4>
                                  {selectedStudent.mentor ? (
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                          <span className="text-sm font-semibold text-emerald-600">
                                            {selectedStudent.mentor.name.charAt(0)}
                                          </span>
                                        </div>
                                        <div>
                                          <p className="font-medium">{selectedStudent.mentor.name}</p>
                                          <p className="text-xs text-muted-foreground">{selectedStudent.mentor.email}</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button size="sm" variant="outline">
                                          <Mail className="h-4 w-4 mr-1" />
                                          Email
                                        </Button>
                                        <Button size="sm" variant="outline">
                                          <MessageSquare className="h-4 w-4 mr-1" />
                                          Message
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 text-yellow-600">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-sm">No mentor assigned</span>
                                      </div>
                                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                                        <UserPlus className="h-4 w-4 mr-1" />
                                        Assign Mentor
                                      </Button>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
