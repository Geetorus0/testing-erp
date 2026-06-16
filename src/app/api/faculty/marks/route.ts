import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface MarksRecord {
  studentId: string
  marks: number
}

interface MarksRequest {
  subjectId: string
  examType: string
  maxMarks: number
  marks: MarksRecord[]
}

export async function POST(request: NextRequest) {
  try {
    const body: MarksRequest = await request.json()
    const { subjectId, examType, maxMarks, marks } = body

    if (!subjectId || !examType || !marks || marks.length === 0) {
      return NextResponse.json(
        { error: 'Subject ID, exam type, and marks records are required' },
        { status: 400 }
      )
    }

    // Get faculty for the enteredBy field
    const faculty = await db.faculty.findFirst()
    const enteredBy = faculty?.id || 'demo-faculty-001'

    // Get tenant ID
    const tenant = await db.tenant.findFirst()
    const tenantId = tenant?.id

    // Get subject to find semester
    const subject = await db.subject.findUnique({
      where: { id: subjectId },
      include: { semester: true }
    })

    const semesterId = subject?.semesterId

    // Use transaction to save all marks records
    const results = await db.$transaction(
      marks.map(record => {
        const obtainedMarks = Math.min(Math.max(0, record.marks), maxMarks)
        const percentage = (obtainedMarks / maxMarks) * 100
        
        // Calculate grade based on percentage
        let grade = 'F'
        if (percentage >= 90) grade = 'O'
        else if (percentage >= 80) grade = 'A+'
        else if (percentage >= 70) grade = 'A'
        else if (percentage >= 60) grade = 'B+'
        else if (percentage >= 50) grade = 'B'
        else if (percentage >= 40) grade = 'C'

        return db.marks.upsert({
          where: {
            tenantId_studentId_subjectId_examType: {
              tenantId: tenantId || 'demo-tenant',
              studentId: record.studentId,
              subjectId,
              examType
            }
          },
          create: {
            tenantId: tenantId || 'demo-tenant',
            studentId: record.studentId,
            subjectId,
            semesterId: semesterId || 'demo-semester',
            examType,
            maxMarks,
            obtainedMarks,
            percentage,
            grade,
            enteredBy
          },
          update: {
            maxMarks,
            obtainedMarks,
            percentage,
            grade,
            enteredBy
          }
        })
      })
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Marks saved successfully',
      count: results.length 
    })
  } catch (error) {
    console.error('Marks save error:', error)
    return NextResponse.json(
      { error: 'Failed to save marks' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const subjectId = searchParams.get('subjectId')
  const studentId = searchParams.get('studentId')
  const examType = searchParams.get('examType')

  try {
    const where: Record<string, unknown> = {}
    if (subjectId) where.subjectId = subjectId
    if (studentId) where.studentId = studentId
    if (examType) where.examType = examType

    const marks = await db.marks.findMany({
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
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ marks })
  } catch (error) {
    console.error('Marks fetch error:', error)
    return NextResponse.json({ marks: [] })
  }
}
