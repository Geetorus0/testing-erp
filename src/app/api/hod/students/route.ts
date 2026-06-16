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
      const students = await db.student.findMany({
        where: { departmentId: hod.departmentId },
        include: {
          section: {
            include: {
              semester: true
            }
          },
          course: true,
          user: true
        }
      })

      const studentData = students.map(student => ({
        id: student.id,
        name: student.name,
        email: student.user?.email || student.email,
        rollNo: student.rollNo,
        section: student.section?.name || 'N/A',
        semester: student.section?.semester?.name || 'N/A',
        year: student.section?.semester?.number ? Math.ceil(student.section.semester.number / 2) : 1,
        cgpa: student.cgpa || 7.5,
        attendance: student.attendancePercentage || 85,
        placementStatus: student.placementStatus || 'NOT_PLACED',
        riskScore: student.riskScore || 25
      }))

      return NextResponse.json({ students: studentData })
    }
  } catch (error) {
    console.error('HOD Students API error:', error)
  }

  // Return demo data if no real data available
  return NextResponse.json({
    students: [
      // 1st Year Students
      { id: '1', name: 'Aarav Sharma', email: 'aarav.sharma@college.edu', rollNo: 'CSE2401', section: 'A', semester: 'Semester 1', year: 1, cgpa: 8.5, attendance: 92, placementStatus: 'NOT_PLACED', riskScore: 10 },
      { id: '2', name: 'Diya Patel', email: 'diya.patel@college.edu', rollNo: 'CSE2402', section: 'A', semester: 'Semester 1', year: 1, cgpa: 9.1, attendance: 95, placementStatus: 'NOT_PLACED', riskScore: 5 },
      { id: '3', name: 'Arjun Singh', email: 'arjun.singh@college.edu', rollNo: 'CSE2403', section: 'B', semester: 'Semester 1', year: 1, cgpa: 7.8, attendance: 88, placementStatus: 'NOT_PLACED', riskScore: 20 },
      { id: '4', name: 'Ananya Gupta', email: 'ananya.gupta@college.edu', rollNo: 'CSE2404', section: 'B', semester: 'Semester 2', year: 1, cgpa: 8.2, attendance: 90, placementStatus: 'NOT_PLACED', riskScore: 15 },
      { id: '5', name: 'Veer Kumar', email: 'veer.kumar@college.edu', rollNo: 'CSE2405', section: 'A', semester: 'Semester 2', year: 1, cgpa: 6.5, attendance: 72, placementStatus: 'NOT_PLACED', riskScore: 45 },

      // 2nd Year Students
      { id: '6', name: 'Ishita Reddy', email: 'ishita.reddy@college.edu', rollNo: 'CSE2301', section: 'A', semester: 'Semester 3', year: 2, cgpa: 8.8, attendance: 94, placementStatus: 'NOT_PLACED', riskScore: 8 },
      { id: '7', name: 'Karan Mehta', email: 'karan.mehta@college.edu', rollNo: 'CSE2302', section: 'A', semester: 'Semester 3', year: 2, cgpa: 7.2, attendance: 78, placementStatus: 'NOT_PLACED', riskScore: 35 },
      { id: '8', name: 'Sneha Verma', email: 'sneha.verma@college.edu', rollNo: 'CSE2303', section: 'B', semester: 'Semester 3', year: 2, cgpa: 9.0, attendance: 96, placementStatus: 'NOT_PLACED', riskScore: 5 },
      { id: '9', name: 'Rohan Joshi', email: 'rohan.joshi@college.edu', rollNo: 'CSE2304', section: 'B', semester: 'Semester 4', year: 2, cgpa: 7.5, attendance: 82, placementStatus: 'NOT_PLACED', riskScore: 25 },
      { id: '10', name: 'Pooja Nair', email: 'pooja.nair@college.edu', rollNo: 'CSE2305', section: 'A', semester: 'Semester 4', year: 2, cgpa: 8.9, attendance: 91, placementStatus: 'NOT_PLACED', riskScore: 12 },

      // 3rd Year Students
      { id: '11', name: 'Aditya Rao', email: 'aditya.rao@college.edu', rollNo: 'CSE2201', section: 'A', semester: 'Semester 5', year: 3, cgpa: 9.2, attendance: 97, placementStatus: 'NOT_PLACED', riskScore: 3 },
      { id: '12', name: 'Kavya Iyer', email: 'kavya.iyer@college.edu', rollNo: 'CSE2202', section: 'A', semester: 'Semester 5', year: 3, cgpa: 8.4, attendance: 89, placementStatus: 'NOT_PLACED', riskScore: 18 },
      { id: '13', name: 'Vikram Das', email: 'vikram.das@college.edu', rollNo: 'CSE2203', section: 'B', semester: 'Semester 5', year: 3, cgpa: 6.8, attendance: 68, placementStatus: 'NOT_PLACED', riskScore: 55 },
      { id: '14', name: 'Meera Krishnan', email: 'meera.krishnan@college.edu', rollNo: 'CSE2204', section: 'B', semester: 'Semester 6', year: 3, cgpa: 8.7, attendance: 93, placementStatus: 'NOT_PLACED', riskScore: 10 },
      { id: '15', name: 'Rahul Saxena', email: 'rahul.saxena@college.edu', rollNo: 'CSE2205', section: 'A', semester: 'Semester 6', year: 3, cgpa: 7.1, attendance: 75, placementStatus: 'NOT_PLACED', riskScore: 40 },

      // 4th Year Students
      { id: '16', name: 'Neha Choudhury', email: 'neha.choudhury@college.edu', rollNo: 'CSE2101', section: 'A', semester: 'Semester 7', year: 4, cgpa: 9.4, attendance: 98, placementStatus: 'PLACED', riskScore: 2 },
      { id: '17', name: 'Aravind Menon', email: 'aravind.menon@college.edu', rollNo: 'CSE2102', section: 'A', semester: 'Semester 7', year: 4, cgpa: 8.9, attendance: 94, placementStatus: 'PLACED', riskScore: 5 },
      { id: '18', name: 'Shreya Bhattacharya', email: 'shreya.bhatt@college.edu', rollNo: 'CSE2103', section: 'B', semester: 'Semester 7', year: 4, cgpa: 9.0, attendance: 95, placementStatus: 'PLACED', riskScore: 5 },
      { id: '19', name: 'Deepak Yadav', email: 'deepak.yadav@college.edu', rollNo: 'CSE2104', section: 'B', semester: 'Semester 7', year: 4, cgpa: 6.2, attendance: 65, placementStatus: 'NOT_PLACED', riskScore: 65 },
      { id: '20', name: 'Riya Malhotra', email: 'riya.malhotra@college.edu', rollNo: 'CSE2105', section: 'A', semester: 'Semester 8', year: 4, cgpa: 8.6, attendance: 92, placementStatus: 'PLACED', riskScore: 8 },
      { id: '21', name: 'Siddharth Kapoor', email: 'siddharth.kapoor@college.edu', rollNo: 'CSE2106', section: 'A', semester: 'Semester 8', year: 4, cgpa: 7.8, attendance: 85, placementStatus: 'PLACED', riskScore: 15 },
      { id: '22', name: 'Tanvi Agarwal', email: 'tanvi.agarwal@college.edu', rollNo: 'CSE2107', section: 'B', semester: 'Semester 8', year: 4, cgpa: 9.1, attendance: 96, placementStatus: 'PLACED', riskScore: 3 },
      { id: '23', name: 'Harsh Vardhan', email: 'harsh.vardhan@college.edu', rollNo: 'CSE2108', section: 'B', semester: 'Semester 8', year: 4, cgpa: 5.8, attendance: 58, placementStatus: 'NOT_PLACED', riskScore: 78 },
    ]
  })
}
