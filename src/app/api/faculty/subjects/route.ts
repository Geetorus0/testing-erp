import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Try to get real subjects from database
    const faculty = await db.faculty.findFirst()
    
    if (faculty) {
      const subjects = await db.subject.findMany({
        where: { facultyId: faculty.id },
        include: {
          department: true,
          semester: {
            include: {
              course: true
            }
          }
        }
      })

      const formattedSubjects = subjects.map(subject => ({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        section: 'Section A', // Default section
        semester: subject.semester ? `Semester ${subject.semester.number}` : 'N/A'
      }))

      if (formattedSubjects.length > 0) {
        return NextResponse.json({ subjects: formattedSubjects })
      }
    }
  } catch (error) {
    console.error('Subjects API error:', error)
  }

  // Return demo data if no real data available
  return NextResponse.json({
    subjects: [
      { id: '1', name: 'Data Structures', code: 'CS301', section: 'Section A', semester: '3rd Semester' },
      { id: '2', name: 'Algorithms', code: 'CS302', section: 'Section B', semester: '3rd Semester' },
      { id: '3', name: 'Machine Learning', code: 'CS401', section: 'Section A', semester: '5th Semester' },
      { id: '4', name: 'Database Systems', code: 'CS303', section: 'Section A', semester: '3rd Semester' },
      { id: '5', name: 'Computer Networks', code: 'CS402', section: 'Section C', semester: '5th Semester' }
    ]
  })
}
