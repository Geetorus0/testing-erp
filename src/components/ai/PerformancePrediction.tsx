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
import { Input } from '@/components/ui/input'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Bar,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle2,
  Search,
  User,
  BookOpen,
  Calendar,
  FileText,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react'

interface PerformanceData {
  student: {
    id: string
    name: string
    rollNumber: string
    department: string
    section: string
    currentSemester: number
  }
  currentPerformance: {
    cgpa: number
    attendanceRate: number
    averageMarks: number
    submissionRate: number
  }
  prediction: {
    predictedGpa: number
    confidenceInterval: {
      lower: number
      upper: number
    }
    confidence: number
    change: number
  }
  factors: Array<{
    name: string
    impact: 'positive' | 'negative'
    description: string
    weight: number
  }>
  semesterHistory: Array<{
    semester: string
    gpa: number
    isPredicted: boolean
  }>
  recommendations: string[]
}

export default function PerformancePrediction() {
  const [studentId, setStudentId] = useState('CSE2021045')
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    fetchPrediction()
  }, [])

  const fetchPrediction = async (id?: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/ai/performance-prediction/${id || studentId}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch performance prediction:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (searchInput.trim()) {
      setStudentId(searchInput.trim())
      fetchPrediction(searchInput.trim())
    }
  }

  const getChangeIcon = (change: number) => {
    if (change > 0.1) return <ArrowUpRight className="h-5 w-5 text-green-500" />
    if (change < -0.1) return <ArrowDownRight className="h-5 w-5 text-red-500" />
    return <Minus className="h-5 w-5 text-yellow-500" />
  }

  const getChangeText = (change: number) => {
    if (change > 0.1) return <span className="text-green-500">+{change.toFixed(2)} predicted improvement</span>
    if (change < -0.1) return <span className="text-red-500">{change.toFixed(2)} predicted decline</span>
    return <span className="text-yellow-500">Stable performance expected</span>
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter Roll Number (e.g., CSE2021045, ECE2021023)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} className="bg-emerald-500 hover:bg-emerald-600">
              <Search className="h-4 w-4 mr-2" />
              Predict
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => { setStudentId('CSE2021045'); fetchPrediction('CSE2021045') }}>
              CSE2021045 (High Risk)
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setStudentId('CSE2021089'); fetchPrediction('CSE2021089') }}>
              CSE2021089 (Low Risk)
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setStudentId('ECE2021023'); fetchPrediction('ECE2021023') }}>
              ECE2021023 (High Risk)
            </Button>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          {/* Student Info & Prediction Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-500" />
                  Student Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {data.student.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{data.student.name}</h3>
                    <p className="text-sm text-muted-foreground">{data.student.rollNumber}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium">{data.student.department}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Section</span>
                    <span className="font-medium">{data.student.section}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Semester</span>
                    <span className="font-medium">{data.student.currentSemester}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prediction Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-emerald-500" />
                  GPA Prediction for Next Semester
                </CardTitle>
                <CardDescription>
                  AI-powered prediction based on historical performance data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Predicted GPA */}
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Predicted GPA</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                        {data.prediction.predictedGpa.toFixed(2)}
                      </span>
                      {getChangeIcon(data.prediction.change)}
                    </div>
                    <p className="text-xs mt-2">
                      {getChangeText(data.prediction.change)}
                    </p>
                  </div>

                  {/* Confidence Interval */}
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Confidence Range</p>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {data.prediction.confidenceInterval.lower.toFixed(1)} - {data.prediction.confidenceInterval.upper.toFixed(1)}
                    </div>
                    <div className="mt-2">
                      <Progress value={data.prediction.confidence} className="h-2" />
                    </div>
                    <p className="text-xs mt-1 text-muted-foreground">
                      {data.prediction.confidence}% confidence
                    </p>
                  </div>

                  {/* Current CGPA */}
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Current CGPA</p>
                    <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                      {data.currentPerformance.cgpa.toFixed(1)}
                    </div>
                    <p className="text-xs mt-2 text-muted-foreground">
                      Out of 10.0
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* GPA Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Semester GPA Trend
              </CardTitle>
              <CardDescription>
                Historical GPA progression with predicted semester highlighted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.semesterHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="semester" className="text-xs" />
                    <YAxis domain={[0, 10]} className="text-xs" />
                    <Tooltip />
                    <ReferenceLine y={7} stroke="#eab308" strokeDasharray="5 5" label="Target" />
                    <Bar 
                      dataKey="gpa" 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]}
                      name="GPA"
                    >
                      {data.semesterHistory.map((entry, index) => (
                        <rect 
                          key={`bar-${index}`}
                          fill={entry.isPredicted ? '#f59e0b' : '#10b981'}
                        />
                      ))}
                    </Bar>
                    <Line 
                      type="monotone" 
                      dataKey="gpa" 
                      stroke="#059669" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2 }}
                      name="Trend"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500"></div>
                  <span className="text-sm text-muted-foreground">Actual GPA</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-500"></div>
                  <span className="text-sm text-muted-foreground">Predicted GPA</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-2 border-yellow-500 border-dashed"></div>
                  <span className="text-sm text-muted-foreground">Target (7.0)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Factors & Current Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contributing Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-500" />
                  Factors Affecting Prediction
                </CardTitle>
                <CardDescription>
                  Key indicators influencing the GPA prediction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.factors.map((factor, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg ${
                        factor.impact === 'positive' 
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {factor.impact === 'positive' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          )}
                          <span className="font-medium">{factor.name}</span>
                        </div>
                        <Badge variant={factor.impact === 'positive' ? 'default' : 'destructive'}>
                          {Math.round(factor.weight * 100)}% weight
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{factor.description}</p>
                    </div>
                  ))}
                  {data.factors.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No significant factors identified
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-500" />
                  Current Performance Metrics
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of current academic standing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Attendance */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Attendance Rate</span>
                      </div>
                      <span className="font-semibold">{data.currentPerformance.attendanceRate}%</span>
                    </div>
                    <Progress 
                      value={data.currentPerformance.attendanceRate} 
                      className={`h-2 ${data.currentPerformance.attendanceRate < 60 ? '[&>div]:bg-red-500' : data.currentPerformance.attendanceRate < 75 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`}
                    />
                  </div>

                  {/* Average Marks */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Average Marks</span>
                      </div>
                      <span className="font-semibold">{data.currentPerformance.averageMarks}%</span>
                    </div>
                    <Progress 
                      value={data.currentPerformance.averageMarks} 
                      className={`h-2 ${data.currentPerformance.averageMarks < 50 ? '[&>div]:bg-red-500' : data.currentPerformance.averageMarks < 70 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`}
                    />
                  </div>

                  {/* Submission Rate */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Assignment Submission</span>
                      </div>
                      <span className="font-semibold">{data.currentPerformance.submissionRate}%</span>
                    </div>
                    <Progress 
                      value={data.currentPerformance.submissionRate} 
                      className={`h-2 ${data.currentPerformance.submissionRate < 60 ? '[&>div]:bg-red-500' : data.currentPerformance.submissionRate < 80 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-500" />
                AI Recommendations
              </CardTitle>
              <CardDescription>
                Personalized suggestions based on prediction analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
