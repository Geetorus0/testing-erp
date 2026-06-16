import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Try to get real data from database
    const hod = await db.faculty.findFirst({
      where: {
        user: { role: 'HOD' }
      },
      include: {
        department: true
      }
    })

    if (hod && hod.departmentId) {
      const departmentId = hod.departmentId

      // Year-wise student distribution
      const students = await db.student.findMany({
        where: { departmentId },
        include: {
          section: {
            include: {
              semester: true
            }
          }
        }
      })

      const yearDistribution: Record<number, number> = {}
      const sectionDistribution: Record<string, number> = {}

      students.forEach(student => {
        const year = student.section?.semester?.number 
          ? Math.ceil(student.section.semester.number / 2) 
          : 1
        yearDistribution[year] = (yearDistribution[year] || 0) + 1

        const sectionName = student.section?.name || 'Unknown'
        sectionDistribution[sectionName] = (sectionDistribution[sectionName] || 0) + 1
      })

      const yearWiseDistribution = Object.entries(yearDistribution).map(([year, count]) => ({
        year: `${year}${year === '1' ? 'st' : year === '2' ? 'nd' : year === '3' ? 'rd' : 'th'} Year`,
        count
      }))

      const sectionWiseStrength = Object.entries(sectionDistribution).map(([section, count]) => ({
        section,
        count
      }))

      // Risk students (high risk score >= 50)
      const riskStudents = students
        .filter(s => (s.riskScore || 0) >= 50)
        .map(s => ({
          id: s.id,
          name: s.name,
          rollNo: s.rollNo,
          cgpa: s.cgpa || 0,
          attendance: s.attendancePercentage || 0,
          riskScore: s.riskScore || 0,
          riskFactors: calculateRiskFactors(s)
        }))
        .sort((a, b) => b.riskScore - a.riskScore)

      // Top performers
      const topPerformers = students
        .filter(s => (s.cgpa || 0) >= 8.5)
        .map(s => ({
          id: s.id,
          name: s.name,
          rollNo: s.rollNo,
          cgpa: s.cgpa || 0,
          attendance: s.attendancePercentage || 0,
          achievements: []
        }))
        .sort((a, b) => b.cgpa - a.cgpa)
        .slice(0, 10)

      // Subject allocation
      const subjects = await db.subject.findMany({
        where: { departmentId },
        include: {
          faculty: true,
          semester: true
        }
      })

      const subjectAllocation = subjects.map(subject => ({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        semester: subject.semester?.name || 'N/A',
        faculty: subject.faculty?.name || 'Unassigned',
        facultyId: subject.facultyId,
        isAssigned: !!subject.facultyId
      }))

      const unassignedSubjects = subjectAllocation.filter(s => !s.isAssigned)

      return NextResponse.json({
        yearWiseDistribution,
        sectionWiseStrength,
        riskStudents,
        topPerformers,
        subjectAllocation,
        unassignedSubjects
      })
    }
  } catch (error) {
    console.error('HOD Analytics API error:', error)
  }

  // Return demo data if no real data available
  return NextResponse.json({
    yearWiseDistribution: [
      { year: '1st Year', count: 120 },
      { year: '2nd Year', count: 115 },
      { year: '3rd Year', count: 108 },
      { year: '4th Year', count: 113 }
    ],
    sectionWiseStrength: [
      { section: 'Section A', count: 180 },
      { section: 'Section B', count: 165 },
      { section: 'Section C', count: 111 }
    ],
    riskStudents: [
      { id: 'r1', name: 'Harsh Vardhan', rollNo: 'CSE2108', cgpa: 5.8, attendance: 58, riskScore: 78, riskFactors: ['Low Attendance', 'Low CGPA', 'Multiple Backlogs'] },
      { id: 'r2', name: 'Deepak Yadav', rollNo: 'CSE2104', cgpa: 6.2, attendance: 65, riskScore: 65, riskFactors: ['Low Attendance', 'Low CGPA'] },
      { id: 'r3', name: 'Vikram Das', rollNo: 'CSE2203', cgpa: 6.8, attendance: 68, riskScore: 55, riskFactors: ['Low Attendance', 'Pending Assignments'] },
      { id: 'r4', name: 'Veer Kumar', rollNo: 'CSE2405', cgpa: 6.5, attendance: 72, riskScore: 45, riskFactors: ['Below Average CGPA'] }
    ],
    topPerformers: [
      { id: 't1', name: 'Neha Choudhury', rollNo: 'CSE2101', cgpa: 9.4, attendance: 98, achievements: ['Best Student Award', 'Hackathon Winner'] },
      { id: 't2', name: 'Aditya Rao', rollNo: 'CSE2201', cgpa: 9.2, attendance: 97, achievements: ['Research Publication'] },
      { id: 't3', name: 'Tanvi Agarwal', rollNo: 'CSE2107', cgpa: 9.1, attendance: 96, achievements: ['GATE Topper'] },
      { id: 't4', name: 'Diya Patel', rollNo: 'CSE2402', cgpa: 9.1, attendance: 95, achievements: ['Academic Excellence'] },
      { id: 't5', name: 'Sneha Verma', rollNo: 'CSE2303', cgpa: 9.0, attendance: 96, achievements: ['Coding Champion'] },
      { id: 't6', name: 'Shreya Bhattacharya', rollNo: 'CSE2103', cgpa: 9.0, attendance: 95, achievements: [] },
      { id: 't7', name: 'Aravind Menon', rollNo: 'CSE2102', cgpa: 8.9, attendance: 94, achievements: [] },
      { id: 't8', name: 'Pooja Nair', rollNo: 'CSE2305', cgpa: 8.9, attendance: 91, achievements: [] },
      { id: 't9', name: 'Ishita Reddy', rollNo: 'CSE2301', cgpa: 8.8, attendance: 94, achievements: [] },
      { id: 't10', name: 'Meera Krishnan', rollNo: 'CSE2204', cgpa: 8.7, attendance: 93, achievements: [] }
    ],
    subjectAllocation: [
      { id: 'sub1', name: 'Data Structures', code: 'CS301', semester: 'Semester 3', faculty: 'Dr. Sarah Johnson', facultyId: 'f1', isAssigned: true },
      { id: 'sub2', name: 'Algorithms', code: 'CS401', semester: 'Semester 4', faculty: 'Dr. Sarah Johnson', facultyId: 'f1', isAssigned: true },
      { id: 'sub3', name: 'Database Systems', code: 'CS302', semester: 'Semester 3', faculty: 'Prof. Robert Chen', facultyId: 'f2', isAssigned: true },
      { id: 'sub4', name: 'Big Data Analytics', code: 'CS501', semester: 'Semester 5', faculty: 'Prof. Robert Chen', facultyId: 'f2', isAssigned: true },
      { id: 'sub5', name: 'Machine Learning', code: 'CS601', semester: 'Semester 6', faculty: 'Dr. Emily Williams', facultyId: 'f3', isAssigned: true },
      { id: 'sub6', name: 'AI & Deep Learning', code: 'CS701', semester: 'Semester 7', faculty: 'Dr. Emily Williams', facultyId: 'f3', isAssigned: true },
      { id: 'sub7', name: 'Computer Networks', code: 'CS402', semester: 'Semester 4', faculty: 'Dr. James Miller', facultyId: 'f4', isAssigned: true },
      { id: 'sub8', name: 'Cloud Computing', code: 'CS602', semester: 'Semester 6', faculty: 'Dr. James Miller', facultyId: 'f4', isAssigned: true },
      { id: 'sub9', name: 'Web Technologies', code: 'CS303', semester: 'Semester 3', faculty: 'Prof. Lisa Anderson', facultyId: 'f5', isAssigned: true },
      { id: 'sub10', name: 'Operating Systems', code: 'CS403', semester: 'Semester 4', faculty: 'Dr. David Kumar', facultyId: 'f6', isAssigned: true },
      { id: 'sub11', name: 'System Programming', code: 'CS502', semester: 'Semester 5', faculty: 'Dr. David Kumar', facultyId: 'f6', isAssigned: true },
      { id: 'sub12', name: 'Software Engineering', code: 'CS503', semester: 'Semester 5', faculty: 'Dr. Priya Sharma', facultyId: 'f7', isAssigned: true },
      { id: 'sub13', name: 'Cybersecurity', code: 'CS603', semester: 'Semester 6', faculty: 'Prof. Ahmed Hassan', facultyId: 'f8', isAssigned: true },
      { id: 'sub14', name: 'Blockchain Technology', code: 'CS702', semester: 'Semester 7', faculty: 'Prof. Ahmed Hassan', facultyId: 'f8', isAssigned: true },
      { id: 'sub15', name: 'IoT & Embedded Systems', code: 'CS703', semester: 'Semester 7', faculty: 'Unassigned', facultyId: null, isAssigned: false },
      { id: 'sub16', name: 'Quantum Computing', code: 'CS801', semester: 'Semester 8', faculty: 'Unassigned', facultyId: null, isAssigned: false }
    ],
    unassignedSubjects: [
      { id: 'sub15', name: 'IoT & Embedded Systems', code: 'CS703', semester: 'Semester 7', faculty: 'Unassigned', facultyId: null, isAssigned: false },
      { id: 'sub16', name: 'Quantum Computing', code: 'CS801', semester: 'Semester 8', faculty: 'Unassigned', facultyId: null, isAssigned: false }
    ]
  })
}

function calculateRiskFactors(student: { cgpa?: number | null; attendancePercentage?: number | null }): string[] {
  const factors: string[] = []
  if ((student.cgpa || 0) < 6.5) factors.push('Low CGPA')
  if ((student.attendancePercentage || 0) < 75) factors.push('Low Attendance')
  return factors.length > 0 ? factors : ['Academic Concerns']
}
