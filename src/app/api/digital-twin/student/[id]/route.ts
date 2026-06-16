import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/digital-twin/student/:id - Get student digital twin data
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Try to fetch from database first
    const student = await db.student.findUnique({
      where: { id },
      include: {
        department: true,
        section: true,
        semester: true,
      },
    })

    if (!student) {
      // Return mock data for demo
      return NextResponse.json(getMockStudentData(id))
    }

    // Transform database data to digital twin format
    const digitalTwinData = {
      id: student.id,
      name: student.name,
      rollNumber: student.rollNumber,
      department: student.department?.name || 'Unknown',
      semester: student.semester?.name || 'Unknown',
      cgpa: student.cgpa || 0,
      attendancePercentage: student.attendancePercentage || 0,
      email: student.email,
      phone: student.phone,
      avatar: student.avatar,
      admissionDate: student.admissionDate,
      status: student.status,
    }

    return NextResponse.json(digitalTwinData)
  } catch (error) {
    console.error('Error fetching student digital twin:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student data' },
      { status: 500 }
    )
  }
}

function getMockStudentData(id: string) {
  const students: Record<string, object> = {
    '1': {
      id: '1',
      name: 'Rahul Sharma',
      rollNumber: 'CSE2021001',
      department: 'Computer Science & Engineering',
      semester: '6th Semester',
      cgpa: 8.5,
      attendancePercentage: 87,
      email: 'rahul.sharma@college.edu',
      phone: '+91 9876543210',
      admissionDate: '2021-08-01',
      status: 'active',
    },
    '2': {
      id: '2',
      name: 'Priya Patel',
      rollNumber: 'CSE2021015',
      department: 'Computer Science & Engineering',
      semester: '6th Semester',
      cgpa: 9.2,
      attendancePercentage: 95,
      email: 'priya.patel@college.edu',
      phone: '+91 9876543211',
      admissionDate: '2021-08-01',
      status: 'active',
    },
    '3': {
      id: '3',
      name: 'Amit Kumar',
      rollNumber: 'CSE2021008',
      department: 'Computer Science & Engineering',
      semester: '6th Semester',
      cgpa: 7.1,
      attendancePercentage: 68,
      email: 'amit.kumar@college.edu',
      phone: '+91 9876543212',
      admissionDate: '2021-08-01',
      status: 'at_risk',
    },
  }

  return students[id] || students['1']
}
