import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Demo HOD ID for testing
const DEMO_HOD_ID = 'demo-hod-001'

export async function GET() {
  try {
    // Try to get real data from database
    const hod = await db.faculty.findFirst({
      where: {
        user: { role: 'HOD' }
      },
      include: {
        department: true,
        user: true
      }
    })

    if (hod && hod.department) {
      const departmentId = hod.departmentId!

      // Get total faculty count in department
      const totalFaculty = await db.faculty.count({
        where: { departmentId }
      })

      // Get total students count in department
      const totalStudents = await db.student.count({
        where: { departmentId }
      })

      // Get attendance stats
      const attendanceRecords = await db.attendance.findMany({
        where: {
          student: { departmentId }
        },
        select: { status: true }
      })

      const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length
      const avgAttendance = attendanceRecords.length > 0 
        ? Math.round((presentCount / attendanceRecords.length) * 100) 
        : 85

      // Get marks/CGPA stats
      const marksRecords = await db.marks.findMany({
        where: {
          student: { departmentId }
        },
        select: { percentage: true }
      })

      const avgCgpa = marksRecords.length > 0
        ? Math.round((marksRecords.reduce((acc, m) => acc + (m.percentage || 0), 0) / marksRecords.length) / 10 * 100) / 10
        : 7.8

      // Get placement rate
      const placedStudents = await db.student.count({
        where: { 
          departmentId,
          placementStatus: 'PLACED'
        }
      })

      const placementRate = totalStudents > 0 
        ? Math.round((placedStudents / totalStudents) * 100) 
        : 78

      // Get active subjects count
      const activeSubjects = await db.subject.count({
        where: { 
          departmentId,
          isActive: true 
        }
      })

      return NextResponse.json({
        totalFaculty,
        totalStudents,
        avgAttendance,
        avgCgpa,
        placementRate,
        activeSubjects,
        hodName: hod.name,
        designation: hod.designation || 'Head of Department',
        department: hod.department.name,
        departmentCode: hod.department.code
      })
    }
  } catch (error) {
    console.error('HOD Dashboard API error:', error)
  }

  // Return demo data if no real data available
  return NextResponse.json({
    totalFaculty: 24,
    totalStudents: 456,
    avgAttendance: 87,
    avgCgpa: 7.8,
    placementRate: 78,
    activeSubjects: 32,
    hodName: 'Dr. Michael Anderson',
    designation: 'Professor & Head',
    department: 'Computer Science & Engineering',
    departmentCode: 'CSE'
  })
}
