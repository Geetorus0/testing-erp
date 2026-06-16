import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/digital-twin/skill-gap - Get skill gap analysis for a student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId') || '1'
    const targetRole = searchParams.get('targetRole') || 'Software Engineer'

    // Try to fetch from database
    // For demo, we'll return mock data
    const skillGap = getMockSkillGap(studentId, targetRole)

    return NextResponse.json(skillGap)
  } catch (error) {
    console.error('Error fetching skill gap analysis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch skill gap analysis' },
      { status: 500 }
    )
  }
}

function getMockSkillGap(studentId: string, targetRole: string) {
  const roles: Record<string, Record<string, object>> = {
    'Software Engineer': {
      skills: [
        { name: 'Programming', current: 85, required: 90, gap: 5 },
        { name: 'Data Structures', current: 80, required: 85, gap: 5 },
        { name: 'Algorithms', current: 75, required: 85, gap: 10 },
        { name: 'System Design', current: 55, required: 75, gap: 20 },
        { name: 'Database', current: 70, required: 80, gap: 10 },
        { name: 'Cloud Computing', current: 65, required: 70, gap: 5 },
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
          url: 'https://educative.io/courses/system-design',
        },
        {
          id: '2',
          title: 'Effective Communication for Engineers',
          provider: 'Coursera',
          skills: ['Communication', 'Presentation'],
          duration: '15 hours',
          level: 'Beginner',
          url: 'https://coursera.org/learn/communication',
        },
        {
          id: '3',
          title: 'Advanced Algorithms & Data Structures',
          provider: 'LeetCode',
          skills: ['Algorithms', 'Data Structures', 'Problem Solving'],
          duration: '40 hours',
          level: 'Advanced',
          url: 'https://leetcode.com/learn',
        },
        {
          id: '4',
          title: 'AWS Solutions Architect',
          provider: 'AWS Training',
          skills: ['Cloud Computing', 'System Design'],
          duration: '30 hours',
          level: 'Intermediate',
          url: 'https://aws.amazon.com/training',
        },
      ],
    },
    'Data Scientist': {
      skills: [
        { name: 'Python', current: 90, required: 95, gap: 5 },
        { name: 'Machine Learning', current: 70, required: 85, gap: 15 },
        { name: 'Statistics', current: 65, required: 80, gap: 15 },
        { name: 'Data Visualization', current: 75, required: 80, gap: 5 },
        { name: 'SQL', current: 80, required: 85, gap: 5 },
        { name: 'Deep Learning', current: 50, required: 75, gap: 25 },
        { name: 'Big Data', current: 45, required: 70, gap: 25 },
        { name: 'Communication', current: 60, required: 75, gap: 15 },
      ],
      recommendedCourses: [
        {
          id: '1',
          title: 'Machine Learning Specialization',
          provider: 'Coursera',
          skills: ['Machine Learning', 'Python'],
          duration: '60 hours',
          level: 'Intermediate',
          url: 'https://coursera.org/learn/machine-learning',
        },
        {
          id: '2',
          title: 'Deep Learning Fundamentals',
          provider: 'DeepLearning.AI',
          skills: ['Deep Learning', 'Neural Networks'],
          duration: '40 hours',
          level: 'Advanced',
          url: 'https://deeplearning.ai',
        },
        {
          id: '3',
          title: 'Big Data with Spark',
          provider: 'Databricks',
          skills: ['Big Data', 'Spark'],
          duration: '25 hours',
          level: 'Intermediate',
          url: 'https://databricks.com/training',
        },
      ],
    },
    'Product Manager': {
      skills: [
        { name: 'Communication', current: 60, required: 90, gap: 30 },
        { name: 'Analytics', current: 70, required: 80, gap: 10 },
        { name: 'Technical Knowledge', current: 75, required: 70, gap: -5 },
        { name: 'Leadership', current: 50, required: 80, gap: 30 },
        { name: 'Market Research', current: 55, required: 75, gap: 20 },
        { name: 'User Research', current: 45, required: 70, gap: 25 },
        { name: 'Strategic Thinking', current: 60, required: 80, gap: 20 },
        { name: 'Presentation', current: 65, required: 85, gap: 20 },
      ],
      recommendedCourses: [
        {
          id: '1',
          title: 'Product Management Fundamentals',
          provider: 'Udemy',
          skills: ['Market Research', 'User Research'],
          duration: '30 hours',
          level: 'Beginner',
          url: 'https://udemy.com/course/product-management',
        },
        {
          id: '2',
          title: 'Leadership for Engineers',
          provider: 'LinkedIn Learning',
          skills: ['Leadership', 'Communication'],
          duration: '20 hours',
          level: 'Intermediate',
          url: 'https://linkedin.com/learning',
        },
      ],
    },
  }

  const roleData = roles[targetRole] || roles['Software Engineer']

  // Adjust based on student
  let skills = roleData.skills as Array<{ name: string; current: number; required: number; gap: number }>
  let recommendedCourses = roleData.recommendedCourses as Array<{
    id: string
    title: string
    provider: string
    skills: string[]
    duration: string
    level: string
    url?: string
  }>

  if (studentId === '2') {
    // High performer
    skills = skills.map((s) => ({
      ...s,
      current: Math.min(s.current + 15, 95),
      gap: Math.max(s.required - Math.min(s.current + 15, 95), 0),
    }))
  } else if (studentId === '3') {
    // Needs attention
    skills = skills.map((s) => ({
      ...s,
      current: Math.max(s.current - 20, 25),
      gap: Math.min(s.required - Math.max(s.current - 20, 25), 75),
    }))
  }

  const overallReadiness = Math.round(
    skills.reduce((sum, s) => sum + (s.current / s.required) * 100, 0) / skills.length
  )

  return {
    targetRole,
    skills,
    recommendedCourses,
    overallReadiness: Math.min(overallReadiness, 100),
    lastUpdated: new Date().toISOString(),
  }
}
