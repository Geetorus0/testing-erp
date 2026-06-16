import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface AttendanceRecord {
  studentId: string
  status: 'present' | 'absent' | 'late' | 'excused'
}

interface AttendanceRequest {
  subjectId: string
  date: string
  attendance: AttendanceRecord[]
}

export async function POST(request: NextRequest) {
  try {
    const body: AttendanceRequest = await request.json()
    const { subjectId, date, attendance } = body

    if (!subjectId || !date || !attendance || attendance.length === 0) {
      return NextResponse.json(
        { error: 'Subject ID, date, and attendance records are required' },
        { status: 400 }
      )
    }

    // Get faculty for the markedBy field
    const faculty = await db.faculty.findFirst()
    const markedBy = faculty?.id || 'demo-faculty-001'

    // Get tenant ID
    const tenant = await db.tenant.findFirst()
    const tenantId = tenant?.id

    // Get subject to find semester
    const subject = await db.subject.findUnique({
      where: { id: subjectId },
      include: { semester: true }
    })

    const semesterId = subject?.semesterId

    const attendanceDate = new Date(date)

    // Use transaction to save all attendance records
    const results = await db.$transaction(
      attendance.map(record => 
        db.attendance.upsert({
          where: {
            tenantId_studentId_subjectId_date: {
              tenantId: tenantId || 'demo-tenant',
              studentId: record.studentId,
              subjectId,
              date: attendanceDate
            }
          },
          create: {
            tenantId: tenantId || 'demo-tenant',
            studentId: record.studentId,
            subjectId,
            semesterId: semesterId || 'demo-semester',
            date: attendanceDate,
            status: record.status,
            markedBy
          },
          update: {
            status: record.status,
            markedBy
          }
        })
      )
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Attendance saved successfully',
      count: results.length 
    })
  } catch (error) {
    console.error('Attendance save error:', error)
    return NextResponse.json(
      { error: 'Failed to save attendance' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const subjectId = searchParams.get('subjectId')
  const studentId = searchParams.get('studentId')

  try {
    const where: Record<string, unknown> = {}
    if (subjectId) where.subjectId = subjectId
    if (studentId) where.studentId = studentId

    const attendance = await db.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            rollNumber: true,
            name: true
          }
        },
        subject: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error('Attendance fetch error:', error)
    return NextResponse.json({ attendance: [] })
  }
}
