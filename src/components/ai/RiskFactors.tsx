'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts'
import {
  Calendar,
  BookOpen,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Activity,
  PieChart as PieChartIcon,
} from 'lucide-react'

interface RiskFactorData {
  factor: string
  weight: number
  impact: 'high' | 'medium' | 'low'
  description: string
  currentValue: number
  threshold: number
  trend: 'improving' | 'stable' | 'declining'
}

const factorsData: RiskFactorData[] = [
  {
    factor: 'Attendance Patterns',
    weight: 30,
    impact: 'high',
    description: 'Regular class attendance is a strong predictor of academic success',
    currentValue: 72,
    threshold: 75,
    trend: 'improving'
  },
  {
    factor: 'Academic Performance',
    weight: 35,
    impact: 'high',
    description: 'Performance in internal assessments and semester exams',
    currentValue: 68,
    threshold: 70,
    trend: 'stable'
  },
  {
    factor: 'Assignment Submission',
    weight: 20,
    impact: 'medium',
    description: 'Timely submission of assignments and projects',
    currentValue: 78,
    threshold: 80,
    trend: 'improving'
  },
  {
    factor: 'Previous CGPA',
    weight: 15,
    impact: 'medium',
    description: 'Cumulative academic performance across semesters',
    currentValue: 6.8,
    threshold: 7.0,
    trend: 'stable'
  }
]

const radarData = [
  { factor: 'Attendance', value: 72, fullMark: 100 },
  { factor: 'Academics', value: 68, fullMark: 100 },
  { factor: 'Assignments', value: 78, fullMark: 100 },
  { factor: 'CGPA', value: 68, fullMark: 100 },
  { factor: 'Participation', value: 75, fullMark: 100 },
  { factor: 'Consistency', value: 70, fullMark: 100 },
]

const trendAnalysisData = [
  { month: 'Jan', attendance: 65, marks: 62, assignments: 70 },
  { month: 'Feb', attendance: 68, marks: 65, assignments: 72 },
  { month: 'Mar', attendance: 70, marks: 66, assignments: 75 },
  { month: 'Apr', attendance: 72, marks: 68, assignments: 78 },
  { month: 'May', attendance: 74, marks: 70, assignments: 80 },
  { month: 'Jun', attendance: 76, marks: 72, assignments: 82 },
]

export default function RiskFactors() {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'declining': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-yellow-500" />
    }
  }

  const getFactorIcon = (factor: string) => {
    switch (factor) {
      case 'Attendance Patterns': return <Calendar className="h-5 w-5" />
      case 'Academic Performance': return <BookOpen className="h-5 w-5" />
      case 'Assignment Submission': return <FileText className="h-5 w-5" />
      case 'Previous CGPA': return <TrendingUp className="h-5 w-5" />
      default: return <Activity className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Factor Importance Weights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-emerald-500" />
            Risk Factor Importance Weights
          </CardTitle>
          <CardDescription>
            Relative importance of each factor in determining student risk level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {factorsData.map((factor, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                      {getFactorIcon(factor.factor)}
                    </div>
                    <div>
                      <p className="font-medium">{factor.factor}</p>
                      <p className="text-xs text-muted-foreground">{factor.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getImpactColor(factor.impact)}>
                      {factor.impact} impact
                    </Badge>
                    <span className="font-bold text-lg">{factor.weight}%</span>
                  </div>
                </div>
                <Progress value={factor.weight} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Risk Factor Analysis
            </CardTitle>
            <CardDescription>
              Multi-dimensional view of student performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis dataKey="factor" className="text-xs" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Performance Trend Analysis
            </CardTitle>
            <CardDescription>
              Monthly progression of key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendAnalysisData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attendance" fill="#10b981" name="Attendance %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="marks" fill="#f59e0b" name="Marks %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="assignments" fill="#6366f1" name="Assignments %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Factor Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attendance Patterns */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Attendance Patterns
              </CardTitle>
              {getTrendIcon('improving')}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Rate</span>
                <span className="font-semibold">72%</span>
              </div>
              <Progress value={72} className="h-3" />
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <div className="font-bold text-green-600 dark:text-green-400">68%</div>
                  <div className="text-muted-foreground">Present</div>
                </div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <div className="font-bold text-yellow-600 dark:text-yellow-400">4%</div>
                  <div className="text-muted-foreground">Late</div>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <div className="font-bold text-red-600 dark:text-red-400">28%</div>
                  <div className="text-muted-foreground">Absent</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Weight: 30% - Students below 75% attendance show 2.5x higher risk
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Academic Performance */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-500" />
                Academic Performance
              </CardTitle>
              {getTrendIcon('stable')}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Average Marks</span>
                <span className="font-semibold">68%</span>
              </div>
              <Progress value={68} className="h-3" />
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <div className="font-bold text-green-600 dark:text-green-400">45%</div>
                  <div className="text-muted-foreground">Above 75%</div>
                </div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <div className="font-bold text-yellow-600 dark:text-yellow-400">35%</div>
                  <div className="text-muted-foreground">50-75%</div>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <div className="font-bold text-red-600 dark:text-red-400">20%</div>
                  <div className="text-muted-foreground">Below 50%</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Weight: 35% - Marks below 50% strongly correlate with dropout risk
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Submission */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                Assignment Submission
              </CardTitle>
              {getTrendIcon('improving')}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Submission Rate</span>
                <span className="font-semibold">78%</span>
              </div>
              <Progress value={78} className="h-3" />
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <div className="font-bold text-green-600 dark:text-green-400">70%</div>
                  <div className="text-muted-foreground">On Time</div>
                </div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <div className="font-bold text-yellow-600 dark:text-yellow-400">15%</div>
                  <div className="text-muted-foreground">Late</div>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <div className="font-bold text-red-600 dark:text-red-400">15%</div>
                  <div className="text-muted-foreground">Missing</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Weight: 20% - Late/missed submissions indicate time management issues
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Previous Semester Results */}
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-500" />
                Previous Semester CGPA
              </CardTitle>
              {getTrendIcon('stable')}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Average CGPA</span>
                <span className="font-semibold">6.8 / 10.0</span>
              </div>
              <Progress value={68} className="h-3" />
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <div className="font-bold text-green-600 dark:text-green-400">40%</div>
                  <div className="text-muted-foreground">Above 7.5</div>
                </div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <div className="font-bold text-yellow-600 dark:text-yellow-400">38%</div>
                  <div className="text-muted-foreground">6.0-7.5</div>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <div className="font-bold text-red-600 dark:text-red-400">22%</div>
                  <div className="text-muted-foreground">Below 6.0</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Weight: 15% - CGPA below 6.0 indicates significant academic challenges
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-500 mt-1" />
            <div>
              <h4 className="font-semibold">AI Risk Factor Summary</h4>
              <p className="text-sm text-muted-foreground mt-1">
                The AI model analyzes these factors using a weighted algorithm to predict student risk levels. 
                Attendance and academic performance carry the highest weights (30% and 35% respectively) 
                as they show the strongest correlation with student success.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
