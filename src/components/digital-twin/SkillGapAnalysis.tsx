'use client'

import { useState } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import {
  Target,
  TrendingUp,
  BookOpen,
  Award,
  ExternalLink,
  CheckCircle2,
  Circle,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Skill {
  name: string
  current: number
  required: number
  gap: number
}

export interface RecommendedCourse {
  id: string
  title: string
  provider: string
  skills: string[]
  duration: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  url?: string
}

export interface SkillGapData {
  targetRole: string
  skills: Skill[]
  recommendedCourses: RecommendedCourse[]
  overallReadiness: number
}

interface SkillGapAnalysisProps {
  data: SkillGapData
}

const levelColors = {
  Beginner: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  Intermediate: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  Advanced: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
}

export default function SkillGapAnalysis({ data }: SkillGapAnalysisProps) {
  const { targetRole, skills, recommendedCourses, overallReadiness } = data
  const [selectedRole, setSelectedRole] = useState(targetRole)

  // Transform data for radar chart
  const radarData = skills.map((skill) => ({
    skill: skill.name,
    current: skill.current,
    required: skill.required,
  }))

  // Sort skills by gap (descending)
  const sortedSkills = [...skills].sort((a, b) => b.gap - a.gap)

  // Critical gaps (gap > 30)
  const criticalGaps = skills.filter((s) => s.gap > 30)

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              Skill Gap Analysis
            </CardTitle>
            <CardDescription>
              Target Role: <span className="font-medium text-foreground">{selectedRole}</span>
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">{overallReadiness}%</div>
            <p className="text-xs text-muted-foreground">Role Readiness</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="gaps">Gap Details</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-0">
            {/* Radar Chart */}
            <div className="bg-muted/30 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="skill" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Radar
                    name="Required"
                    dataKey="required"
                    stroke="#f97316"
                    fill="#f97316"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    formatter={(value) => <span className="text-sm">{value}</span>}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {skills.filter((s) => s.gap <= 10).length}
                </div>
                <p className="text-xs text-muted-foreground">Strong Skills</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {skills.filter((s) => s.gap > 10 && s.gap <= 30).length}
                </div>
                <p className="text-xs text-muted-foreground">Developing</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {criticalGaps.length}
                </div>
                <p className="text-xs text-muted-foreground">Critical Gaps</p>
              </div>
            </div>

            {/* Critical Gaps Alert */}
            {criticalGaps.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                  Critical Skill Gaps
                </h4>
                <div className="flex flex-wrap gap-2">
                  {criticalGaps.map((skill) => (
                    <Badge key={skill.name} variant="destructive" className="text-xs">
                      {skill.name}: {skill.gap}% gap
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="gaps" className="space-y-4 mt-0">
            <ScrollArea className="h-[340px]">
              <div className="space-y-3">
                {sortedSkills.map((skill) => {
                  const isStrong = skill.gap <= 10
                  const isDeveloping = skill.gap > 10 && skill.gap <= 30
                  const isCritical = skill.gap > 30
                  return (
                    <div 
                      key={skill.name}
                      className="bg-muted/50 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isStrong ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Circle className={cn(
                              'h-4 w-4',
                              isDeveloping && 'text-amber-500',
                              isCritical && 'text-red-500'
                            )} />
                          )}
                          <span className="font-medium text-sm">{skill.name}</span>
                        </div>
                        <Badge 
                          variant="outline"
                          className={cn(
                            isStrong && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
                            isDeveloping && 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
                            isCritical && 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          )}
                        >
                          {isStrong ? 'Strong' : isDeveloping ? 'Developing' : 'Critical'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Level</p>
                          <div className="flex items-center gap-2">
                            <Progress value={skill.current} className="h-2 flex-1" />
                            <span className="text-sm font-medium w-8">{skill.current}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Required Level</p>
                          <div className="flex items-center gap-2">
                            <Progress value={skill.required} className="h-2 flex-1" />
                            <span className="text-sm font-medium w-8">{skill.required}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Skill Gap</span>
                        <span className={cn(
                          'font-bold',
                          isCritical && 'text-red-600',
                          isDeveloping && 'text-amber-600',
                          isStrong && 'text-emerald-600'
                        )}>
                          {skill.gap}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4 mt-0">
            <ScrollArea className="h-[340px]">
              <div className="space-y-3">
                {recommendedCourses.map((course) => (
                  <div 
                    key={course.id}
                    className="bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{course.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={cn('text-xs', levelColors[course.level])}
                          >
                            {course.level}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {course.provider} • {course.duration}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {course.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
