import { NextResponse } from 'next/server'

// Mock data for student attendance
// In production, this would fetch from database
export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  const attendanceData = {
    overallAttendance: 87,
    subjects: [
      {
        id: '1',
        subject: 'Data Structures & Algorithms',
        subjectCode: 'CS301',
        totalClasses: 45,
        attendedClasses: 42,
        percentage: 93,
        trend: 'up',
      },
      {
        id: '2',
        subject: 'Database Management Systems',
        subjectCode: 'CS302',
        totalClasses: 42,
        attendedClasses: 38,
        percentage: 90,
        trend: 'stable',
      },
      {
        id: '3',
        subject: 'Operating Systems',
        subjectCode: 'CS303',
        totalClasses: 40,
        attendedClasses: 35,
        percentage: 87,
        trend: 'up',
      },
      {
        id: '4',
        subject: 'Computer Networks',
        subjectCode: 'CS304',
        totalClasses: 38,
        attendedClasses: 30,
        percentage: 79,
        trend: 'down',
      },
      {
        id: '5',
        subject: 'Software Engineering',
        subjectCode: 'CS305',
        totalClasses: 35,
        attendedClasses: 25,
        percentage: 71,
        trend: 'down',
      },
      {
        id: '6',
        subject: 'Machine Learning',
        subjectCode: 'CS306',
        totalClasses: 30,
        attendedClasses: 18,
        percentage: 60,
        trend: 'stable',
      },
    ],
    monthlyTrend: [
      { month: 'Jan', attendance: 82, target: 75 },
      { month: 'Feb', attendance: 85, target: 75 },
      { month: 'Mar', attendance: 78, target: 75 },
      { month: 'Apr', attendance: 88, target: 75 },
      { month: 'May', attendance: 90, target: 75 },
      { month: 'Jun', attendance: 87, target: 75 },
    ],
    summary: {
      totalClasses: 230,
      totalAttended: 188,
      classesMissed: 42,
      consecutivePresent: 12,
      improvementFromLastMonth: 2,
    },
  }

  return NextResponse.json(attendanceData)
}
