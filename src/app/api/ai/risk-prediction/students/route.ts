import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// AI Risk Prediction - At-Risk Students List
// Returns detailed list of students with their risk factors and recommendations

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const riskLevel = searchParams.get('riskLevel') || 'all'
  const department = searchParams.get('department') || 'all'
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    // Try to get real data from database
    const students = await db.student.findMany({
      where: { 
        status: 'active',
        ...(department !== 'all' && { department: { name: department } })
      },
      include: {
        department: true,
        section: true,
        attendance: {
          select: { status: true, date: true }
        },
        marks: {
          select: { percentage: true, examType: true, subject: { select: { name: true } } }
        },
        submissions: {
          select: { status: true, submittedAt: true, assignment: { select: { dueDate: true } } }
        },
        mentor: {
          select: { name: true, email: true }
        }
      },
      take: limit
    })

    if (students.length > 0) {
      // Calculate risk for each student
      const atRiskStudents = students.map(student => {
        // Calculate attendance metrics
        const totalAttendance = student.attendance.length
        const presentCount = student.attendance.filter(a => 
          a.status === 'present' || a.status === 'PRESENT'
        ).length
        const lateCount = student.attendance.filter(a => 
          a.status === 'late' || a.status === 'LATE'
        ).length
        const attendanceRate = totalAttendance > 0 
          ? Math.round((presentCount / totalAttendance) * 100) 
          : 100

        // Calculate marks metrics
        const marksCount = student.marks.length
        const avgMarks = marksCount > 0 
          ? Math.round(student.marks.reduce((acc, m) => acc + (m.percentage || 0), 0) / marksCount) 
          : 75

        // Calculate assignment submission rate
        const totalSubmissions = student.submissions.length
        const onTimeSubmissions = student.submissions.filter(s => 
          s.status !== 'late' && s.submittedAt <= s.assignment.dueDate
        ).length
        const submissionRate = totalSubmissions > 0 
          ? Math.round((onTimeSubmissions / totalSubmissions) * 100) 
          : 100

        // Calculate CGPA
        const cgpa = student.cgpa || 7.0

        // Risk Score Calculation
        const attendanceScore = attendanceRate >= 75 ? 100 : attendanceRate >= 60 ? 50 : 0
        const marksScore = avgMarks >= 70 ? 100 : avgMarks >= 50 ? 50 : 0
        const cgpaScore = cgpa >= 7 ? 100 : cgpa >= 5 ? 50 : 0
        const submissionScore = submissionRate >= 80 ? 100 : submissionRate >= 60 ? 50 : 0

        const totalScore = (attendanceScore * 0.25) + (marksScore * 0.30) + 
                          (cgpaScore * 0.25) + (submissionScore * 0.20)
        
        // Determine risk level
        let risk: 'low' | 'medium' | 'high'
        if (totalScore >= 70) risk = 'low'
        else if (totalScore >= 40) risk = 'medium'
        else risk = 'high'

        // Generate risk factors
        const riskFactors = []
        if (attendanceRate < 75) {
          riskFactors.push({
            factor: 'Low Attendance',
            value: `${attendanceRate}%`,
            threshold: '75%',
            impact: attendanceRate < 60 ? 'high' : 'medium'
          })
        }
        if (avgMarks < 60) {
          riskFactors.push({
            factor: 'Poor Academic Performance',
            value: `${avgMarks}%`,
            threshold: '60%',
            impact: avgMarks < 50 ? 'high' : 'medium'
          })
        }
        if (submissionRate < 80) {
          riskFactors.push({
            factor: 'Missed Assignments',
            value: `${submissionRate}%`,
            threshold: '80%',
            impact: submissionRate < 60 ? 'high' : 'medium'
          })
        }
        if (cgpa < 6.0) {
          riskFactors.push({
            factor: 'Low CGPA',
            value: cgpa.toFixed(1),
            threshold: '6.0',
            impact: cgpa < 5.0 ? 'high' : 'medium'
          })
        }

        // Generate recommended interventions
        const interventions = []
        if (attendanceRate < 70) {
          interventions.push('Schedule counseling session for attendance improvement')
        }
        if (avgMarks < 60) {
          interventions.push('Assign peer tutor for academic support')
          interventions.push('Provide additional study materials')
        }
        if (submissionRate < 70) {
          interventions.push('Set up assignment reminders and check-ins')
        }
        if (risk === 'high') {
          interventions.push('Immediate mentor meeting required')
          interventions.push('Parent notification recommended')
        }

        return {
          id: student.id,
          name: student.name,
          rollNumber: student.rollNumber,
          department: student.department?.name || 'Unknown',
          section: student.section?.name || '-',
          semester: student.currentSemester,
          cgpa,
          risk,
          riskScore: Math.round(totalScore),
          attendance: {
            rate: attendanceRate,
            presentCount,
            lateCount,
            totalClasses: totalAttendance
          },
          marks: {
            average: avgMarks,
            trend: avgMarks > 65 ? 'improving' : avgMarks < 55 ? 'declining' : 'stable'
          },
          submissions: {
            rate: submissionRate,
            onTime: onTimeSubmissions,
            total: totalSubmissions
          },
          riskFactors,
          interventions,
          mentor: student.mentor ? {
            name: student.mentor.name,
            email: student.mentor.email
          } : null
        }
      })

      // Filter by risk level if specified
      const filtered = riskLevel === 'all' 
        ? atRiskStudents 
        : atRiskStudents.filter(s => s.risk === riskLevel)

      // Sort by risk score (lowest first for high risk students)
      filtered.sort((a, b) => a.riskScore - b.riskScore)

      return NextResponse.json({
        students: filtered,
        total: filtered.length,
        summary: {
          high: atRiskStudents.filter(s => s.risk === 'high').length,
          medium: atRiskStudents.filter(s => s.risk === 'medium').length,
          low: atRiskStudents.filter(s => s.risk === 'low').length
        }
      })
    }
  } catch (error) {
    console.error('At-Risk Students API error:', error)
  }

  // Return demo data if no real data available
  const demoStudents = [
    {
      id: '1',
      name: 'Rahul Kumar',
      rollNumber: 'CSE2021045',
      department: 'Computer Science',
      section: 'A',
      semester: 5,
      cgpa: 5.2,
      risk: 'high' as const,
      riskScore: 28,
      attendance: { rate: 52, presentCount: 26, lateCount: 8, totalClasses: 50 },
      marks: { average: 45, trend: 'declining' as const },
      submissions: { rate: 40, onTime: 4, total: 10 },
      riskFactors: [
        { factor: 'Low Attendance', value: '52%', threshold: '75%', impact: 'high' },
        { factor: 'Poor Academic Performance', value: '45%', threshold: '60%', impact: 'high' },
        { factor: 'Missed Assignments', value: '40%', threshold: '80%', impact: 'high' },
        { factor: 'Low CGPA', value: '5.2', threshold: '6.0', impact: 'medium' }
      ],
      interventions: [
        'Immediate mentor meeting required',
        'Schedule counseling session for attendance improvement',
        'Assign peer tutor for academic support',
        'Parent notification recommended'
      ],
      mentor: { name: 'Dr. Priya Sharma', email: 'priya.sharma@college.edu' }
    },
    {
      id: '2',
      name: 'Anjali Patel',
      rollNumber: 'ECE2021023',
      department: 'Electronics',
      section: 'B',
      semester: 5,
      cgpa: 5.8,
      risk: 'high' as const,
      riskScore: 35,
      attendance: { rate: 58, presentCount: 29, lateCount: 5, totalClasses: 50 },
      marks: { average: 52, trend: 'declining' as const },
      submissions: { rate: 55, onTime: 6, total: 11 },
      riskFactors: [
        { factor: 'Low Attendance', value: '58%', threshold: '75%', impact: 'high' },
        { factor: 'Poor Academic Performance', value: '52%', threshold: '60%', impact: 'medium' }
      ],
      interventions: [
        'Immediate mentor meeting required',
        'Schedule counseling session for attendance improvement',
        'Assign peer tutor for academic support'
      ],
      mentor: null
    },
    {
      id: '3',
      name: 'Vikram Singh',
      rollNumber: 'ME2021034',
      department: 'Mechanical',
      section: 'A',
      semester: 5,
      cgpa: 6.1,
      risk: 'medium' as const,
      riskScore: 48,
      attendance: { rate: 68, presentCount: 34, lateCount: 6, totalClasses: 50 },
      marks: { average: 58, trend: 'stable' as const },
      submissions: { rate: 70, onTime: 7, total: 10 },
      riskFactors: [
        { factor: 'Low Attendance', value: '68%', threshold: '75%', impact: 'medium' }
      ],
      interventions: [
        'Schedule counseling session for attendance improvement'
      ],
      mentor: { name: 'Prof. Amit Verma', email: 'amit.verma@college.edu' }
    },
    {
      id: '4',
      name: 'Sneha Reddy',
      rollNumber: 'CSE2021078',
      department: 'Computer Science',
      section: 'C',
      semester: 5,
      cgpa: 6.5,
      risk: 'medium' as const,
      riskScore: 52,
      attendance: { rate: 72, presentCount: 36, lateCount: 4, totalClasses: 50 },
      marks: { average: 62, trend: 'improving' as const },
      submissions: { rate: 75, onTime: 8, total: 10 },
      riskFactors: [
        { factor: 'Missed Assignments', value: '75%', threshold: '80%', impact: 'medium' }
      ],
      interventions: [
        'Set up assignment reminders and check-ins'
      ],
      mentor: { name: 'Dr. Priya Sharma', email: 'priya.sharma@college.edu' }
    },
    {
      id: '5',
      name: 'Arjun Nair',
      rollNumber: 'CE2021012',
      department: 'Civil',
      section: 'A',
      semester: 5,
      cgpa: 5.5,
      risk: 'high' as const,
      riskScore: 32,
      attendance: { rate: 48, presentCount: 24, lateCount: 10, totalClasses: 50 },
      marks: { average: 42, trend: 'declining' as const },
      submissions: { rate: 35, onTime: 3, total: 9 },
      riskFactors: [
        { factor: 'Low Attendance', value: '48%', threshold: '75%', impact: 'high' },
        { factor: 'Poor Academic Performance', value: '42%', threshold: '60%', impact: 'high' },
        { factor: 'Missed Assignments', value: '35%', threshold: '80%', impact: 'high' }
      ],
      interventions: [
        'Immediate mentor meeting required',
        'Schedule counseling session for attendance improvement',
        'Assign peer tutor for academic support',
        'Parent notification recommended'
      ],
      mentor: null
    },
    {
      id: '6',
      name: 'Priya Gupta',
      rollNumber: 'EEE2021056',
      department: 'Electrical',
      section: 'B',
      semester: 5,
      cgpa: 6.8,
      risk: 'medium' as const,
      riskScore: 55,
      attendance: { rate: 70, presentCount: 35, lateCount: 3, totalClasses: 50 },
      marks: { average: 65, trend: 'improving' as const },
      submissions: { rate: 78, onTime: 8, total: 10 },
      riskFactors: [],
      interventions: [],
      mentor: { name: 'Prof. Ramesh Kumar', email: 'ramesh.kumar@college.edu' }
    },
    {
      id: '7',
      name: 'Karan Mehta',
      rollNumber: 'CSE2021089',
      department: 'Computer Science',
      section: 'A',
      semester: 5,
      cgpa: 7.2,
      risk: 'low' as const,
      riskScore: 78,
      attendance: { rate: 85, presentCount: 43, lateCount: 2, totalClasses: 50 },
      marks: { average: 72, trend: 'stable' as const },
      submissions: { rate: 92, onTime: 11, total: 12 },
      riskFactors: [],
      interventions: [],
      mentor: { name: 'Dr. Priya Sharma', email: 'priya.sharma@college.edu' }
    },
    {
      id: '8',
      name: 'Divya Sharma',
      rollNumber: 'ECE2021067',
      department: 'Electronics',
      section: 'A',
      semester: 5,
      cgpa: 7.8,
      risk: 'low' as const,
      riskScore: 85,
      attendance: { rate: 92, presentCount: 46, lateCount: 1, totalClasses: 50 },
      marks: { average: 78, trend: 'improving' as const },
      submissions: { rate: 95, onTime: 10, total: 10 },
      riskFactors: [],
      interventions: [],
      mentor: { name: 'Prof. Suresh Rao', email: 'suresh.rao@college.edu' }
    }
  ]

  // Filter by risk level
  const filtered = riskLevel === 'all' 
    ? demoStudents 
    : demoStudents.filter(s => s.risk === riskLevel)

  return NextResponse.json({
    students: filtered,
    total: filtered.length,
    summary: {
      high: demoStudents.filter(s => s.risk === 'high').length,
      medium: demoStudents.filter(s => s.risk === 'medium').length,
      low: demoStudents.filter(s => s.risk === 'low').length
    }
  })
}
