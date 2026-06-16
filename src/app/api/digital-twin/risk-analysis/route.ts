import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/digital-twin/risk-analysis - Get risk analysis for a student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId') || '1'

    // Try to fetch from database
    // For demo, we'll return mock data
    const riskAnalysis = getMockRiskAnalysis(studentId)

    return NextResponse.json(riskAnalysis)
  } catch (error) {
    console.error('Error fetching risk analysis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch risk analysis' },
      { status: 500 }
    )
  }
}

function getMockRiskAnalysis(studentId: string) {
  // Base risk data
  const baseData = {
    '1': {
      overallScore: 28,
      riskLevel: 'low' as const,
      factors: [
        {
          name: 'Attendance Risk',
          score: 18,
          weight: 0.3,
          trend: 'down' as const,
          description: 'Attendance has improved after warning. Currently at 87%.',
        },
        {
          name: 'Academic Risk',
          score: 15,
          weight: 0.35,
          trend: 'down' as const,
          description: 'Strong academic performance with CGPA of 8.5. Good trajectory.',
        },
        {
          name: 'Behavioral Risk',
          score: 35,
          weight: 0.2,
          trend: 'up' as const,
          description: 'Some concerns about participation in group activities.',
        },
        {
          name: 'Engagement Risk',
          score: 22,
          weight: 0.15,
          trend: 'stable' as const,
          description: 'Active in certifications and projects. Good engagement.',
        },
      ],
      recommendedActions: [
        {
          id: '1',
          title: 'Improve Group Participation',
          description: 'Join more team activities and improve collaboration skills.',
          priority: 'medium' as const,
          category: 'Behavioral',
        },
        {
          id: '2',
          title: 'Maintain Attendance',
          description: 'Continue attending all classes to maintain good attendance.',
          priority: 'low' as const,
          category: 'Attendance',
        },
        {
          id: '3',
          title: 'Prepare for Final Placements',
          description: 'Focus on aptitude and technical interview preparation.',
          priority: 'high' as const,
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
    },
    '2': {
      // High performer - low risk
      overallScore: 12,
      riskLevel: 'low' as const,
      factors: [
        {
          name: 'Attendance Risk',
          score: 8,
          weight: 0.3,
          trend: 'down' as const,
          description: 'Excellent attendance at 95%. No concerns.',
        },
        {
          name: 'Academic Risk',
          score: 10,
          weight: 0.35,
          trend: 'down' as const,
          description: 'Outstanding academic performance with CGPA of 9.2.',
        },
        {
          name: 'Behavioral Risk',
          score: 15,
          weight: 0.2,
          trend: 'stable' as const,
          description: 'Good participation in all activities.',
        },
        {
          name: 'Engagement Risk',
          score: 12,
          weight: 0.15,
          trend: 'down' as const,
          description: 'Very active in clubs, events, and projects.',
        },
      ],
      recommendedActions: [
        {
          id: '1',
          title: 'Apply for Research Programs',
          description: 'Consider applying for research assistant positions.',
          priority: 'low' as const,
          category: 'Academic',
        },
        {
          id: '2',
          title: 'Leadership Opportunities',
          description: 'Take on leadership roles in student organizations.',
          priority: 'medium' as const,
          category: 'Development',
        },
      ],
      historicalTrend: [
        { month: 'Jan', score: 25 },
        { month: 'Feb', score: 20 },
        { month: 'Mar', score: 18 },
        { month: 'Apr', score: 15 },
        { month: 'May', score: 13 },
        { month: 'Jun', score: 12 },
      ],
    },
    '3': {
      // Needs attention - high risk
      overallScore: 68,
      riskLevel: 'high' as const,
      factors: [
        {
          name: 'Attendance Risk',
          score: 78,
          weight: 0.3,
          trend: 'up' as const,
          description: 'Critical: Attendance at 68%, below required 75%.',
        },
        {
          name: 'Academic Risk',
          score: 55,
          weight: 0.35,
          trend: 'up' as const,
          description: 'CGPA of 7.1 is below average. Needs improvement.',
        },
        {
          name: 'Behavioral Risk',
          score: 72,
          weight: 0.2,
          trend: 'up' as const,
          description: 'Multiple warnings for disciplinary issues.',
        },
        {
          name: 'Engagement Risk',
          score: 60,
          weight: 0.15,
          trend: 'stable' as const,
          description: 'Low participation in campus activities.',
        },
      ],
      recommendedActions: [
        {
          id: '1',
          title: 'URGENT: Improve Attendance',
          description: 'Must attend all remaining classes to avoid detention.',
          priority: 'high' as const,
          category: 'Attendance',
        },
        {
          id: '2',
          title: 'Academic Support Required',
          description: 'Meet with academic advisor for course planning.',
          priority: 'high' as const,
          category: 'Academic',
        },
        {
          id: '3',
          title: 'Counseling Session',
          description: 'Schedule meeting with student counselor.',
          priority: 'high' as const,
          category: 'Support',
        },
        {
          id: '4',
          title: 'Parent-Teacher Meeting',
          description: 'Arrange meeting with parents to discuss concerns.',
          priority: 'high' as const,
          category: 'Communication',
        },
      ],
      historicalTrend: [
        { month: 'Jan', score: 45 },
        { month: 'Feb', score: 52 },
        { month: 'Mar', score: 58 },
        { month: 'Apr', score: 62 },
        { month: 'May', score: 65 },
        { month: 'Jun', score: 68 },
      ],
    },
  }

  return baseData[studentId as keyof typeof baseData] || baseData['1']
}
