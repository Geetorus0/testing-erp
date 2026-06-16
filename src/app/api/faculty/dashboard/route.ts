import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Demo faculty ID for testing
const DEMO_FACULTY_ID = 'demo-faculty-001'

export async function GET() {
  try {
    // Try to get real data from database
    const faculty = await db.faculty.findFirst({
      include: {
        department: true,
        subjects: {
          include: {
            semester: true
          }
        }
      }
    })

    if (faculty) {
      // Get students count for all subjects taught by faculty
      const subjects = await db.subject.findMany({
        where: { facultyId: faculty.id },
        include: {
          semester: {
            include: {
              sections: {
                include: {
                  students: true
                }
              }
            }
          }
        }
      })

      const totalStudents = subjects.reduce((acc, subject) => {
        const sectionStudents = subject.semester?.sections?.flatMap(s => s.students) || []
        return acc + sectionStudents.length
      }, 0)

      // Get today's classes count
      const today = new Date()
      const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
      
      const todayClasses = await db.timetable.count({
        where: {
          subject: { facultyId: faculty.id },
          day: dayName
        }
      })

      // Get pending evaluations (submissions not yet evaluated)
      const pendingEvaluations = await db.submission.count({
        where: {
          assignment: { facultyId: faculty.id },
          evaluatedBy: null
        }
      })

      // Get materials uploaded count
      const materialsUploaded = await db.material.count({
        where: { facultyId: faculty.id }
      })

      return NextResponse.json({
        totalStudents,
        todayClasses,
        pendingEvaluations,
        materialsUploaded,
        facultyName: faculty.name,
        designation: faculty.designation || 'Faculty',
        department: faculty.department?.name || 'Department'
      })
    }
  } catch (error) {
    console.error('Dashboard API error:', error)
  }

  // Return demo data if no real data available
  return NextResponse.json({
    totalStudents: 156,
    todayClasses: 4,
    pendingEvaluations: 12,
    materialsUploaded: 23,
    facultyName: 'Dr. Sarah Johnson',
    designation: 'Associate Professor',
    department: 'Computer Science'
  })
}
