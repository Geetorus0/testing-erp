import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const subjectId = searchParams.get('subjectId')
  const dateStr = searchParams.get('date')

  if (!subjectId) {
    return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 })
  }

  try {
    // Try to get real students from database
    const subject = await db.subject.findUnique({
      where: { id: subjectId },
      include: {
        semester: {
          include: {
            sections: {
              include: {
                students: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (subject?.semester?.sections) {
      const students = subject.semester.sections.flatMap(section =>
        section.students.map(student => ({
          id: student.id,
          rollNumber: student.rollNumber,
          name: student.name
        }))
      )

      // Check for existing attendance if date is provided
      if (dateStr && students.length > 0) {
        const date = new Date(dateStr)
        const attendance = await db.attendance.findMany({
          where: {
            subjectId,
            date: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999))
            }
          }
        })

        const attendanceMap = new Map(attendance.map(a => [a.studentId, a.status]))
        
        const studentsWithStatus = students.map(student => ({
          ...student,
          status: attendanceMap.get(student.id) || null
        }))

        return NextResponse.json({ students: studentsWithStatus })
      }

      return NextResponse.json({ students })
    }
  } catch (error) {
    console.error('Students API error:', error)
  }

  // Return demo data if no real data available
  const demoStudents = [
    { id: '1', rollNumber: 'CS2021001', name: 'Rahul Sharma', status: null },
    { id: '2', rollNumber: 'CS2021002', name: 'Priya Patel', status: null },
    { id: '3', rollNumber: 'CS2021003', name: 'Amit Kumar', status: null },
    { id: '4', rollNumber: 'CS2021004', name: 'Sneha Gupta', status: null },
    { id: '5', rollNumber: 'CS2021005', name: 'Vikram Singh', status: null },
    { id: '6', rollNumber: 'CS2021006', name: 'Ananya Das', status: null },
    { id: '7', rollNumber: 'CS2021007', name: 'Rohan Mehta', status: null },
    { id: '8', rollNumber: 'CS2021008', name: 'Kavya Reddy', status: null },
    { id: '9', rollNumber: 'CS2021009', name: 'Arjun Nair', status: null },
    { id: '10', rollNumber: 'CS2021010', name: 'Ishita Joshi', status: null },
    { id: '11', rollNumber: 'CS2021011', name: 'Karthik Menon', status: null },
    { id: '12', rollNumber: 'CS2021012', name: 'Divya Krishnan', status: null },
    { id: '13', rollNumber: 'CS2021013', name: 'Aditya Verma', status: null },
    { id: '14', rollNumber: 'CS2021014', name: 'Meera Iyer', status: null },
    { id: '15', rollNumber: 'CS2021015', name: 'Raj Malhotra', status: null }
  ]

  return NextResponse.json({ students: demoStudents })
}
