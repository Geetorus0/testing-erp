'use client'

import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BookOpen,
  Users,
  Target,
  Lightbulb,
  ArrowRight,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts'
import { cn } from '@/lib/utils'

export interface RiskFactor {
  name: string
  score: number
  weight: number
  trend: 'up' | 'down' | 'stable'
  description: string
}

export interface RecommendedAction {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: string
}

export interface HistoricalRiskPoint {
  month: string
  score: number
}

export interface RiskAnalysisData {
  overallScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  factors: RiskFactor[]
  recommendedActions: RecommendedAction[]
  historicalTrend: HistoricalRiskPoint[]
}

interface RiskAnalysisProps {
  data: RiskAnalysisData
}

const riskLevelConfig = {
  low: { 
    label: 'Low Risk', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-500',
    lightBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: CheckCircle2 
  },
  medium: { 
    label: 'Medium Risk', 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-500',
    lightBg: 'bg-amber-100 dark:bg-amber-900/30',
    icon: AlertCircle 
  },
  high: { 
    label: 'High Risk', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-500',
    lightBg: 'bg-orange-100 dark:bg-orange-900/30',
    icon: AlertTriangle 
  },
  critical: { 
    label: 'Critical Risk', 
    color: 'text-red-600', 
    bgColor: 'bg-red-500',
    lightBg: 'bg-red-100 dark:bg-red-900/30',
    icon: AlertTriangle 
  },
}

const priorityConfig = {
  high: { label: 'High', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
}

const factorIcons: Record<string, typeof Calendar> = {
  'Attendance Risk': Calendar,
  'Academic Risk': BookOpen,
  'Behavioral Risk': Users,
  'Engagement Risk': Target,
}

export default function RiskAnalysis({ data }: RiskAnalysisProps) {
  const { overallScore, riskLevel, factors, recommendedActions, historicalTrend } = data
  const config = riskLevelConfig[riskLevel]
  const RiskIcon = config.icon

  // Gauge chart data
  const gaugeData = [
    { name: 'score', value: overallScore },
    { name: 'remaining', value: 100 - overallScore },
  ]

  // Color based on score
  const getScoreColor = (score: number) => {
    if (score <= 25) return '#22c55e' // green
    if (score <= 50) return '#eab308' // amber
    if (score <= 75) return '#f97316' // orange
    return '#ef4444' // red
  }

  const scoreColor = getScoreColor(overallScore)

  // Calculate average trend
  const avgTrend = useMemo(() => {
    if (historicalTrend.length < 2) return 'stable'
    const recent = historicalTrend.slice(-3)
    const older = historicalTrend.slice(0, -3)
    if (older.length === 0) return 'stable'
    const recentAvg = recent.reduce((sum, p) => sum + p.score, 0) / recent.length
    const olderAvg = older.reduce((sum, p) => sum + p.score, 0) / older.length
    if (recentAvg > olderAvg + 5) return 'up'
    if (recentAvg < olderAvg - 5) return 'down'
    return 'stable'
  }, [historicalTrend])

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Risk Analysis
        </CardTitle>
        <CardDescription>
          Comprehensive risk assessment and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Gauge */}
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={0}
                  dataKey="value"
                >
                  <Cell fill={scoreColor} />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <div className="text-center">
                <div className={cn('text-4xl font-bold', config.color)}>
                  {overallScore}
                </div>
                <Badge className={cn(config.lightBg, config.color)}>
                  {config.label}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            Risk Factors Breakdown
          </h4>
          <div className="space-y-3">
            {factors.map((factor) => {
              const FactorIcon = factorIcons[factor.name] || Target
              const factorColor = getScoreColor(factor.score)
              const TrendIcon = factor.trend === 'up' ? TrendingUp : factor.trend === 'down' ? TrendingDown : Minus
              return (
                <div key={factor.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FactorIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{factor.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: factorColor }}>
                        {factor.score}
                      </span>
                      <TrendIcon className={cn(
                        'h-4 w-4',
                        factor.trend === 'up' && 'text-red-500',
                        factor.trend === 'down' && 'text-green-500',
                        factor.trend === 'stable' && 'text-gray-400'
                      )} />
                    </div>
                  </div>
                  <Progress 
                    value={factor.score} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">{factor.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Historical Trend */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Historical Risk Trend
          </h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalTrend}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={scoreColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={scoreColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke={scoreColor}
                  strokeWidth={2}
                  fill="url(#riskGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommended Actions */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Recommended Actions
          </h4>
          <ScrollArea className="h-[180px]">
            <div className="space-y-2">
              {recommendedActions.map((action) => (
                <div 
                  key={action.id}
                  className="bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{action.title}</span>
                        <Badge variant="outline" className={cn('text-xs', priorityConfig[action.priority].color)}>
                          {priorityConfig[action.priority].label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
